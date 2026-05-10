from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.auth import get_current_user
from app.models.models import User, Student, Subject, Attendance, Assignment
from app.schemas.schemas import (
    StudentCreate, StudentResponse,
    SubjectCreate, SubjectResponse,
    AttendanceCreate, AttendanceResponse,
    AssignmentCreate, AssignmentResponse
)

router = APIRouter(prefix="/students", tags=["Students"])

# ─── HELPER: Get grade from marks ───────────────────────────
def calculate_grade(total: float) -> tuple:
    if total >= 90: return "O", 10.0
    elif total >= 80: return "A+", 9.0
    elif total >= 70: return "A", 8.0
    elif total >= 60: return "B+", 7.0
    elif total >= 50: return "B", 6.0
    elif total >= 40: return "C", 5.0
    else: return "F", 0.0

# ─── STUDENT PROFILE ────────────────────────────────────────
@router.post("/profile", response_model=StudentResponse, status_code=201)
def create_profile(
    data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(Student).filter(Student.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    student = Student(
        user_id=current_user.id,
        full_name=data.full_name,
        roll_number=data.roll_number,
        degree=data.degree,
        branch=data.branch,
        current_semester=data.current_semester
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return student

@router.get("/profile", response_model=StudentResponse)
def get_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    return student

# ─── SUBJECTS ───────────────────────────────────────────────
@router.post("/subjects", response_model=SubjectResponse, status_code=201)
def add_subject(
    data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Create your profile first")

    total = data.internal_marks + data.external_marks
    grade, grade_points = calculate_grade(total)

    subject = Subject(
        student_id=student.id,
        name=data.name,
        code=data.code,
        credits=data.credits,
        semester=data.semester,
        internal_marks=data.internal_marks,
        external_marks=data.external_marks,
        total_marks=total,
        grade=grade,
        grade_points=grade_points
    )
    db.add(subject)
    db.commit()
    db.refresh(subject)
    return subject

@router.get("/subjects/{semester}", response_model=List[SubjectResponse])
def get_subjects(
    semester: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    subjects = db.query(Subject).filter(
        Subject.student_id == student.id,
        Subject.semester == semester
    ).all()
    return subjects

@router.put("/subjects/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: int,
    data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.student_id == student.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    total = data.internal_marks + data.external_marks
    grade, grade_points = calculate_grade(total)

    subject.name = data.name
    subject.code = data.code
    subject.credits = data.credits
    subject.internal_marks = data.internal_marks
    subject.external_marks = data.external_marks
    subject.total_marks = total
    subject.grade = grade
    subject.grade_points = grade_points

    db.commit()
    db.refresh(subject)
    return subject

# ─── CGPA & SGPA ────────────────────────────────────────────
@router.get("/cgpa")
def get_cgpa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    subjects = db.query(Subject).filter(
        Subject.student_id == student.id,
        Subject.grade != "F"
    ).all()

    if not subjects:
        return {"cgpa": 0.0, "total_credits": 0}

    total_credits = sum(s.credits for s in subjects)
    weighted_points = sum(s.grade_points * s.credits for s in subjects)
    cgpa = round(weighted_points / total_credits, 2) if total_credits > 0 else 0.0

    return {
        "cgpa": cgpa,
        "total_credits": total_credits,
        "total_subjects": len(subjects)
    }

@router.get("/sgpa/{semester}")
def get_sgpa(
    semester: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    subjects = db.query(Subject).filter(
        Subject.student_id == student.id,
        Subject.semester == semester,
        Subject.grade != "F"
    ).all()

    if not subjects:
        return {"sgpa": 0.0, "semester": semester}

    total_credits = sum(s.credits for s in subjects)
    weighted_points = sum(s.grade_points * s.credits for s in subjects)
    sgpa = round(weighted_points / total_credits, 2) if total_credits > 0 else 0.0

    return {
        "sgpa": sgpa,
        "semester": semester,
        "total_credits": total_credits,
        "subjects": len(subjects)
    }

# ─── ATTENDANCE ─────────────────────────────────────────────
@router.post("/attendance", response_model=AttendanceResponse, status_code=201)
def add_attendance(
    data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    percentage = round((data.attended_classes / data.total_classes) * 100, 2)
    is_shortage = percentage < 75

    attendance = Attendance(
        student_id=student.id,
        subject_id=data.subject_id,
        total_classes=data.total_classes,
        attended_classes=data.attended_classes,
        percentage=percentage,
        is_shortage=is_shortage
    )
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance

@router.get("/attendance", response_model=List[AttendanceResponse])
def get_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    attendance = db.query(Attendance).filter(
        Attendance.student_id == student.id
    ).all()
    return attendance

# ─── ASSIGNMENTS ─────────────────────────────────────────────
@router.post("/assignments", response_model=AssignmentResponse, status_code=201)
def add_assignment(
    data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    assignment = Assignment(
        student_id=student.id,
        subject_id=data.subject_id,
        title=data.title,
        due_date=data.due_date,
        total_marks=data.total_marks
    )
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment

@router.get("/assignments", response_model=List[AssignmentResponse])
def get_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    assignments = db.query(Assignment).filter(
        Assignment.student_id == student.id
    ).all()
    return assignments