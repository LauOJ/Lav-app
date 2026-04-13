import os
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from routers import users, wcs, reviews, auth, geocode

limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="WC Advisor API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_origins_env = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:4200,http://localhost:4201,http://localhost:8082,http://frontend:4200",
)
origins = [o.strip() for o in _origins_env.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(wcs.router)
app.include_router(reviews.router)
app.include_router(auth.router)
app.include_router(geocode.router)


@app.get("/")
def read_root():
    return {"message": "¡Hola! WC Advisor API funcionando"}
