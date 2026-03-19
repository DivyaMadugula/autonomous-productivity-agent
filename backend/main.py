# ===== GOOGLE OAUTH CONFIG =====
import os

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

REDIRECT_URI = "http://localhost:8000/auth/google/callback"

SCOPES = ["https://www.googleapis.com/auth/calendar"]
import os
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.requests import Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from collections import defaultdict
from datetime import datetime,date
import uuid
from database import engine, SessionLocal
from models import Base, Task, User, TaskLog,Goal
from auth import (
    authenticate_user,
    create_access_token,
    hash_password,
    get_current_user
)
from agents.planning_agent import generate_tasks
from agents.scheduling_agent import create_schedule

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DB Dependency ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- Error Handler ----------------
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "data": None,
            "error": str(exc)
        }
    )


# ---------------- REGISTER ----------------
@app.post("/register")
def register(email: str, password: str, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already exists")

    new_user = User(
        email=email,
        password=hash_password(password)
    )

    db.add(new_user)
    db.commit()

    return {"message": "User registered successfully"}

# ---------------- LOGIN ----------------
@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(),
          db: Session = Depends(get_db)):

    user = authenticate_user(form_data.username, form_data.password)

    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(
        data={"sub": str(user.id)}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

# ---------------- GOAL ----------------
from models import Goal, Task
import uuid

from models import Goal, Task
import uuid

@app.post("/goal")
def process_goal(goal: str, due_date: datetime = None,
                 current_user: User = Depends(get_current_user),
                 db: Session = Depends(get_db)):

    # 1️⃣ Create Goal
    new_goal = Goal(
        title=goal,
        description=goal,
        user_id=current_user.id,
        due_date=due_date
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    # 2️⃣ Generate AI tasks
    tasks = generate_tasks(goal)
    schedule = create_schedule(tasks)

    if "schedule" in schedule:
        schedule = schedule["schedule"]

    # 3️⃣ Save new tasks
    for slot, slot_tasks in schedule.items():
        for task in slot_tasks:

            if isinstance(task, str):
                title = task
                priority = 2
                duration = 60
                difficulty = 3
                task_id = str(uuid.uuid4())

            elif isinstance(task, dict):
                title = task.get("title", "Untitled Task")
                priority = task.get("priority", 2)
                duration = task.get("estimated_duration", 60)
                difficulty = task.get("difficulty", 3)
                task_id = task.get("id", str(uuid.uuid4()))

            else:
                continue

            new_task = Task(
                id=task_id,
                title=title,
                priority=priority,
                estimated_duration=duration,
                difficulty=difficulty,
                user_id=current_user.id,
                goal_id=new_goal.id,
                slot=slot,
                status="pending"
            )

            db.add(new_task)

    db.commit()

    # ==================================================
    # 🔥 GLOBAL REBALANCING WITH PERFORMANCE PRIORITY
    # ==================================================

    all_tasks = db.query(Task).filter(
        Task.user_id == current_user.id
    ).all()

    MAX_TASKS_PER_SLOT = 5
    MAX_DIFFICULTY_PER_SLOT = 15

    # --------- Calculate Slot Performance ---------
    logs = db.query(TaskLog).filter(
        TaskLog.user_id == current_user.id
    ).all()

    slot_totals = {
        "morning": {"completed": 0, "total": 0},
        "afternoon": {"completed": 0, "total": 0},
        "evening": {"completed": 0, "total": 0}
    }

    for log in logs:
        if log.slot in slot_totals:
            slot_totals[log.slot]["total"] += 1
            if log.status == "completed":
                slot_totals[log.slot]["completed"] += 1

    slot_rates = {}
    for slot in slot_totals:
        total = slot_totals[slot]["total"]
        completed = slot_totals[slot]["completed"]
        slot_rates[slot] = int((completed / total) * 100) if total > 0 else 0

    # 🔥 Sort slots by performance (best first)
    # If no performance data, distribute evenly
    SLOTS = sorted(slot_rates, key=slot_rates.get, reverse=True)
    # --------- Reset distribution trackers ---------
    slot_task_count = {slot: 0 for slot in SLOTS}
    slot_difficulty_sum = {slot: 0 for slot in SLOTS}

    # --------- Sort tasks by importance ---------
    # --------- Deadline Boost Logic ---------

    def deadline_weight(task):
        if not task.goal or not task.goal.due_date:
            return 0

        days_left = (task.goal.due_date - datetime.utcnow()).days

        if days_left <= 2:
            return 3
        elif days_left <= 5:
            return 2
        elif days_left <= 10:
            return 1
        else:
            return 0


    # --------- Sort tasks with deadline boost ---------
    sorted_tasks = sorted(
        all_tasks,
        key=lambda t: (
            -(t.priority + deadline_weight(t)),   # 🔥 boosted priority
            -t.difficulty,
            t.created_at
        )
    )

    # --------- Reassign tasks globally ---------
    for task in sorted_tasks:

        for slot in SLOTS:

            if slot_task_count[slot] >= MAX_TASKS_PER_SLOT:
                continue

            if slot_difficulty_sum[slot] + (task.difficulty or 0) > MAX_DIFFICULTY_PER_SLOT:
                continue

            task.slot = slot
            slot_task_count[slot] += 1
            slot_difficulty_sum[slot] += task.difficulty or 0
            break

    db.commit()

    return {
        "goal_analysis": goal,
        "schedule": schedule,
        "slot_performance_used_for_distribution": slot_rates
    }
# ---------------- UPDATE TASK ----------------
@app.post("/update_task")
def update_task(task_id: str,
                status: str,
                current_user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # ---------------- UPDATE STATUS ----------------
    task.status = status

    # ---------------- LOG ACTIVITY ----------------
    log = TaskLog(
        user_id=current_user.id,
        task_title=task.title,
        status=status,
        slot=task.slot,
        timestamp=datetime.utcnow()
    )
    db.add(log)
    db.commit()

    # ---------------- CALCULATE SLOT PERFORMANCE ----------------
    logs = db.query(TaskLog).filter(
        TaskLog.user_id == current_user.id
    ).all()

    slot_stats = {
        "morning": {"completed": 0, "total": 0},
        "afternoon": {"completed": 0, "total": 0},
        "evening": {"completed": 0, "total": 0}
    }

    now = datetime.utcnow()

    for log in logs:
        if log.slot not in slot_stats:
            continue

        days_old = (now - log.timestamp).days

        if days_old <= 3:
            weight = 1.5
        elif days_old <= 7:
            weight = 1.0
        else:
            weight = 0.5

        slot_stats[log.slot]["total"] += weight

        if log.status == "completed":
            slot_stats[log.slot]["completed"] += weight

    slot_rates = {}
    confidence_scores = {}

    for slot, data in slot_stats.items():
        total = data["total"]
        completed = data["completed"]

        rate = int((completed / total) * 100) if total > 0 else 0
        slot_rates[slot] = rate

        raw_logs = len([l for l in logs if l.slot == slot])
        confidence_scores[slot] = min(100, raw_logs * 10)

    best_slot = max(slot_rates, key=slot_rates.get)

    # ---------------- MISSED LOGIC ----------------
    avoidance_message = None

    if status.lower() == "missed":

        task.miss_count += 1

        # Escalate priority
        if task.miss_count >= 2:
            task.priority += 1

        # Force best slot after 3 misses
        if task.miss_count >= 3:
            task.slot = best_slot

        # -------- AVOIDANCE DETECTION --------
        missed_tasks = db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.status == "missed"
        ).all()

        keyword_counter = {}

        for t in missed_tasks:
            words = t.title.lower().split()
            for w in words:
                if len(w) > 3:
                    keyword_counter[w] = keyword_counter.get(w, 0) + 1

        avoidance_keywords = [
            k for k, v in keyword_counter.items() if v >= 3
        ]

        if avoidance_keywords:
            avoidance_message = (
                "You seem to be consistently avoiding tasks related to: "
                + ", ".join(avoidance_keywords)
            )

    db.commit()

    suggested_slot = None
    suggestion_reason = None

    if status.lower() == "missed" and task.slot != best_slot:
        suggested_slot = best_slot
        suggestion_reason = (
            f"You complete {slot_rates[best_slot]}% of tasks in {best_slot}, "
            f"which is higher than current slot."
        )

    return {
        "message": "Task updated successfully",
        "task_id": task.id,
        "new_status": task.status,
        "current_slot": task.slot,
        "suggested_slot": suggested_slot,
        "suggestion_reason": suggestion_reason,
        "weighted_slot_performance": slot_rates,
        "confidence_scores": confidence_scores
    }
# ---------------- DASHBOARD ----------------
@app.get("/dashboard")
def dashboard(current_user: User = Depends(get_current_user),
              db: Session = Depends(get_db)):

    today = date.today()

    # 🔥 DAILY RESET CHECK
    # 🔥 DAILY RESET CHECK (FIXED)
    if current_user.last_reset_date < today:

        tasks = db.query(Task).filter(
            Task.user_id == current_user.id,
            Task.status == "pending"
        ).all()

        for task in tasks:
            # Only mark tasks older than today
            if task.created_at.date() < today:
                task.status = "missed"
                task.miss_count += 1

        current_user.last_reset_date = today
        db.commit()

    # -------- GET ALL USER TASKS ----------
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id
    ).all()

    today_pending = []
    today_completed = []
    today_missed = []

    for t in tasks:
        task_data = {
            "id": t.id,
            "title": t.title,
            "slot": t.slot,
            "status": t.status
        }

        if t.status == "pending":
            today_pending.append(task_data)

        elif t.status == "completed":
            today_completed.append(task_data)

        elif t.status == "missed":
            today_missed.append(task_data)

    total = len(tasks)
    completed = len(today_completed)
    pending = len(today_pending)
    missed = len(today_missed)

    completion_rate = int((completed / total) * 100) if total else 0

    # -------- BEST SLOT ----------
    slot_scores = {"morning": 0, "afternoon": 0, "evening": 0}

    for t in tasks:
        if t.status == "completed":
            slot_scores[t.slot] += 1

    best_slot = max(slot_scores, key=slot_scores.get)

    return {
        "success": True,
        "data": {
            "today_pending_tasks": today_pending,
            "today_completed_tasks": today_completed,
            "today_missed_tasks": today_missed,
            "completed_tasks": completed,
            "pending_tasks": pending,
            "missed_tasks": missed,
            "total_tasks": total,
            "completion_rate": completion_rate,
            "best_slot": best_slot
        }
    }
# ---------------- ANALYTICS ----------------
@app.get("/analytics")
def analytics(current_user: User = Depends(get_current_user),
              db: Session = Depends(get_db)):

    today = datetime.utcnow().date()
    start_date = today - timedelta(days=6)

    logs = db.query(TaskLog).filter(
        TaskLog.user_id == current_user.id,
        TaskLog.timestamp >= start_date
    ).all()

    # ---------------- WEEKLY PRODUCTIVITY ----------------

    week_data = {}
    for i in range(7):
        day = start_date + timedelta(days=i)
        week_data[day] = {"completed": 0, "total": 0}

    for log in logs:
        log_day = log.timestamp.date()
        if log_day in week_data:
            week_data[log_day]["total"] += 1
            if log.status == "completed":
                week_data[log_day]["completed"] += 1

    weekly_productivity = []

    for day in sorted(week_data.keys()):
        values = week_data[day]
        total = values["total"]
        completed = values["completed"]

        percent = int((completed / total) * 100) if total else 0

        weekly_productivity.append({
            "day": day.strftime("%a"),
            "value": percent
        })

    # ---------------- STATS ----------------

    total_logs = len(logs)
    completed_logs = len([l for l in logs if l.status == "completed"])

    avg_completion = int((completed_logs / total_logs) * 100) if total_logs else 0

    best_day = max(weekly_productivity, key=lambda x: x["value"])["day"] if weekly_productivity else "N/A"

    # ---------------- PROPER 7x7 HEATMAP ----------------
    # Row 0 = Mon ... Row 6 = Sun

    weekday_counts = [0] * 7  # Mon=0, Tue=1 ... Sun=6

    for log in logs:
        if log.status == "completed":
            weekday_index = log.timestamp.weekday()
            weekday_counts[weekday_index] += 1

    heatmap = []

    for row in range(7):  # Mon → Sun
        completed_count = weekday_counts[row]

        for col in range(7):
            # Gradual intensity spread
            intensity = completed_count - col
            if intensity <= 0:
                heatmap.append(0)
            else:
                heatmap.append(min(4, intensity))

    # ---------------- SLOT PERFORMANCE ----------------

    slot_stats = {"morning": 0, "afternoon": 0, "evening": 0}

    for log in logs:
        if log.status == "completed":
            slot_stats[log.slot] += 1

    best_slot = max(slot_stats, key=slot_stats.get) if completed_logs else "N/A"

    return {
        "avg_completion_rate": avg_completion,
        "weekly_focus_hours": total_logs,
        "goals_achieved": completed_logs,
        "best_day": best_day,
        "weekly_productivity": weekly_productivity,
        "heatmap": heatmap,
        "insights": {
            "peak_hours": best_slot.capitalize(),
            "task_pattern": "You complete more tasks in your strongest slot.",
            "weekly_trend": f"Best day is {best_day}"
        }
    }
@app.delete("/delete_task")
def delete_task(task_id: str,
                current_user: User = Depends(get_current_user),
                db: Session = Depends(get_db)):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()

    return {"message": "Task removed successfully"}
@app.get("/goals")
def get_goals(current_user: User = Depends(get_current_user),
              db: Session = Depends(get_db)):

    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).all()

    result = []

    for goal in goals:

        total_tasks = len(goal.tasks)

        # 🔥 AUTO DELETE EMPTY GOALS
        if total_tasks == 0:
            db.delete(goal)
            continue

        completed_tasks = len([
            t for t in goal.tasks if t.status == "completed"
        ])

        progress = int((completed_tasks / total_tasks) * 100)

        result.append({
            "id": goal.id,
            "title": goal.title,
            "description": goal.description,
            "due_date": goal.due_date,
            "total_tasks": total_tasks,
            "completed_tasks": completed_tasks,
            "progress": progress
        })

    db.commit()

    return result
@app.get("/schedule")
def get_schedule(
    selected_date: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    query = db.query(Task).filter(
        Task.user_id == current_user.id
    )

    # If date is provided → filter by created_at date
    if selected_date:
        selected_date_obj = datetime.strptime(selected_date, "%Y-%m-%d").date()

        query = query.filter(
            Task.created_at >= datetime.combine(selected_date_obj, datetime.min.time()),
            Task.created_at <= datetime.combine(selected_date_obj, datetime.max.time())
        )

    tasks = query.all()

    schedule = {
        "morning": [],
        "afternoon": [],
        "evening": []
    }

    for task in tasks:
        schedule[task.slot].append({
            "id": task.id,
            "title": task.title,
            "status": task.status,
            "priority": task.priority,
            "difficulty": task.difficulty
        })

    return schedule
@app.post("/retry_task")
def retry_task(task_id: str,
               current_user: User = Depends(get_current_user),
               db: Session = Depends(get_db)):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.status = "pending"

    # 🔥 Reset retry properly
    task.miss_count = 0
    task.created_at = datetime.utcnow()  # treat as new task

    db.commit()

    return {"message": "Task moved back to active schedule"}
@app.get("/goal/{goal_id}")
def get_goal_detail(goal_id: int,
                    current_user: User = Depends(get_current_user),
                    db: Session = Depends(get_db)):

    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    tasks = db.query(Task).filter(
        Task.goal_id == goal_id,
        Task.user_id == current_user.id
    ).all()

    task_list = []

    for t in tasks:
        task_list.append({
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "slot": t.slot,
            "priority": t.priority,
            "miss_count": t.miss_count
        })

    return {
        "goal": {
            "id": goal.id,
            "title": goal.title,
            "description": goal.description,
            "due_date": goal.due_date
        },
        "tasks": task_list
    }
@app.post("/accept_suggestion")
def accept_suggestion(task_id: str,
                      new_slot: str,
                      current_user: User = Depends(get_current_user),
                      db: Session = Depends(get_db)):

    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    task.slot = new_slot
    task.status = "pending"
    db.commit()

    return {
        "message": "Task moved successfully",
        "task_id": task.id,
        "new_slot": new_slot
    }
    