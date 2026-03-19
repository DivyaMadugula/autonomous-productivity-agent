from sqlalchemy import Column, Integer, String, ForeignKey, DateTime,Date
from sqlalchemy.orm import relationship
from datetime import datetime,date
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    # Relationship
    last_reset_date = Column(Date, default=date.today)
    tasks = relationship("Task", back_populates="user", cascade="all, delete")
    goals = relationship("Goal", backref="user", cascade="all, delete")
    

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))

    tasks = relationship("Task", back_populates="goal", cascade="all, delete")
    due_date = Column(DateTime, nullable=True)
class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    title = Column(String)
    priority = Column(Integer)
    estimated_duration = Column(Integer)
    difficulty = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_id = Column(Integer, ForeignKey("users.id"))
    goal_id = Column(Integer, ForeignKey("goals.id"))
    # Relationship
    slot = Column(String)
    status = Column(String, default="pending")
    miss_count = Column(Integer, default=0)
    user = relationship("User", back_populates="tasks")
    goal = relationship("Goal", back_populates="tasks")


class TaskLog(Base):
    __tablename__ = "task_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    task_title = Column(String)
    status = Column(String)
    slot = Column(String)
    timestamp = Column(DateTime, default=datetime.utcnow)
