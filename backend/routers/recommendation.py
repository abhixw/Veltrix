from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.product import Product
from models.order import Order, OrderItem
from models.recommendation import ViewHistory
from schemas.product import ProductResponse
from services.recommendation_service import get_semantic_recommendations

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.post("/view/{product_id}")
def log_view(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Step 1: Just log that the user viewed this product.
    """
    new_view = ViewHistory(user_id=current_user.id, product_id=product_id)
    db.add(new_view)
    db.commit()
    return {"message": "View logged"}

@router.get("/recently-viewed", response_model=List[ProductResponse])
def get_recently_viewed(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """
    Step 1: Get unique last 10 products viewed by the user.
    """
    # Get the subquery for unique product views to avoid duplicates in the 'Recent' list
    recent_vids = db.query(ViewHistory.product_id, func.max(ViewHistory.viewed_at).label('max_viewed'))\
                    .filter(ViewHistory.user_id == current_user.id)\
                    .group_by(ViewHistory.product_id)\
                    .order_by(desc('max_viewed'))\
                    .limit(10).all()
    
    product_ids = [v[0] for v in recent_vids]
    
    # Maintain order
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    products_map = {p.id: p for p in products}
    
    return [products_map[pid] for pid in product_ids if pid in products_map]

@router.get("/top-selling", response_model=List[ProductResponse])
def get_top_selling(db: Session = Depends(get_db)):
    """
    Step 1: Simple Ranking based on OrderItem counts.
    """
    top_items = db.query(OrderItem.product_id, func.sum(OrderItem.quantity).label('total_qty'))\
                  .group_by(OrderItem.product_id)\
                  .order_by(desc('total_qty'))\
                  .limit(8).all()
    
    product_ids = [item[0] for item in top_items]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    return products

@router.get("/co-occurrence/{product_id}", response_model=List[ProductResponse])
def get_co_occurrence(product_id: int, db: Session = Depends(get_db)):
    """
    Step 1: 'Users who bought this also bought' (Core Idea)
    Calculates products often found in the same orders as the target product.
    """
    # 1. Find all order IDs that contain the target product
    relevant_order_ids = [o.order_id for o in db.query(OrderItem.order_id).filter(OrderItem.product_id == product_id).all()]
    
    if not relevant_order_ids:
        return []
    
    # 2. Find other products in those same orders, count frequencies
    co_occurring = db.query(OrderItem.product_id, func.count(OrderItem.product_id).label('freq'))\
                     .filter(OrderItem.order_id.in_(relevant_order_ids))\
                     .filter(OrderItem.product_id != product_id)\
                     .group_by(OrderItem.product_id)\
                     .order_by(desc('freq'))\
                     .limit(4).all()
    
    product_ids = [item[0] for item in co_occurring]
    products = db.query(Product).filter(Product.id.in_(product_ids)).all()
    return products

@router.get("/collaborative/{product_id}", response_model=List[ProductResponse])
def get_collaborative_recommendations(product_id: int, db: Session = Depends(get_db)):
    """
    Step 2: Item-Based Collaborative Filtering (User-Product Matrix)
    Finds similar products based on shared customer bases using Jaccard Similarity.
    """
    # 1. Get all users who bought the target product
    users_x = set([o.user_id for o in db.query(Order).join(OrderItem).filter(OrderItem.product_id == product_id).all()])
    
    if not users_x:
        return []

    # 2. Find all other products bought by at least one of these users
    other_products_bought = db.query(OrderItem.product_id)\
                              .join(Order)\
                              .filter(Order.user_id.in_(list(users_x)))\
                              .filter(OrderItem.product_id != product_id)\
                              .distinct().all()
    
    similarities = []
    
    for (pid,) in other_products_bought:
        # 3. Get all users who bought product Y
        users_y = set([o.user_id for o in db.query(Order).join(OrderItem).filter(OrderItem.product_id == pid).all()])
        
        # 4. Calculate Jaccard Similarity
        intersection = len(users_x.intersection(users_y))
        union = len(users_x.union(users_y))
        
        score = intersection / union if union > 0 else 0
        similarities.append((pid, score))
    
    # 5. Rank by similarity score
    similarities.sort(key=lambda x: x[1], reverse=True)
    top_pids = [item[0] for item in similarities[:4]]
    
    products = db.query(Product).filter(Product.id.in_(top_pids)).all()
    return products

@router.get("/semantic/{product_id}", response_model=List[ProductResponse])
def get_semantic_recommendations_endpoint(product_id: int, db: Session = Depends(get_db)):
    """
    Step 3: Semantic Recommendations
    Finds products that are conceptually similar based on their text descriptions.
    """
    target = db.query(Product).filter(Product.id == product_id).first()
    if not target:
        return []
        
    all_products = db.query(Product).all()
    return get_semantic_recommendations(target, all_products)
