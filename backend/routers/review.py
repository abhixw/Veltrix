from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from textblob import TextBlob

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.order import Order, OrderItem
from models.review import Review
from schemas.review import ReviewCreate, ReviewResponse

router = APIRouter(prefix="/reviews", tags=["Reviews"])

@router.get("/all", response_model=List[ReviewResponse])
def get_all_reviews(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Admin only")
    
    reviews = db.query(Review).order_by(Review.created_at.desc()).all()
    
    # Map to response with user email AND product name
    results = []
    for r in reviews:
        results.append(ReviewResponse(
            id=r.id,
            product_id=r.product_id,
            user_id=r.user_id,
            rating=r.rating,
            comment=r.comment,
            verified_purchase=r.verified_purchase,
            sentiment_score=r.sentiment_score,
            created_at=r.created_at,
            user_email=r.user.email,
            product_name=r.product.name # Need this for Admin Hub display
        ))
    return results

@router.get("/summary")
def get_reviews_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    count = db.query(Review).count()
    avg = db.query(func.avg(Review.rating)).scalar() or 0.0
    
    return {"avg": float(avg), "count": count}

@router.post("/{product_id}", response_model=ReviewResponse)
def create_review(product_id: int, review_in: ReviewCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # 1. Check if user already reviewed
    existing_review = db.query(Review).filter(Review.product_id == product_id, Review.user_id == current_user.id).first()
    if existing_review:
        raise HTTPException(status_code=400, detail="You have already reviewed this product")

    # 2. Check for Verified Purchase
    # If the user has at least one 'PAID' order containing this product ID
    has_bought = db.query(Order).join(OrderItem).filter(
        Order.user_id == current_user.id,
        Order.status == "PAID",
        OrderItem.product_id == product_id
    ).first() is not None

    # 3. Sentiment Analysis (AI Bonus)
    sentiment = 0.0
    if review_in.comment:
        blob = TextBlob(review_in.comment)
        sentiment = blob.sentiment.polarity # -1.0 to 1.0

    new_review = Review(
        product_id=product_id,
        user_id=current_user.id,
        rating=review_in.rating,
        comment=review_in.comment,
        verified_purchase=has_bought,
        sentiment_score=sentiment
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # Map to schema manually to include user email
    return ReviewResponse(
        id=new_review.id,
        product_id=new_review.product_id,
        user_id=new_review.user_id,
        rating=new_review.rating,
        comment=new_review.comment,
        verified_purchase=new_review.verified_purchase,
        sentiment_score=new_review.sentiment_score,
        created_at=new_review.created_at,
        user_email=current_user.email
    )

@router.get("/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(Review.created_at.desc()).all()
    
    # Map to response with user email
    results = []
    for r in reviews:
        results.append(ReviewResponse(
            id=r.id,
            product_id=r.product_id,
            user_id=r.user_id,
            rating=r.rating,
            comment=r.comment,
            verified_purchase=r.verified_purchase,
            sentiment_score=r.sentiment_score,
            created_at=r.created_at,
            user_email=r.user.email
        ))
    return results



@router.delete("/{review_id}")
def delete_review(review_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Admin only")
        
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
        
    db.delete(review)
    db.commit()
    return {"message": "Review removed by administrator"}


