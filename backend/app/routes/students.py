from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import math
from app.database import get_db
from app.auth import get_current_user
from app.models.models import User, Student, Subject, Attendance, Certification
from app.schemas.schemas import (
    StudentCreate, StudentUpdate, StudentResponse,
    SubjectCreate, SubjectResponse,
    AttendanceCreate, AttendanceResponse,
    CertificationCreate, CertificationUpdate, CertificationResponse
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

# ─── HELPER: Get student or raise ───────────────────────────
def get_student_or_404(db: Session, user_id: int) -> Student:
    student = db.query(Student).filter(Student.user_id == user_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found. Create your profile first.")
    return student

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
    return get_student_or_404(db, current_user.id)

@router.put("/profile", response_model=StudentResponse)
def update_profile(
    data: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)
    if data.full_name is not None:
        student.full_name = data.full_name
    if data.roll_number is not None:
        student.roll_number = data.roll_number
    if data.degree is not None:
        student.degree = data.degree
    if data.branch is not None:
        student.branch = data.branch
    if data.current_semester is not None:
        student.current_semester = data.current_semester
    db.commit()
    db.refresh(student)
    return student

# ─── SUBJECTS ───────────────────────────────────────────────
@router.post("/subjects", response_model=SubjectResponse, status_code=201)
def add_subject(
    data: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)

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
    student = get_student_or_404(db, current_user.id)
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
    student = get_student_or_404(db, current_user.id)
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

@router.delete("/subjects/{subject_id}")
def delete_subject(
    subject_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)
    subject = db.query(Subject).filter(
        Subject.id == subject_id,
        Subject.student_id == student.id
    ).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(subject)
    db.commit()
    return {"message": f"Subject '{subject.name}' deleted successfully"}

# ─── CGPA & SGPA ────────────────────────────────────────────
@router.get("/cgpa")
def get_cgpa(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)

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
    student = get_student_or_404(db, current_user.id)

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
def calc_classes_needed(attended, total):
    """Calculate how many more consecutive classes needed to reach 85%"""
    if total <= 0:
        return 0
    current_pct = (attended / total) * 100
    if current_pct >= 85:
        return 0
    # Solve: (attended + x) / (total + x) >= 0.85
    needed = math.ceil((0.85 * total - attended) / 0.15)
    return max(0, needed)

@router.post("/attendance", status_code=201)
def add_attendance(
    data: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)

    # Check subject exists
    subject = db.query(Subject).filter(Subject.id == data.subject_id, Subject.student_id == student.id).first()
    if not subject:
        raise HTTPException(status_code=404, detail="Subject not found")

    if data.total_classes <= 0:
        percentage = 0.0
    else:
        percentage = round((data.attended_classes / data.total_classes) * 100, 2)
    is_shortage = percentage < 85

    # Check if attendance for this subject already exists — update it
    existing = db.query(Attendance).filter(
        Attendance.student_id == student.id,
        Attendance.subject_id == data.subject_id
    ).first()

    if existing:
        existing.total_classes = data.total_classes
        existing.attended_classes = data.attended_classes
        existing.percentage = percentage
        existing.is_shortage = is_shortage
        db.commit()
        db.refresh(existing)
        return {
            "id": existing.id,
            "subject_id": existing.subject_id,
            "subject_name": subject.name,
            "total_classes": existing.total_classes,
            "attended_classes": existing.attended_classes,
            "percentage": existing.percentage,
            "is_shortage": existing.is_shortage,
            "classes_needed": calc_classes_needed(existing.attended_classes, existing.total_classes)
        }

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
    return {
        "id": attendance.id,
        "subject_id": attendance.subject_id,
        "subject_name": subject.name,
        "total_classes": attendance.total_classes,
        "attended_classes": attendance.attended_classes,
        "percentage": attendance.percentage,
        "is_shortage": attendance.is_shortage,
        "classes_needed": calc_classes_needed(attendance.attended_classes, attendance.total_classes)
    }

@router.get("/attendance")
def get_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)
    records = db.query(Attendance).filter(Attendance.student_id == student.id).all()

    result = []
    for att in records:
        subject = db.query(Subject).filter(Subject.id == att.subject_id).first()
        result.append({
            "id": att.id,
            "subject_id": att.subject_id,
            "subject_name": subject.name if subject else f"Subject #{att.subject_id}",
            "total_classes": att.total_classes,
            "attended_classes": att.attended_classes,
            "percentage": att.percentage,
            "is_shortage": att.is_shortage,
            "classes_needed": calc_classes_needed(att.attended_classes, att.total_classes)
        })
    return result

@router.delete("/attendance/{attendance_id}")
def delete_attendance(
    attendance_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)
    att = db.query(Attendance).filter(
        Attendance.id == attendance_id,
        Attendance.student_id == student.id
    ).first()
    if not att:
        raise HTTPException(status_code=404, detail="Attendance record not found")
    db.delete(att)
    db.commit()
    return {"message": "Attendance record deleted"}

# ─── CERTIFICATIONS ─────────────────────────────────────────
@router.post("/certifications", response_model=CertificationResponse, status_code=201)
def add_certification(
    data: CertificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)
    cert = Certification(
        student_id=student.id,
        name=data.name,
        platform=data.platform,
        skills_gained=data.skills_gained,
        certificate_url=data.certificate_url,
        completed_date=data.completed_date
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    return cert

@router.get("/certifications", response_model=List[CertificationResponse])
def get_certifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)
    return db.query(Certification).filter(
        Certification.student_id == student.id
    ).order_by(Certification.completed_date.desc()).all()

@router.put("/certifications/{cert_id}", response_model=CertificationResponse)
def update_certification(
    cert_id: int,
    data: CertificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)
    cert = db.query(Certification).filter(
        Certification.id == cert_id,
        Certification.student_id == student.id
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")

    if data.name is not None:
        cert.name = data.name
    if data.platform is not None:
        cert.platform = data.platform
    if data.skills_gained is not None:
        cert.skills_gained = data.skills_gained
    if data.certificate_url is not None:
        cert.certificate_url = data.certificate_url
    if data.completed_date is not None:
        cert.completed_date = data.completed_date

    db.commit()
    db.refresh(cert)
    return cert

@router.delete("/certifications/{cert_id}")
def delete_certification(
    cert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = get_student_or_404(db, current_user.id)
    cert = db.query(Certification).filter(
        Certification.id == cert_id,
        Certification.student_id == student.id
    ).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(cert)
    db.commit()
    return {"message": f"Certification '{cert.name}' deleted successfully"}