from fastapi import FastAPI
from database import engine, Base
import os
from fastapi.staticfiles import StaticFiles
from models.user import User
from models.product import Product
from models.cart import CartItem
from models.order import Order, OrderItem
from models.recommendation import ViewHistory
from models.review import Review
from models.favorite import Favorite
from models.coupon import Coupon
from routers.auth import router as auth_router
from routers.product import router as product_router
from routers.cart import router as cart_router
from routers.order import router as order_router
from routers.recommendation import router as recommendation_router
from routers.review import router as review_router
from routers.favorite import router as favorite_router
from routers.inventory import router as inventory_router
from routers.coupon import router as coupon_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS Middleware to allow React to communicate with our Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

os.makedirs("uploads/images", exist_ok=True)
app.mount("/static", StaticFiles(directory="uploads"), name="static")

app.include_router(auth_router)
app.include_router(product_router)
app.include_router(cart_router)
app.include_router(order_router)
app.include_router(recommendation_router)
app.include_router(review_router)
app.include_router(favorite_router)
app.include_router(inventory_router)
app.include_router(coupon_router)