from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.product import Product
from models.cart import CartItem
from schemas.cart import CartItemAdd, CartItemResponse

router = APIRouter(prefix="/cart", tags=["Cart"])

@router.post("/", response_model=CartItemResponse)
def add_to_cart(
    item: CartItemAdd, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user) # ONLY ALLOW LOGGED IN USERS
):
    # 1. Verify the product actually exists in the catalog
    product = db.query(Product).filter(Product.id == item.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # 2. Check if this exact product is ALREADY inside this specific user's cart
    existing_item = db.query(CartItem).filter(
        CartItem.user_id == current_user.id,
        CartItem.product_id == item.product_id
    ).first()

    if existing_item:
        # If it exists, mathematically increase the quantity instead of making a duplicate row
        existing_item.quantity += item.quantity
        db.commit()
        db.refresh(existing_item)
        return existing_item
    else:
        # If it doesn't exist, we insert a fresh new cart row attached to the user mapping
        new_cart_item = CartItem(
            user_id=current_user.id,
            product_id=item.product_id,
            quantity=item.quantity
        )
        db.add(new_cart_item)
        db.commit()
        db.refresh(new_cart_item)
        return new_cart_item

@router.get("/", response_model=List[CartItemResponse])
def view_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Very simple querying: Because the endpoint is protected by Depends(get_current_user), 
    # we know EXACTLY whose cart to look for.
    cart_items = db.query(CartItem).filter(CartItem.user_id == current_user.id).all()
    return cart_items

@router.delete("/clear")
def clear_cart(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Cart cleared successfully"}

@router.delete("/{item_id}")
def remove_from_cart(item_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
    
    db.delete(cart_item)
    db.commit()
    return {"message": "Item natively removed from PostgreSQL"}

from schemas.cart import CartItemUpdate
@router.put("/{item_id}", response_model=CartItemResponse)
def update_cart_item(item_id: int, item_update: CartItemUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cart_item = db.query(CartItem).filter(CartItem.id == item_id, CartItem.user_id == current_user.id).first()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Cart item not found")
        
    if item_update.quantity <= 0:
        db.delete(cart_item) # Elegant fallback: if they decrement to 0, just delete the row!
        db.commit()
        raise HTTPException(status_code=204, detail="Item removed")
        
    cart_item.quantity = item_update.quantity
    db.commit()
    db.refresh(cart_item)
    return cart_item
