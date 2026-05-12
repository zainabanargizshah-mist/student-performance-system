from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.models import User, Student, Event
from app.schemas.schemas import EventCreate, EventResponse
from typing import List
from datetime import datetime, timezone
import pdfplumber
import re
import io

router = APIRouter(prefix="/calendar", tags=["Calendar"])

INDIAN_HOLIDAYS = [
    {"title": "Republic Day", "date": "2026-01-26"},
    {"title": "Holi", "date": "2026-03-06"},
    {"title": "Good Friday", "date": "2026-04-03"},
    {"title": "Eid ul-Fitr", "date": "2026-03-31"},
    {"title": "Ambedkar Jayanti", "date": "2026-04-14"},
    {"title": "Independence Day", "date": "2026-08-15"},
    {"title": "Gandhi Jayanti", "date": "2026-10-02"},
    {"title": "Dussehra", "date": "2026-10-11"},
    {"title": "Diwali", "date": "2026-10-30"},
    {"title": "Christmas", "date": "2026-12-25"},
]

@router.post("/events", response_model=EventResponse, status_code=201)
def add_event(data: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    event = Event(
        student_id=student.id,
        title=data.title,
        event_type=data.event_type,
        date=data.date,
        subject_name=data.subject_name,
        exam_hall=data.exam_hall,
        duration_minutes=data.duration_minutes
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event

@router.get("/events", response_model=List[EventResponse])
def get_events(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    events = db.query(Event).filter(Event.student_id == student.id).order_by(Event.date).all()
    return events

@router.get("/events/{year}/{month}")
def get_events_by_month(year: int, month: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    events = db.query(Event).filter(Event.student_id == student.id).all()
    month_events = [e for e in events if e.date.month == month and e.date.year == year]
    return {
        "year": year,
        "month": month,
        "total_events": len(month_events),
        "events": [{"id": e.id, "title": e.title, "event_type": e.event_type, "date": e.date, "subject_name": e.subject_name, "exam_hall": e.exam_hall, "duration_minutes": e.duration_minutes} for e in month_events]
    }

@router.get("/upcoming-exams")
def get_upcoming_exams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    now = datetime.now(timezone.utc)
    events = db.query(Event).filter(Event.student_id == student.id, Event.event_type == "exam", Event.date >= now).order_by(Event.date).all()
    result = []
    for e in events:
        exam_date = e.date.replace(tzinfo=timezone.utc) if e.date.tzinfo is None else e.date
        days_left = (exam_date - now).days
        result.append({
            "id": e.id,
            "title": e.title,
            "subject_name": e.subject_name,
            "date": e.date,
            "exam_hall": e.exam_hall,
            "duration_minutes": e.duration_minutes,
            "days_left": days_left,
            "urgency": "critical" if days_left <= 3 else "soon" if days_left <= 7 else "normal"
        })
    return {"total_upcoming": len(result), "exams": result}

@router.delete("/events/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    event = db.query(Event).filter(Event.id == event_id, Event.student_id == student.id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"message": "Event deleted successfully"}

@router.post("/sync-holidays")
def sync_holidays(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    added = 0
    for holiday in INDIAN_HOLIDAYS:
        existing = db.query(Event).filter(Event.student_id == student.id, Event.title == holiday["title"], Event.event_type == "holiday").first()
        if not existing:
            event = Event(student_id=student.id, title=holiday["title"], event_type="holiday", date=datetime.strptime(holiday["date"], "%Y-%m-%d"))
            db.add(event)
            added += 1
    db.commit()
    return {"message": f"Added {added} holidays to your calendar"}

@router.post("/upload-datesheet")
async def upload_datesheet(file: UploadFile = File(...), db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    content = await file.read()
    extracted_events = []
    try:
        with pdfplumber.open(io.BytesIO(content)) as pdf:
            full_text = ""
            for page in pdf.pages:
                full_text += page.extract_text() or ""
        date_patterns = [r'(\d{1,2}[-/]\d{1,2}[-/]\d{4})', r'(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4})']
        lines = full_text.split('\n')
        for line in lines:
            line = line.strip()
            if not line:
                continue
            found_date = None
            for pattern in date_patterns:
                match = re.search(pattern, line, re.IGNORECASE)
                if match:
                    found_date = match.group(1)
                    break
            if found_date:
                parsed_date = None
                for fmt in ["%d-%m-%Y", "%d/%m/%Y", "%d %B %Y"]:
                    try:
                        parsed_date = datetime.strptime(found_date, fmt)
                        break
                    except:
                        continue
                if parsed_date:
                    subject_text = re.sub(r'\d{1,2}[-/]\d{1,2}[-/]\d{4}', '', line).strip(" -|:")
                    if len(subject_text) > 3:
                        extracted_events.append({"title": f"Exam: {subject_text[:100]}", "date": parsed_date.strftime("%Y-%m-%d"), "subject_name": subject_text[:100]})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not parse PDF: {str(e)}")
    return {"message": f"Found {len(extracted_events)} exam dates", "extracted_events": extracted_events}
