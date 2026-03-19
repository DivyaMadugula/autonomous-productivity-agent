from sqlalchemy.orm import Session
from database import SessionLocal
from models import TaskLog


def generate_dashboard(user_id: int):

    db: Session = SessionLocal()

    try:
        logs = db.query(TaskLog).filter(TaskLog.user_id == user_id).all()

        if not logs:
            return {
                "total_tasks": 0,
                "completed_tasks": 0,
                "missed_tasks": 0,
                "completion_rate": 0,
                "best_slot": None,
                "worst_slot": None,
                "ai_summary": "No activity yet. Start completing tasks!"
            }

        total = len(logs)
        completed = sum(1 for log in logs if log.status == "completed")
        missed = sum(1 for log in logs if log.status == "missed")

        completion_rate = round(completed / total, 2)

        # Slot performance
        slot_stats = {}

        for log in logs:
            if log.slot not in slot_stats:
                slot_stats[log.slot] = {"completed": 0, "total": 0}

            slot_stats[log.slot]["total"] += 1

            if log.status == "completed":
                slot_stats[log.slot]["completed"] += 1

        slot_success = {
            slot: (
                round(data["completed"] / data["total"], 2)
                if data["total"] > 0 else 0
            )
            for slot, data in slot_stats.items()
        }

        best_slot = max(slot_success, key=slot_success.get)
        worst_slot = min(slot_success, key=slot_success.get)

        # Simple AI summary logic
        if completion_rate > 0.75:
            summary = "Excellent productivity! Keep maintaining your consistency."
        elif completion_rate > 0.5:
            summary = "Good progress. Try improving performance in weaker slots."
        else:
            summary = "Productivity needs improvement. Consider adjusting task difficulty or timing."

        return {
            "total_tasks": total,
            "completed_tasks": completed,
            "missed_tasks": missed,
            "completion_rate": completion_rate,
            "best_slot": best_slot,
            "worst_slot": worst_slot,
            "ai_summary": summary
        }

    finally:
        db.close()