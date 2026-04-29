from pydantic import BaseModel, ConfigDict
from typing import List

# A single line item inside the receipt 
class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    price_at_purchase: float

    model_config = ConfigDict(from_attributes=True)

# The overall receipt that contains all the line items
class OrderResponse(BaseModel):
    id: int
    total_amount: float
    status: str
    items: List[OrderItemResponse] = []

    model_config = ConfigDict(from_attributes=True)
