from fastapi import APIRouter
from app.api.auth_routes import router as auth_router

router = APIRouter()
router.include_router(auth_router)

@router.get("/api/health", tags=["core"])
async def health_check():
    return {"status": "ok"}
