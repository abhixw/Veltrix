from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from schemas.product import ProductResponse

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_purchase: float
    product: ProductResponse

    model_config = ConfigDict(from_attributes=True)

class CheckoutRequest(BaseModel):
    coupon_code: Optional[str] = None

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    original_amount: Optional[float] = None
    coupon_code: Optional[str] = None
    status: str
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
