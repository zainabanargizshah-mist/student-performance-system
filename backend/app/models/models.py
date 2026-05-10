from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# ─── USERS TABLE ───────────────────────────────────────────
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="user", uselist=False)

# ─── STUDENTS TABLE ─────────────────────────────────────────
class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    full_name = Column(String, nullable=False)
    roll_number = Column(String, unique=True)
    degree = Column(String)
    branch = Column(String)
    current_semester = Column(Integer)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="student")
    subjects = relationship("Subject", back_populates="student")
    attendance = relationship("Attendance", back_populates="student")
    assignments = relationship("Assignment", back_populates="student")
    events = relationship("Event", back_populates="student")
    dream_jobs = relationship("DreamJob", back_populates="student")
    certifications = relationship("Certification", back_populates="student")

# ─── SUBJECTS TABLE ─────────────────────────────────────────
class Subject(Base):
    __tablename__ = "subjects"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    name = Column(String, nullable=False)
    code = Column(String)
    credits = Column(Integer)
    semester = Column(Integer)
    internal_marks = Column(Float, default=0)
    external_marks = Column(Float, default=0)
    total_marks = Column(Float, default=0)
    grade = Column(String)
    grade_points = Column(Float, default=0)

    student = relationship("Student", back_populates="subjects")
    attendance = relationship("Attendance", back_populates="subject")
    assignments = relationship("Assignment", back_populates="subject")

# ─── ATTENDANCE TABLE ───────────────────────────────────────
class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    total_classes = Column(Integer, default=0)
    attended_classes = Column(Integer, default=0)
    percentage = Column(Float, default=0)
    is_shortage = Column(Boolean, default=False)

    student = relationship("Student", back_populates="attendance")
    subject = relationship("Subject", back_populates="attendance")

# ─── ASSIGNMENTS TABLE ──────────────────────────────────────
class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    subject_id = Column(Integer, ForeignKey("subjects.id"))
    title = Column(String, nullable=False)
    due_date = Column(DateTime(timezone=True))
    submitted = Column(Boolean, default=False)
    marks_obtained = Column(Float, default=0)
    total_marks = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="assignments")
    subject = relationship("Subject", back_populates="assignments")

# ─── EVENTS TABLE (Calendar) ────────────────────────────────
class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    title = Column(String, nullable=False)
    event_type = Column(String)  # exam, holiday, assignment, reminder
    date = Column(DateTime(timezone=True))
    subject_name = Column(String)
    exam_hall = Column(String)
    duration_minutes = Column(Integer)
    reminder_sent = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="events")

# ─── DREAM JOBS TABLE ───────────────────────────────────────
class DreamJob(Base):
    __tablename__ = "dream_jobs"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    job_title = Column(String, nullable=False)
    match_percentage = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="dream_jobs")

# ─── CERTIFICATIONS TABLE ───────────────────────────────────
class Certification(Base):
    __tablename__ = "certifications"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"))
    name = Column(String, nullable=False)
    platform = Column(String)
    skills_gained = Column(Text)
    completed_date = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    student = relationship("Student", back_populates="certifications")