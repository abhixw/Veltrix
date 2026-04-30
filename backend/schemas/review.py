from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional

class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    user_id: int
    rating: int
    comment: Optional[str]
    verified_purchase: bool
    sentiment_score: float
    created_at: datetime
    user_email: str
    product_name: Optional[str] = None # For Admin Hub display

    model_config = ConfigDict(from_attributes=True)
