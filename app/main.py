from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .auth import router as auth_router
from .owner import router as owner_router
from .customers import router as customers_router
from .properties import router as properties_router
from .admin import router as admin_router


app = FastAPI(title="StayMadeSimple - Auth")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(owner_router)
app.include_router(customers_router)
app.include_router(properties_router)
app.include_router(admin_router)