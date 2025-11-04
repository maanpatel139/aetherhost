import time
import psycopg2
from psycopg2 import OperationalError
from fastapi import FastAPI
from app.api import compute_routes
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from app.api import terminal_routes, compute_routes, routes
from app.db.base import Base, engine
from app.db import models  # ensure models are imported so tables are created

# ---------------------
# Wait for Database
# ---------------------
def wait_for_db():
    retries = 10
    for attempt in range(retries):
        try:
            conn = psycopg2.connect(
                dbname="aetherhost",
                user="postgres",
                password="postgres",
                host="db",
                port="5432"
            )
            conn.close()
            print("✅ Database connection established!")
            return
        except OperationalError:
            print(f"⏳ Waiting for database... (attempt {attempt + 1}/{retries})")
            time.sleep(3)
    raise RuntimeError("Database not ready!")

wait_for_db()

print("📦 Loaded tables:", Base.metadata.tables.keys())


# ✅ Create tables automatically if they don't exist
Base.metadata.create_all(bind=engine)
print("🧱 Database tables ensured.")

# ---------------------
# FastAPI app
# ---------------------
app = FastAPI(title="AetherHost Cloud API", version="0.1")

# Allow frontend requests
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to AetherHost Cloud API"}

# ✅ Routers
app.include_router(router)
app.include_router(compute_routes.router)
print("✅ Compute routes loaded!")
for route in app.router.routes:
    if "compute" in str(route.path):
        print("→", route.path, route.methods)

app.include_router(terminal_routes.router)
