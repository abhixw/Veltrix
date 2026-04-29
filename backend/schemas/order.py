from pydantic import BaseModel, ConfigDict
from typing import List
from schemas.product import ProductResponse

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_purchase: float
    product: ProductResponse

    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: int
    user_id: int
    total_amount: float
    status: str
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
