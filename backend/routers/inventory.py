from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from datetime import datetime, timedelta

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.product import Product
from models.order import Order, OrderItem
from models.review import Review

router = APIRouter(prefix="/inventory", tags=["Inventory Intelligence"])

@router.get("/notifications")
def get_admin_notifications(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # 1. Low stock count
    low_stock_count = db.query(Product).filter(Product.stock < 5).count()
    
    # 2. Latest 5 reviews
    latest_reviews = db.query(Review).order_by(Review.created_at.desc()).limit(5).all()
    
    return {
        "low_stock_count": low_stock_count,
        "latest_reviews": [{
            "id": r.id,
            "product": r.product.name,
            "rating": r.rating,
            "comment": r.comment,
            "user": r.user.email
        } for r in latest_reviews]
    }

@router.get("/low-stock")
def get_low_stock(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    # Items with stock < 5
    return db.query(Product).filter(Product.stock < 5).all()

@router.get("/analytics")
def get_inventory_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Revenue and Units sold per product
    stats = db.query(
        Product.name,
        Product.stock,
        func.sum(OrderItem.quantity).label("total_sold"),
        func.sum(OrderItem.quantity * OrderItem.price_at_purchase).label("total_revenue")
    ).join(OrderItem, Product.id == OrderItem.product_id, isouter=True)\
     .group_by(Product.id)\
     .order_by(desc("total_revenue")).all()

    return [
        {
            "name": s[0],
            "stock": s[1],
            "total_sold": s[2] or 0,
            "total_revenue": float(s[3] or 0)
        } for s in stats
    ]

@router.get("/prediction")
def get_demand_prediction(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Admin access required")

    # Simple Prediction: Avg units sold per day over last 7 days
    from datetime import timezone
    seven_days_ago = datetime.now(timezone.utc).replace(tzinfo=None) - timedelta(days=7)
    
    recent_sales = db.query(
        OrderItem.product_id,
        func.sum(OrderItem.quantity).label("qty_7d")
    ).join(Order)\
     .filter(Order.created_at >= seven_days_ago)\
     .group_by(OrderItem.product_id).all()

    sales_map = {s[0]: s[1] for s in recent_sales}
    products = db.query(Product).all()

    predictions = []
    for p in products:
        qty_7d = sales_map.get(p.id, 0)
        daily_velocity = qty_7d / 7.0
        
        days_left = 999 # Safe default
        if daily_velocity > 0:
            days_left = round(p.stock / daily_velocity, 1)
        
        predictions.append({
            "product_id": p.id,
            "name": p.name,
            "current_stock": p.stock,
            "daily_velocity": round(daily_velocity, 2),
            "predicted_stockout_days": days_left
        })

    return sorted(predictions, key=lambda x: x["predicted_stockout_days"])
