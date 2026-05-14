import { useState, useEffect } from 'react'
import { calendarAPI } from '../../utils/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate } from '../../utils/helpers'

const CalendarPage = () => {
  const [events, setEvents] = useState([])
  const [upcomingExams, setUpcomingExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', event_type: 'exam', date: '',
    subject_name: '', exam_hall: '', duration_minutes: 180
  })

  // For monthly grid
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const [eventsRes, examsRes] = await Promise.all([
        calendarAPI.getEvents(),
        calendarAPI.getUpcomingExams()
      ])
      setEvents(eventsRes.data)
      setUpcomingExams(examsRes.data.exams || [])
    } catch (err) {
      console.error(err)
    } finally { 
      setLoading(false) 
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await calendarAPI.addEvent({
        ...form,
        date: new Date(form.date).toISOString(),
        duration_minutes: parseInt(form.duration_minutes)
      })
      setShowForm(false)
      setForm({ title: '', event_type: 'exam', date: '', subject_name: '', exam_hall: '', duration_minutes: 180 })
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error adding event')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this event?')) return
    try {
      await calendarAPI.deleteEvent(id)
      await fetchData()
    } catch (err) {
      console.error(err)
    }
  }

  const getEventColors = (type) => {
    const colors = {
      exam: { dot: 'bg-red-500', card: 'bg-red-50 border-red-200 text-red-700' },
      project: { dot: 'bg-blue-500', card: 'bg-blue-50 border-blue-200 text-blue-700' },
      reminder: { dot: 'bg-purple-500', card: 'bg-purple-50 border-purple-200 text-purple-700' },
    }
    return colors[type] || { dot: 'bg-gray-500', card: 'bg-gray-50 border-gray-200 text-gray-700' }
  }

  const getEventIcon = (type) => {
    const icons = { exam: '📝', project: '📌', reminder: '🔔' }
    return icons[type] || '📅'
  }

  // Generate Calendar Grid
  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    
    // Empty cells for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 bg-gray-50/50 rounded-xl border border-transparent"></div>)
    }

    // Days of the month
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = new Date(year, month, d).toISOString().split('T')[0]
      const dayEvents = events.filter(e => e.date.startsWith(dateStr))
      const isToday = new Date().toISOString().split('T')[0] === dateStr

      days.push(
        <div key={d} className={`h-24 rounded-xl border p-2 flex flex-col transition-colors hover:bg-indigo-50/30 ${isToday ? 'border-indigo-400 bg-indigo-50/10 shadow-sm' : 'border-gray-100 bg-white'}`}>
          <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-indigo-600 text-white' : 'text-gray-500'}`}>
            {d}
          </div>
          <div className="flex flex-col gap-1 overflow-y-auto no-scrollbar">
            {dayEvents.slice(0, 3).map((e, idx) => (
              <div key={idx} className="flex items-center gap-1.5 truncate text-[10px] font-medium text-gray-600">
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${getEventColors(e.event_type).dot}`}></span>
                <span className="truncate">{e.title}</span>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-[10px] text-gray-400 font-medium pl-3">+{dayEvents.length - 3} more</div>
            )}
          </div>
        </div>
      )
    }

    return days
  }

  const changeMonth = (offset) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1))
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Sidebar />
      <main className="ml-56 pt-14 p-8">

        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Academic Calendar
            </h1>
            <p className="text-gray-500 mt-1">Keep track of your exams, projects, and important dates</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Event
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Calendar Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-fade-in-up">
              
              {/* Calendar Controls */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex items-center gap-2 bg-slate-50 rounded-lg p-1 border border-slate-200">
                  <button onClick={() => changeMonth(-1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-sm font-bold text-gray-700">
                    Today
                  </button>
                  <button onClick={() => changeMonth(1)} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md transition-all text-gray-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                  </button>
                </div>
              </div>

              {/* Days of Week */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-xs font-bold text-gray-400 uppercase tracking-wider">{day}</div>
                ))}
              </div>

              {/* Calendar Cells */}
              <div className="grid grid-cols-7 gap-2">
                {renderCalendar()}
              </div>
            </div>
          </div>

          {/* Right Column: Forms & Lists */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Add event form */}
            {showForm && (
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-fade-in-down">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                  New Event Details
                </h4>
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Event Title</label>
                    <input type="text" placeholder="e.g. Midterm Exam" required
                      value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Type</label>
                      <select value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                        <option value="exam">Exam</option>
                        <option value="project">Project</option>
                        <option value="reminder">Reminder</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Date & Time</label>
                      <input type="datetime-local" required value={form.date}
                        onChange={e => setForm({...form, date: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                  {form.event_type === 'exam' && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Subject Name</label>
                        <input type="text" placeholder="e.g. Data Structures"
                          value={form.subject_name} onChange={e => setForm({...form, subject_name: e.target.value})}
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Exam Hall</label>
                          <input type="text" placeholder="Room 101"
                            value={form.exam_hall} onChange={e => setForm({...form, exam_hall: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-gray-500 uppercase block mb-1.5">Minutes</label>
                          <input type="number" value={form.duration_minutes}
                            onChange={e => setForm({...form, duration_minutes: e.target.value})}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex gap-3 mt-5 border-t border-gray-100 pt-4">
                  <button onClick={handleSubmit} className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    Save Event
                  </button>
                  <button onClick={() => setShowForm(false)} className="flex-1 bg-white text-gray-600 border border-gray-200 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming exams countdown */}
            {upcomingExams.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-3xl p-6 shadow-lg text-white">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span className="text-indigo-400">🔥</span> Critical Deadlines
                </h3>
                <div className="flex flex-col gap-4">
                  {upcomingExams.slice(0, 3).map(exam => (
                    <div key={exam.id} className="bg-white/10 rounded-2xl p-4 backdrop-blur-md border border-white/10">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-sm truncate pr-2">{exam.subject_name || exam.title}</div>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                          exam.urgency === 'critical' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                          exam.urgency === 'soon' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {exam.days_left === 0 ? 'Today!' : `${exam.days_left} Days`}
                        </div>
                      </div>
                      <div className="text-xs text-indigo-200/80 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        {formatDate(exam.date)}
                        {exam.exam_hall && ` • ${exam.exam_hall}`}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Events List */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex-grow">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
                Agenda List
              </h3>
              
              {events.length > 0 ? (
                <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                  {events.map(event => (
                    <div key={event.id} className="group flex items-start gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${getEventColors(event.event_type).card}`}>
                        <span className="text-lg">{getEventIcon(event.event_type)}</span>
                      </div>
                      <div className="flex-grow min-w-0">
                        <div className="font-bold text-gray-900 text-sm truncate">{event.title}</div>
                        <div className="text-xs text-gray-500 mt-0.5 truncate">
                          {formatDate(event.date)}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(event.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Your agenda is clear.
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default CalendarPage