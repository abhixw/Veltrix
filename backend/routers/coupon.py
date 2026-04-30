from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.coupon import Coupon
from schemas.coupon import CouponResponse, CouponApply, CouponCreate

router = APIRouter(prefix="/coupons", tags=["Coupons"])

@router.post("/validate", response_model=CouponResponse)
def validate_coupon(apply_in: CouponApply, db: Session = Depends(get_db)):
    coupon = db.query(Coupon).filter(Coupon.code == apply_in.code.upper(), Coupon.is_active == True).first()
    
    if not coupon:
        raise HTTPException(status_code=404, detail="Coupon not found or inactive")

    # Check expiry
    if coupon.expiry_date and coupon.expiry_date < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Coupon has expired")

    # Check usage limits
    if coupon.times_used >= coupon.usage_limit:
        raise HTTPException(status_code=400, detail="Coupon usage limit reached")

    return coupon

# For Admin: Create a coupon
@router.post("/create", response_model=CouponResponse)
def create_coupon(coupon_in: CouponCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Admin only")
    
    new_coupon = Coupon(
        code=coupon_in.code.upper(),
        discount_type=coupon_in.discount_type,
        discount_value=coupon_in.discount_value,
        usage_limit=coupon_in.usage_limit,
        expiry_date=coupon_in.expiry_date
    )
    db.add(new_coupon)
    db.commit()
    db.refresh(new_coupon)
    return new_coupon
