from sqlalchemy.orm import Session
from models import TaskLog
from database import SessionLocal

def compute_statistics(user_id: int):

    db: Session = SessionLocal()

    logs = db.query(TaskLog).filter(TaskLog.user_id == user_id).all()

    db.close()

    if not logs:
        return {}

    slot_stats = {}
    task_stats = {}

    for log in logs:
        slot = log.slot
        task = log.task_title.strip().lower()
        status = log.status

        if slot not in slot_stats:
            slot_stats[slot] = {"completed": 0, "missed": 0}

        if status == "completed":
            slot_stats[slot]["completed"] += 1
        else:
            slot_stats[slot]["missed"] += 1

        if task not in task_stats:
            task_stats[task] = {"completed": 0, "missed": 0}

        if status == "completed":
            task_stats[task]["completed"] += 1
        else:
            task_stats[task]["missed"] += 1

    slot_success = {
        slot: values["completed"] / (values["completed"] + values["missed"])
        for slot, values in slot_stats.items()
    }

    task_success = {
        task: values["completed"] / (values["completed"] + values["missed"])
        for task, values in task_stats.items()
    }

    return {
        "slot_success_rate": slot_success,
        "task_success_rate": task_success
    }