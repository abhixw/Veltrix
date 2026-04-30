from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.sql import func
from database import Base

class ViewHistory(Base):
    """
    Tracks which users viewed which products and when.
    Essential for 'Recently Viewed' and personalization.
    """
    __tablename__ = "view_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    viewed_at = Column(DateTime(timezone=True), server_default=func.now())
