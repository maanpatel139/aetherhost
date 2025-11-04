from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: EmailStr
    username: str | None = None
    is_active: bool

    class Config:
        from_attributes = True  # Pydantic v2 compatible

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
