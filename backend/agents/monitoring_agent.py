from sqlalchemy.orm import Session
from models import TaskLog
from database import SessionLocal

def log_task(user_id: int, task: str, status: str, slot: str):

    db: Session = SessionLocal()

    new_log = TaskLog(
        task_title=task,
        status=status,
        slot=slot,
        user_id=user_id
    )

    db.add(new_log)
    db.commit()
    db.close()