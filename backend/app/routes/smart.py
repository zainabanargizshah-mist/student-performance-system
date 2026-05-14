from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.models import User, Student, Subject, DreamJob, Certification, CustomSkill
from app.schemas.schemas import DreamJobCreate, DreamJobResponse, CustomSkillCreate, CustomSkillResponse
from typing import List
import json
import os

router = APIRouter(prefix="/smart", tags=["Smart Features"])

# ─── LOAD JSON FILES ────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

with open(os.path.join(BASE_DIR, "skills_map.json")) as f:
    SKILLS_MAP = json.load(f)

with open(os.path.join(BASE_DIR, "jobs_map.json")) as f:
    JOBS_MAP = json.load(f)

# ─── HELPER: Get student skills from subjects + certifications + custom ─
def get_student_skills(student_id: int, db: Session) -> set:
    # Skills from passed subjects
    subjects = db.query(Subject).filter(
        Subject.student_id == student_id,
        Subject.grade != "F"
    ).all()
    skills = set()
    for subject in subjects:
        for key in SKILLS_MAP:
            if key.lower() in subject.name.lower():
                skills.update(SKILLS_MAP[key])

    # Skills from certifications
    certifications = db.query(Certification).filter(
        Certification.student_id == student_id
    ).all()
    for cert in certifications:
        if cert.skills_gained:
            cert_skills = [s.strip() for s in cert.skills_gained.split(",")]
            skills.update(cert_skills)

    # Skills from custom skills
    custom_skills = db.query(CustomSkill).filter(
        CustomSkill.student_id == student_id
    ).all()
    for cs in custom_skills:
        skills.add(cs.name)

    return skills

# ─── HELPER: Calculate match % ───────────────────────────────
def calculate_match(student_skills: set, job_title: str) -> dict:
    if job_title not in JOBS_MAP:
        return {"match_percentage": 0, "have": [], "missing": []}

    job = JOBS_MAP[job_title]
    must_have = set(job["must_have"])
    good_to_have = set(job["good_to_have"])
    all_required = must_have | good_to_have

    have = list(student_skills & all_required)
    missing_must = list(must_have - student_skills)
    missing_good = list(good_to_have - student_skills)

    # Must have = 70% weight, good to have = 30% weight
    must_score = len(must_have & student_skills) / len(must_have) * 70 if must_have else 70
    good_score = len(good_to_have & student_skills) / len(good_to_have) * 30 if good_to_have else 30

    match_percentage = round(must_score + good_score, 1)

    return {
        "match_percentage": match_percentage,
        "have": have,
        "missing_must_have": missing_must,
        "missing_good_to_have": missing_good
    }

# ─── GET SKILLS ──────────────────────────────────────────────
@router.get("/skills")
def get_skills(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    skills = get_student_skills(student.id, db)
    subjects = db.query(Subject).filter(
        Subject.student_id == student.id,
        Subject.grade != "F"
    ).all()
    certifications = db.query(Certification).filter(
        Certification.student_id == student.id
    ).all()
    custom_skills_db = db.query(CustomSkill).filter(
        CustomSkill.student_id == student.id
    ).all()

    # Skills breakdown by subject
    skill_breakdown = []
    for subject in subjects:
        subject_skills = []
        for key in SKILLS_MAP:
            if key.lower() in subject.name.lower():
                subject_skills.extend(SKILLS_MAP[key])
        if subject_skills:
            skill_breakdown.append({
                "source": subject.name,
                "type": "subject",
                "semester": subject.semester,
                "skills": list(set(subject_skills))
            })

    # Skills breakdown by certification
    for cert in certifications:
        if cert.skills_gained:
            cert_skills = [s.strip() for s in cert.skills_gained.split(",")]
            skill_breakdown.append({
                "source": cert.name,
                "type": "certification",
                "platform": cert.platform,
                "skills": cert_skills
            })

    return {
        "total_skills": len(skills),
        "all_skills": sorted(list(skills)),
        "breakdown_by_subject": skill_breakdown,
        "custom_skills": [
            {"id": cs.id, "name": cs.name, "category": cs.category, "created_at": str(cs.created_at)}
            for cs in custom_skills_db
        ]
    }

# ─── ADD CUSTOM SKILL ───────────────────────────────────────
@router.post("/skills", status_code=201)
def add_custom_skill(
    data: CustomSkillCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Check for duplicate
    existing = db.query(CustomSkill).filter(
        CustomSkill.student_id == student.id,
        CustomSkill.name == data.name
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Skill already exists")

    skill = CustomSkill(
        student_id=student.id,
        name=data.name,
        category=data.category or "Other"
    )
    db.add(skill)
    db.commit()
    db.refresh(skill)

    return {"id": skill.id, "name": skill.name, "category": skill.category}

# ─── DELETE CUSTOM SKILL ─────────────────────────────────────
@router.delete("/skills/{skill_id}")
def delete_custom_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    skill = db.query(CustomSkill).filter(
        CustomSkill.id == skill_id,
        CustomSkill.student_id == student.id
    ).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(skill)
    db.commit()
    return {"message": "Skill deleted successfully"}

# ─── DREAM JOBS ──────────────────────────────────────────────
@router.post("/dream-jobs", status_code=201)
def add_dream_job(
    data: DreamJobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    if data.job_title not in JOBS_MAP:
        raise HTTPException(
            status_code=400,
            detail=f"Job not found. Available jobs: {list(JOBS_MAP.keys())}"
        )

    skills = get_student_skills(student.id, db)
    match = calculate_match(skills, data.job_title)

    dream_job = DreamJob(
        student_id=student.id,
        job_title=data.job_title,
        match_percentage=match["match_percentage"]
    )
    db.add(dream_job)
    db.commit()
    db.refresh(dream_job)

    return {
        "id": dream_job.id,
        "job_title": dream_job.job_title,
        "match_percentage": dream_job.match_percentage,
        "have": match["have"],
        "missing_must_have": match["missing_must_have"],
        "missing_good_to_have": match["missing_good_to_have"]
    }

@router.get("/dream-jobs")
def get_dream_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    skills = get_student_skills(student.id, db)
    dream_jobs = db.query(DreamJob).filter(DreamJob.student_id == student.id).all()

    result = []
    for job in dream_jobs:
        match = calculate_match(skills, job.job_title)
        job.match_percentage = match["match_percentage"]
        db.commit()
        result.append({
            "id": job.id,
            "job_title": job.job_title,
            "match_percentage": match["match_percentage"],
            "have": match["have"],
            "missing_must_have": match["missing_must_have"],
            "missing_good_to_have": match["missing_good_to_have"]
        })

    result.sort(key=lambda x: x["match_percentage"], reverse=True)
    return result

# ─── ANALYTICS ───────────────────────────────────────────────
@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    subjects = db.query(Subject).filter(Subject.student_id == student.id).all()
    certifications = db.query(Certification).filter(Certification.student_id == student.id).all()

    if not subjects:
        return {"message": "No subjects found"}

    # Best and worst subjects
    passed = [s for s in subjects if s.grade != "F"]
    best = max(passed, key=lambda s: s.total_marks) if passed else None
    worst = min(passed, key=lambda s: s.total_marks) if passed else None

    # Semester wise SGPA
    semesters = {}
    for s in subjects:
        if s.semester not in semesters:
            semesters[s.semester] = []
        semesters[s.semester].append(s)

    semester_sgpa = []
    for sem, subs in sorted(semesters.items()):
        passed_subs = [s for s in subs if s.grade != "F"]
        if passed_subs:
            total_credits = sum(s.credits for s in passed_subs)
            weighted = sum(s.grade_points * s.credits for s in passed_subs)
            sgpa = round(weighted / total_credits, 2) if total_credits > 0 else 0
            semester_sgpa.append({"semester": sem, "sgpa": sgpa})

    return {
        "total_subjects": len(subjects),
        "passed_subjects": len(passed),
        "failed_subjects": len(subjects) - len(passed),
        "total_certifications": len(certifications),
        "best_subject": {"name": best.name, "marks": best.total_marks, "grade": best.grade} if best else None,
        "worst_subject": {"name": worst.name, "marks": worst.total_marks, "grade": worst.grade} if worst else None,
        "semester_performance": semester_sgpa,
        "total_skills": len(get_student_skills(student.id, db))
    }

# ─── MINIMUM MARKS CALCULATOR ────────────────────────────────
@router.get("/minimum-marks/{subject_id}")
def minimum_marks(
    subject_id: int,
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

    # Need 40 total to pass
    minimum_to_pass = max(0, 40 - subject.internal_marks)
    minimum_for_b = max(0, 50 - subject.internal_marks)
    minimum_for_a = max(0, 70 - subject.internal_marks)

    return {
        "subject": subject.name,
        "internal_marks": subject.internal_marks,
        "minimum_to_pass": minimum_to_pass,
        "minimum_for_B_grade": minimum_for_b,
        "minimum_for_A_grade": minimum_for_a,
        "current_grade": subject.grade
    }

# ─── AVAILABLE JOBS LIST ─────────────────────────────────────
@router.get("/available-jobs")
def get_available_jobs():
    return {"jobs": list(JOBS_MAP.keys())}