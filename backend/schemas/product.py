from pydantic import BaseModel, ConfigDict
from typing import Optional

# Common properties that all products share
class ProductBase(BaseModel):
    name: str
    description: Optional[str] = None
    category: str = "General"
    price: float
    stock: int = 0

# Schema used when creating a product (we omit ID and image_url here because the DB handles ID, and the router handles the file upload)
class ProductCreate(ProductBase):
    pass

# Schema used to shape the final output returned from the database back to the frontend
class ProductResponse(ProductBase):
    id: int
    image_url: Optional[str] = None

    # This allows Pydantic to seamlessly convert the SQLAlchemy 'Product' database object into JSON
    model_config = ConfigDict(from_attributes=True)
