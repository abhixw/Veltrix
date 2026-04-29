from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import shutil
import uuid

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.product import Product
from schemas.product import ProductResponse

router = APIRouter(prefix="/products", tags=["Products"])

# Directory where we will save our uploaded product images
UPLOAD_DIR = "uploads/images"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ProductResponse)
def create_product(
    name: str = Form(...),
    description: Optional[str] = Form(None),
    price: float = Form(...),
    stock: int = Form(0),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # RBAC SECURITY CHECK
    if current_user.role != "manager":
        raise HTTPException(status_code=403, detail="Unauthorized. Strictly managers only.")

    image_url = None

    if image:
        # 1. Generate a universally unique filename (UUID) to prevent overwriting
        file_extension = image.filename.split(".")[-1]
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)

        # 2. Open our local file system and save the actual image bytes to the drive
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        
        # 3. Create the static URL string path to save inside PostgreSQL
        image_url = f"/static/images/{unique_filename}"

    # 4. Insert the new product into the database!
    new_product = Product(
        name=name,
        description=description,
        price=price,
        stock=stock,
        image_url=image_url
    )
    db.add(new_product)
    db.commit()
    db.refresh(new_product)

    return new_product

@router.get("/", response_model=List[ProductResponse])
def get_products(db: Session = Depends(get_db)):
    products = db.query(Product).all()
    return products
