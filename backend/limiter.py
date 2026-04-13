from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from jose import jwt, JWTError


def _get_user_or_ip(request: Request) -> str:
    """Use JWT user ID as rate-limit key; fall back to IP if unauthenticated."""
    auth: str = request.headers.get("Authorization", "")
    if auth.startswith("Bearer "):
        token = auth[len("Bearer "):]
        try:
            from config import SECRET_KEY
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload.get("sub")
            if user_id:
                return f"user:{user_id}"
        except JWTError:
            pass
    return get_remote_address(request)


limiter = Limiter(key_func=_get_user_or_ip)
