from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import jwt, JWTError

from database import get_db
from models.user import User

# IMPORTANT: We extract SECRET_KEY and ALGORITHM to decode the token.
from services.auth_service import SECRET_KEY, ALGORITHM

# This tells FastAPI that the token should be sent via the standard 'Authorization: Bearer <token>' header
# It also helps FastAPI generate the built-in Swagger UI lock button properly
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Dependency that intercepts every incoming request that requires authentication,
    extracts the JWT token, decodes it, and retrieves the User from the database.
    """
    try:
        # Decode the token using our secret key
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid auth credentials")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid auth credentials")
        
    # Query database to get the actual user model instance
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User securely not found")
        
    return user
