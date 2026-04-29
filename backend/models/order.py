from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    total_amount = Column(Float, nullable=False)
    status = Column(String, default="PENDING") # PENDING, PAID, SHIPPED...

    # Let SQLAlchemy know there's a 1-to-Many relationship with OrderItems
    items = relationship("OrderItem")

class OrderItem(Base):
    """
    We need this table because an order is composed of multiple products!
    We save 'price_at_purchase' because product prices change over time, 
    but historical receipt orders should NEVER change their price.
    """
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    price_at_purchase = Column(Float, nullable=False)
