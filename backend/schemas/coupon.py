from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CouponBase(BaseModel):
    code: str
    discount_type: str
    discount_value: float
    usage_limit: int = 100
    expiry_date: Optional[datetime] = None

class CouponCreate(CouponBase):
    pass

class CouponResponse(CouponBase):
    id: int
    times_used: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class CouponApply(BaseModel):
    code: str
