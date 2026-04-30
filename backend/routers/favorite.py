from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from dependencies import get_current_user
from models.user import User
from models.favorite import Favorite
from models.product import Product
from schemas.product import ProductResponse

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.post("/toggle/{product_id}")
def toggle_favorite(product_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fav = db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.product_id == product_id).first()
    if fav:
        db.delete(fav)
        db.commit()
        return {"status": "removed"}
    else:
        new_fav = Favorite(user_id=current_user.id, product_id=product_id)
        db.add(new_fav)
        db.commit()
        return {"status": "added"}

@router.get("/", response_model=List[ProductResponse])
def get_favorites(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    favorites = db.query(Product).join(Favorite).filter(Favorite.user_id == current_user.id).all()
    return favorites

@router.get("/ids", response_model=List[int])
def get_favorite_ids(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    ids = [f.product_id for f in db.query(Favorite.product_id).filter(Favorite.user_id == current_user.id).all()]
    return ids
