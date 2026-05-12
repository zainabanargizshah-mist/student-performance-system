from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.auth import get_current_user
from app.models.models import User, Student, Subject, Attendance, Assignment
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import openpyxl
from openpyxl.styles import Font, Fill, PatternFill, Alignment, Border, Side
import io

router = APIRouter(prefix="/reports", tags=["Reports"])

# ─── HELPER: Calculate CGPA ─────────────────────────────────
def calc_cgpa(subjects):
    passed = [s for s in subjects if s.grade != "F"]
    if not passed:
        return 0.0
    total_credits = sum(s.credits for s in passed)
    weighted = sum(s.grade_points * s.credits for s in passed)
    return round(weighted / total_credits, 2) if total_credits > 0 else 0.0

# ─── PDF REPORT ──────────────────────────────────────────────
@router.get("/pdf")
def download_pdf_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    subjects = db.query(Subject).filter(Subject.student_id == student.id).order_by(Subject.semester).all()
    attendance = db.query(Attendance).filter(Attendance.student_id == student.id).all()

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40)
    styles = getSampleStyleSheet()
    elements = []

    # ── Title ──
    title_style = ParagraphStyle('title', fontSize=20, fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=6)
    sub_style = ParagraphStyle('sub', fontSize=11, fontName='Helvetica', alignment=TA_CENTER, spaceAfter=4, textColor=colors.grey)
    elements.append(Paragraph("Student Performance Report", title_style))
    elements.append(Paragraph("Academic Analytics System", sub_style))
    elements.append(Spacer(1, 0.2 * inch))

    # ── Student Info ──
    info_style = ParagraphStyle('info', fontSize=11, fontName='Helvetica', spaceAfter=4)
    elements.append(Paragraph(f"<b>Name:</b> {student.full_name}", info_style))
    elements.append(Paragraph(f"<b>Roll Number:</b> {student.roll_number}", info_style))
    elements.append(Paragraph(f"<b>Degree:</b> {student.degree} — {student.branch}", info_style))
    elements.append(Paragraph(f"<b>Current Semester:</b> {student.current_semester}", info_style))
    elements.append(Paragraph(f"<b>Overall CGPA:</b> {calc_cgpa(subjects)}", info_style))
    elements.append(Spacer(1, 0.2 * inch))

    # ── Subjects Table ──
    if subjects:
        elements.append(Paragraph("<b>Academic Performance</b>", ParagraphStyle('h2', fontSize=13, fontName='Helvetica-Bold', spaceAfter=6)))

        semesters = sorted(set(s.semester for s in subjects))
        for sem in semesters:
            sem_subjects = [s for s in subjects if s.semester == sem]
            elements.append(Paragraph(f"Semester {sem}", ParagraphStyle('h3', fontSize=11, fontName='Helvetica-Bold', spaceAfter=4, textColor=colors.HexColor('#534AB7'))))

            table_data = [["Subject", "Code", "Credits", "Internal", "External", "Total", "Grade"]]
            for s in sem_subjects:
                table_data.append([
                    s.name[:30],
                    s.code or "-",
                    str(s.credits),
                    str(s.internal_marks),
                    str(s.external_marks),
                    str(s.total_marks),
                    s.grade or "-"
                ])

            # SGPA row
            passed = [s for s in sem_subjects if s.grade != "F"]
            if passed:
                total_credits = sum(s.credits for s in passed)
                weighted = sum(s.grade_points * s.credits for s in passed)
                sgpa = round(weighted / total_credits, 2)
                table_data.append(["", "", "", "", "", f"SGPA: {sgpa}", ""])

            table = Table(table_data, colWidths=[2.2*inch, 0.8*inch, 0.7*inch, 0.7*inch, 0.7*inch, 0.7*inch, 0.6*inch])
            table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#534AB7')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 10),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTSIZE', (0, 1), (-1, -1), 9),
                ('ROWBACKGROUNDS', (0, 1), (-1, -2), [colors.white, colors.HexColor('#F5F5FF')]),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
                ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#E1F5EE')),
                ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ]))
            elements.append(table)
            elements.append(Spacer(1, 0.15 * inch))

    # ── Attendance Table ──
    if attendance:
        elements.append(Spacer(1, 0.1 * inch))
        elements.append(Paragraph("<b>Attendance Summary</b>", ParagraphStyle('h2', fontSize=13, fontName='Helvetica-Bold', spaceAfter=6)))

        att_data = [["Subject ID", "Total Classes", "Attended", "Percentage", "Status"]]
        for a in attendance:
            status = "⚠ Shortage" if a.is_shortage else "✓ OK"
            att_data.append([str(a.subject_id), str(a.total_classes), str(a.attended_classes), f"{a.percentage}%", status])

        att_table = Table(att_data, colWidths=[1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch, 1.2*inch])
        att_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1D9E75')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#E1F5EE')]),
        ]))
        elements.append(att_table)

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={student.full_name}_report.pdf"}
    )

# ─── EXCEL REPORT ────────────────────────────────────────────
@router.get("/excel")
def download_excel_report(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    subjects = db.query(Subject).filter(Subject.student_id == student.id).order_by(Subject.semester).all()
    attendance = db.query(Attendance).filter(Attendance.student_id == student.id).all()
    assignments = db.query(Assignment).filter(Assignment.student_id == student.id).all()

    wb = openpyxl.Workbook()

    # ── Sheet 1: Grades ──
    ws1 = wb.active
    ws1.title = "Grades"

    header_fill = PatternFill(start_color="534AB7", end_color="534AB7", fill_type="solid")
    header_font = Font(bold=True, color="FFFFFF", size=11)
    center = Alignment(horizontal="center", vertical="center")

    headers = ["Semester", "Subject", "Code", "Credits", "Internal", "External", "Total", "Grade", "Grade Points"]
    for col, h in enumerate(headers, 1):
        cell = ws1.cell(row=1, column=col, value=h)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = center

    for row, s in enumerate(subjects, 2):
        ws1.cell(row=row, column=1, value=s.semester)
        ws1.cell(row=row, column=2, value=s.name)
        ws1.cell(row=row, column=3, value=s.code)
        ws1.cell(row=row, column=4, value=s.credits)
        ws1.cell(row=row, column=5, value=s.internal_marks)
        ws1.cell(row=row, column=6, value=s.external_marks)
        ws1.cell(row=row, column=7, value=s.total_marks)
        ws1.cell(row=row, column=8, value=s.grade)
        ws1.cell(row=row, column=9, value=s.grade_points)
        if row % 2 == 0:
            for col in range(1, 10):
                ws1.cell(row=row, column=col).fill = PatternFill(start_color="F5F5FF", end_color="F5F5FF", fill_type="solid")

    for col in ws1.columns:
        ws1.column_dimensions[col[0].column_letter].width = 15

    # ── Sheet 2: Attendance ──
    ws2 = wb.create_sheet("Attendance")
    att_headers = ["Subject ID", "Total Classes", "Attended", "Percentage", "Shortage"]
    for col, h in enumerate(att_headers, 1):
        cell = ws2.cell(row=1, column=col, value=h)
        cell.fill = PatternFill(start_color="1D9E75", end_color="1D9E75", fill_type="solid")
        cell.font = header_font
        cell.alignment = center

    for row, a in enumerate(attendance, 2):
        ws2.cell(row=row, column=1, value=a.subject_id)
        ws2.cell(row=row, column=2, value=a.total_classes)
        ws2.cell(row=row, column=3, value=a.attended_classes)
        ws2.cell(row=row, column=4, value=f"{a.percentage}%")
        ws2.cell(row=row, column=5, value="Yes" if a.is_shortage else "No")

    for col in ws2.columns:
        ws2.column_dimensions[col[0].column_letter].width = 15

    # ── Sheet 3: Assignments ──
    ws3 = wb.create_sheet("Assignments")
    assign_headers = ["Title", "Due Date", "Submitted", "Marks Obtained", "Total Marks"]
    for col, h in enumerate(assign_headers, 1):
        cell = ws3.cell(row=1, column=col, value=h)
        cell.fill = PatternFill(start_color="BA7517", end_color="BA7517", fill_type="solid")
        cell.font = header_font
        cell.alignment = center

    for row, a in enumerate(assignments, 2):
        ws3.cell(row=row, column=1, value=a.title)
        ws3.cell(row=row, column=2, value=str(a.due_date))
        ws3.cell(row=row, column=3, value="Yes" if a.submitted else "No")
        ws3.cell(row=row, column=4, value=a.marks_obtained)
        ws3.cell(row=row, column=5, value=a.total_marks)

    for col in ws3.columns:
        ws3.column_dimensions[col[0].column_letter].width = 18

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={student.full_name}_report.xlsx"}
    )

# ─── RESUME SUMMARY PDF ──────────────────────────────────────
@router.get("/resume-summary")
def download_resume_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    student = db.query(Student).filter(Student.user_id == current_user.id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Profile not found")

    subjects = db.query(Subject).filter(Subject.student_id == student.id).all()
    cgpa = calc_cgpa(subjects)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
    styles = getSampleStyleSheet()
    elements = []

    # Title
    elements.append(Paragraph(student.full_name.upper(), ParagraphStyle('name', fontSize=22, fontName='Helvetica-Bold', alignment=TA_CENTER, spaceAfter=4)))
    elements.append(Paragraph(f"{student.degree} — {student.branch}", ParagraphStyle('deg', fontSize=12, alignment=TA_CENTER, textColor=colors.grey, spaceAfter=2)))
    elements.append(Paragraph(f"Roll: {student.roll_number} | CGPA: {cgpa}", ParagraphStyle('info', fontSize=11, alignment=TA_CENTER, spaceAfter=12)))

    # Divider
    elements.append(Table([[""]], colWidths=[6.5*inch], rowHeights=[2]))
    elements.append(Spacer(1, 0.1*inch))

    # Education
    elements.append(Paragraph("EDUCATION", ParagraphStyle('section', fontSize=12, fontName='Helvetica-Bold', textColor=colors.HexColor('#534AB7'), spaceAfter=6)))

    semesters = sorted(set(s.semester for s in subjects))
    edu_data = [["Semester", "Subjects Completed", "SGPA"]]
    for sem in semesters:
        sem_subs = [s for s in subjects if s.semester == sem and s.grade != "F"]
        if sem_subs:
            total_credits = sum(s.credits for s in sem_subs)
            weighted = sum(s.grade_points * s.credits for s in sem_subs)
            sgpa = round(weighted / total_credits, 2) if total_credits > 0 else 0
            edu_data.append([f"Semester {sem}", str(len(sem_subs)), str(sgpa)])

    edu_table = Table(edu_data, colWidths=[2*inch, 2.5*inch, 2*inch])
    edu_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#534AB7')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F5F5FF')]),
    ]))
    elements.append(edu_table)
    elements.append(Spacer(1, 0.2*inch))

    # Strong subjects
    passed = [s for s in subjects if s.grade not in ["F", None] and s.total_marks >= 70]
    if passed:
        elements.append(Paragraph("STRONG SUBJECTS", ParagraphStyle('section', fontSize=12, fontName='Helvetica-Bold', textColor=colors.HexColor('#534AB7'), spaceAfter=6)))
        for s in sorted(passed, key=lambda x: x.total_marks, reverse=True)[:5]:
            elements.append(Paragraph(f"• {s.name} — {s.grade} ({s.total_marks}/100)", ParagraphStyle('item', fontSize=10, spaceAfter=3)))
        elements.append(Spacer(1, 0.15*inch))

    doc.build(elements)
    buffer.seek(0)

    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={student.full_name}_resume_summary.pdf"}
    )