from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.product import Product
from models.cart import CartItem
from models.order import Order, OrderItem
from models.coupon import Coupon
from schemas.order import OrderResponse, CheckoutRequest
from datetime import datetime, timezone

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post("/checkout", response_model=OrderResponse)
def checkout(
    request: CheckoutRequest,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Fetch the user's cart
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    if not cart_items:
        raise HTTPException(status_code=400, detail="Your cart is completely empty")

    total_amount = 0.0
    order_items_to_create = []

    # 2. Loop through the cart to verify stock and calculate the final price
    for item in cart_items:
        # .with_for_update() is a database lock! It prevents another user from buying 
        # the exact same product a split-second before this transaction finishes.
        product = db.query(Product).filter(Product.id == item.product_id).with_for_update().first()
        
        if not product:
            raise HTTPException(status_code=400, detail=f"Product {item.product_id} no longer exists")
        
        if product.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name}. Only {product.stock} left.")

        # 3. Mathematically deduct the stock from inventory
        product.stock -= item.quantity
        total_amount += (product.price * item.quantity)

        # 4. Snapshot the item
        new_order_item = OrderItem(
            product_id=product.id,
            quantity=item.quantity,
            price_at_purchase=product.price
        )
        order_items_to_create.append(new_order_item)

    # 5. Apply Coupon if provided
    final_amount = total_amount
    original_amount = total_amount
    applied_coupon = None

    if request.coupon_code:
        coupon = db.query(Coupon).filter(Coupon.code == request.coupon_code.upper(), Coupon.is_active == True).first()
        if coupon:
            # Re-validate here for safety during transaction
            if not(coupon.expiry_date and coupon.expiry_date < datetime.now(timezone.utc)) and (coupon.times_used < coupon.usage_limit):
                if coupon.discount_type == 'percentage':
                    discount = (total_amount * coupon.discount_value) / 100
                    final_amount = total_amount - discount
                elif coupon.discount_type == 'flat':
                    final_amount = max(0, total_amount - coupon.discount_value)
                
                coupon.times_used += 1
                applied_coupon = coupon.code

    # 6. Generate the final Master Order
    new_order = Order(
        user_id=current_user.id,
        total_amount=final_amount,
        original_amount=original_amount,
        coupon_code=applied_coupon,
        status="CONFIRMED", # Defaulting to confirmed as per recent model change
        items=order_items_to_create 
    )
    db.add(new_order)

    # 6. Clear out their shopping cart since they bought the items
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()

    # 7. COMMIT TRANSACTION
    # Up to this exact moment, NOTHING has been saved! If an error happened at step 2,
    # the entire process rolls back instantly. Only when db.commit() fires does it all go through.
    db.commit()
    db.refresh(new_order)
    return new_order

@router.get("/", response_model=List[OrderResponse])
def get_orders(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.id.desc()).all()
    return orders

@router.get("/{order_id}", response_model=OrderResponse)
def get_order(order_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
