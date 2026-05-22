"""Authentication module: JWT + bcrypt, httpOnly cookies."""
import os
import bcrypt
import jwt
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from pydantic import BaseModel, EmailStr, Field
import uuid

JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours for e-commerce convenience
REFRESH_TOKEN_EXPIRE_DAYS = 30

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _secret() -> str:
    return os.environ["JWT_SECRET"]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str, remember: bool = False) -> str:
    delta = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS) if remember else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + delta,
        "type": "access",
    }
    return jwt.encode(payload, _secret(), algorithm=JWT_ALGORITHM)


def set_auth_cookie(response: Response, token: str, remember: bool = False) -> None:
    max_age = (60 * 60 * 24 * REFRESH_TOKEN_EXPIRE_DAYS) if remember else (60 * ACCESS_TOKEN_EXPIRE_MINUTES)
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=max_age,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie("access_token", path="/")


# Pydantic models
class RegisterIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=60)
    last_name: str = Field(min_length=1, max_length=60)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    marketing_opt_in: bool = False


class LoginIn(BaseModel):
    email: EmailStr
    password: str
    remember: bool = False


class UserOut(BaseModel):
    id: str
    first_name: str
    last_name: str
    email: EmailStr
    role: str = "customer"
    marketing_opt_in: bool = False
    created_at: str


class ChangePasswordIn(BaseModel):
    current_password: str
    new_password: str = Field(min_length=6, max_length=128)


class ForgotPasswordIn(BaseModel):
    email: EmailStr


class UpdateProfileIn(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None


def _user_to_out(doc: dict) -> dict:
    return {
        "id": doc["id"],
        "first_name": doc.get("first_name", ""),
        "last_name": doc.get("last_name", ""),
        "email": doc["email"],
        "role": doc.get("role", "customer"),
        "marketing_opt_in": doc.get("marketing_opt_in", False),
        "created_at": doc.get("created_at", ""),
    }


async def get_current_user(request: Request) -> dict:
    from server import db  # lazy import to avoid circular
    token = request.cookies.get("access_token")
    if not token:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token = auth_header[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    try:
        payload = jwt.decode(token, _secret(), algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/register", response_model=UserOut)
async def register(payload: RegisterIn, response: Response):
    from server import db
    email = payload.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")
    user_doc = {
        "id": str(uuid.uuid4()),
        "first_name": payload.first_name.strip(),
        "last_name": payload.last_name.strip(),
        "email": email,
        "password_hash": hash_password(payload.password),
        "role": "customer",
        "marketing_opt_in": payload.marketing_opt_in,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.users.insert_one(user_doc)
    token = create_access_token(user_doc["id"], email, remember=False)
    set_auth_cookie(response, token, remember=False)
    return _user_to_out(user_doc)


@router.post("/login", response_model=UserOut)
async def login(payload: LoginIn, response: Response):
    from server import db
    email = payload.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password.")
    token = create_access_token(user["id"], email, remember=payload.remember)
    set_auth_cookie(response, token, remember=payload.remember)
    return _user_to_out(user)


@router.post("/logout")
async def logout(response: Response):
    clear_auth_cookie(response)
    return {"ok": True}


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return _user_to_out(user)


@router.post("/forgot-password")
async def forgot_password(payload: ForgotPasswordIn):
    # Stub: always return success so we don't reveal which emails exist
    return {"ok": True, "message": "If the email exists, a reset link has been sent."}


@router.post("/change-password")
async def change_password(payload: ChangePasswordIn, user: dict = Depends(get_current_user)):
    from server import db
    full = await db.users.find_one({"id": user["id"]})
    if not full or not verify_password(payload.current_password, full.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Current password is incorrect.")
    await db.users.update_one({"id": user["id"]}, {"$set": {"password_hash": hash_password(payload.new_password)}})
    return {"ok": True}


@router.patch("/profile", response_model=UserOut)
async def update_profile(payload: UpdateProfileIn, user: dict = Depends(get_current_user)):
    from server import db
    updates = {}
    if payload.first_name is not None:
        updates["first_name"] = payload.first_name.strip()
    if payload.last_name is not None:
        updates["last_name"] = payload.last_name.strip()
    if payload.email is not None:
        new_email = payload.email.lower().strip()
        if new_email != user["email"]:
            existing = await db.users.find_one({"email": new_email})
            if existing:
                raise HTTPException(status_code=400, detail="That email is already in use.")
            updates["email"] = new_email
    if updates:
        await db.users.update_one({"id": user["id"]}, {"$set": updates})
    updated = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return _user_to_out(updated)
