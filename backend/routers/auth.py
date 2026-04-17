from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
import httpx

from database import get_db
from crud.user import get_user_by_email
from crud.password_reset import create_reset_token, get_valid_token, consume_token
from security import verify_password, create_access_token
from config import RESEND_API_KEY, FRONTEND_URL
from limiter import limiter
from schemas.user import _validate_password_complexity

from fastapi.security import OAuth2PasswordRequestForm


router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


@router.post("/login")
@limiter.limit("10/minute")
def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, form_data.username)

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        )

    token = create_access_token({"sub": str(user.id)})

    return {
        "access_token": token,
        "token_type": "bearer",
    }


@router.post("/forgot-password", status_code=status.HTTP_200_OK)
@limiter.limit("3/hour")
def forgot_password(
    request: Request,
    body: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    user = get_user_by_email(db, body.email)

    if user:
        reset_token = create_reset_token(db, user.id)
        reset_url = f"{FRONTEND_URL}/reset-password?token={reset_token.token}"

        httpx.post(
            "https://api.resend.com/emails",
            headers={"Authorization": f"Bearer {RESEND_API_KEY}"},
            json={
                "from": "onboarding@resend.dev",
                "to": [user.email],
                "subject": "Restableix la teva contrasenya — lav-app",
                "html": f"""
                <p>Has sol·licitat restablir la contrasenya del teu compte a lav-app.</p>
                <p><a href="{reset_url}">Fes clic aquí per crear una nova contrasenya</a></p>
                <p>L'enllaç és vàlid durant 1 hora. Si no has fet aquesta sol·licitud, pots ignorar aquest correu.</p>
                """,
            },
        )

    # Always return 200 — never reveal whether the email exists
    return {"detail": "If this email exists, a reset link has been sent."}


@router.post("/reset-password", status_code=status.HTTP_200_OK)
@limiter.limit("5/hour")
def reset_password(
    request: Request,
    body: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    if len(body.new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Password must be at least 8 characters",
        )
    try:
        _validate_password_complexity(body.new_password)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(e),
        )

    token = get_valid_token(db, body.token)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token",
        )

    consume_token(db, token, body.new_password)
    return {"detail": "Password updated successfully"}
