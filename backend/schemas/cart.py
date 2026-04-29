from pydantic import BaseModel, ConfigDict
from schemas.product import ProductResponse

# What the frontend sends when adding an item to the cart
class CartItemAdd(BaseModel):
    product_id: int
    quantity: int = 1

# What the backend returns (includes the product details nested inside)
class CartItemResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    quantity: int

    model_config = ConfigDict(from_attributes=True)
