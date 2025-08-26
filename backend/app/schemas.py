# schemas.py - Pydantic (validation données)
from pydantic import BaseModel
from typing import Optional, List, Union
from datetime import datetime
from .models import TaskStatus

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    tags: Optional[str] = None


class TaskCreate(TaskBase):
    due_date: Optional[datetime] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    done: Optional[bool] = None
    archived: Optional[bool] = None
    due_date: Optional[datetime] = None
    tags: Optional[str] = None


class TaskSearch(BaseModel):
    query: Optional[str] = None
    status: Optional[TaskStatus] = None
    archived: Optional[bool] = None
    due_date_from: Optional[datetime] = None
    due_date_to: Optional[datetime] = None
    tags: Optional[List[str]] = None


class Task(TaskBase):
    id: int
    done: bool
    status: TaskStatus
    archived: bool
    owner_id: int
    created_at: datetime
    due_date: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    email: str
    username: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    tasks: List[Task] = []

    class Config:
        from_attributes = True
