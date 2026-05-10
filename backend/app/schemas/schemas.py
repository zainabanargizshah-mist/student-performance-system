from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# ─── AUTH SCHEMAS ────────────────────────────────────────────
class UserRegister(BaseModel):
    full_name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# ─── STUDENT SCHEMAS ─────────────────────────────────────────
class StudentCreate(BaseModel):
    full_name: str
    roll_number: str
    degree: str
    branch: str
    current_semester: int

class StudentResponse(BaseModel):
    id: int
    full_name: str
    roll_number: str
    degree: str
    branch: str
    current_semester: int

    class Config:
        from_attributes = True

# ─── SUBJECT SCHEMAS ─────────────────────────────────────────
class SubjectCreate(BaseModel):
    name: str
    code: str
    credits: int
    semester: int
    internal_marks: Optional[float] = 0
    external_marks: Optional[float] = 0

class SubjectResponse(BaseModel):
    id: int
    name: str
    code: str
    credits: int
    semester: int
    internal_marks: float
    external_marks: float
    total_marks: float
    grade: Optional[str]
    grade_points: float

    class Config:
        from_attributes = True

# ─── ATTENDANCE SCHEMAS ──────────────────────────────────────
class AttendanceCreate(BaseModel):
    subject_id: int
    total_classes: int
    attended_classes: int

class AttendanceResponse(BaseModel):
    id: int
    subject_id: int
    total_classes: int
    attended_classes: int
    percentage: float
    is_shortage: bool

    class Config:
        from_attributes = True

# ─── ASSIGNMENT SCHEMAS ──────────────────────────────────────
class AssignmentCreate(BaseModel):
    subject_id: int
    title: str
    due_date: datetime
    total_marks: float

class AssignmentResponse(BaseModel):
    id: int
    title: str
    due_date: datetime
    submitted: bool
    marks_obtained: float
    total_marks: float

    class Config:
        from_attributes = True

# ─── EVENT SCHEMAS (Calendar) ────────────────────────────────
class EventCreate(BaseModel):
    title: str
    event_type: str
    date: datetime
    subject_name: Optional[str] = None
    exam_hall: Optional[str] = None
    duration_minutes: Optional[int] = None

class EventResponse(BaseModel):
    id: int
    title: str
    event_type: str
    date: datetime
    subject_name: Optional[str]
    exam_hall: Optional[str]
    duration_minutes: Optional[int]

    class Config:
        from_attributes = True

# ─── DREAM JOB SCHEMAS ───────────────────────────────────────
class DreamJobCreate(BaseModel):
    job_title: str

class DreamJobResponse(BaseModel):
    id: int
    job_title: str
    match_percentage: float

    class Config:
        from_attributes = True

# ─── CERTIFICATION SCHEMAS ───────────────────────────────────
class CertificationCreate(BaseModel):
    name: str
    platform: str
    skills_gained: str
    completed_date: datetime

class CertificationResponse(BaseModel):
    id: int
    name: str
    platform: str
    skills_gained: str
    completed_date: datetime

    class Config:
        from_attributes = True