from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.models import User, Student, Event
from app.schemas.schemas import EventCreate, EventResponse
from typing import List
from datetime import datetime, timezone

router = APIRouter(prefix="/calendar", tags=["Calendar"])

@router.post("/events", response_model=EventResponse, status_code=201)
def add_event(data: EventCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    event = Event(
        student_id=student.id, title=data.title, event_type=data.event_type,
        date=data.date, subject_name=data.subject_name,
        exam_hall=data.exam_hall, duration_minutes=data.duration_minutes
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
    return db.query(Event).filter(Event.student_id == student.id).order_by(Event.date).all()

@router.get("/events/{year}/{month}")
def get_events_by_month(year: int, month: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    events = db.query(Event).filter(Event.student_id == student.id).all()
    month_events = [e for e in events if e.date.month == month and e.date.year == year]
    return {
        "year": year, "month": month, "total_events": len(month_events),
        "events": [{"id": e.id, "title": e.title, "event_type": e.event_type, "date": e.date,
                     "subject_name": e.subject_name, "exam_hall": e.exam_hall,
                     "duration_minutes": e.duration_minutes} for e in month_events]
    }

@router.get("/upcoming-exams")
def get_upcoming_exams(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")
    now = datetime.now(timezone.utc)
    events = db.query(Event).filter(
        Event.student_id == student.id, Event.event_type == "exam", Event.date >= now
    ).order_by(Event.date).all()
    result = []
    for e in events:
        exam_date = e.date.replace(tzinfo=timezone.utc) if e.date.tzinfo is None else e.date
        days_left = (exam_date - now).days
        result.append({
            "id": e.id, "title": e.title, "subject_name": e.subject_name,
            "date": e.date, "exam_hall": e.exam_hall, "duration_minutes": e.duration_minutes,
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
