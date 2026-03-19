from sqlalchemy.orm import Session
from database import SessionLocal
from models import Task
from datetime import datetime
import uuid


# ---------------------------------------------------
# SAVE SCHEDULE (Overwrite old schedule safely)
# ---------------------------------------------------

def save_schedule(user_id: int, schedule: dict):
    db: Session = SessionLocal()

    try:
        # 1️⃣ Delete old schedule for this user
        db.query(Task).filter(Task.user_id == user_id).delete()

        # 2️⃣ Insert new schedule tasks
        for slot, tasks in schedule.items():

            for task in tasks:

                new_task = Task(
                    id=str(uuid.uuid4()),
                    title=task.get("title"),
                    priority=task.get("priority"),
                    estimated_duration=task.get("estimated_duration", 60),
                    difficulty=task.get("difficulty", 3),
                    created_at=datetime.utcnow(),
                    slot=slot,
                    user_id=user_id
                )

                db.add(new_task)

        db.commit()

    except Exception as e:
        db.rollback()
        raise e

    finally:
        db.close()


# ---------------------------------------------------
# LOAD SCHEDULE (From Database)
# ---------------------------------------------------

def load_schedule(user_id: int):

    db: Session = SessionLocal()

    try:
        tasks = db.query(Task).filter(Task.user_id == user_id).all()

        if not tasks:
            return None

        schedule = {
            "morning": [],
            "afternoon": [],
            "evening": []
        }

        for task in tasks:

            if task.slot in schedule:
                schedule[task.slot].append({
                    "id": task.id,
                    "title": task.title,
                    "priority": task.priority,
                    "estimated_duration": task.estimated_duration,
                    "difficulty": task.difficulty,
                    "created_at": task.created_at.isoformat()
                })

        return schedule

    finally:
        db.close()