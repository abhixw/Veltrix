from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from schemas.user import UserCreate, Token
from services.auth_service import hash_password, verify_password, create_access_token

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        print("STEP 1: checking existing user")

        existing_user = db.query(User).filter(User.email == user.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        print("STEP 2: hashing password")
        hashed = hash_password(user.password)

        print("STEP 3: creating user object")
        new_user = User(email=user.email, password_hash=hashed, role=user.role)

        print("STEP 4: adding to DB")
        db.add(new_user)

        print("STEP 5: committing")
        db.commit()

        print("STEP 6: refreshing")
        db.refresh(new_user)

        return {"message": "User registered successfully"}

    except Exception as e:
        print("ERROR OCCURRED:", e)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == form_data.username).first()

    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    if not verify_password(form_data.password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})

    return {
        "access_token": token,
        "token_type": "bearer",
        "role": db_user.role
    }