from fastapi import APIRouter, Depends
from pydantic import BaseModel
from agents.assistant_agent import generate_response
from auth import get_current_user
from models import User

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

@router.post("/assistant")
def chat(request: ChatRequest, current_user: User = Depends(get_current_user)):
    reply = generate_response(request.message)

    return {
        "user": current_user.email,
        "message": request.message,
        "reply": reply
    }