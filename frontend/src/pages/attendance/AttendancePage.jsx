import { useState, useEffect } from 'react'
import { studentAPI } from '../../utils/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CardSkeleton } from '../../components/Skeleton'

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([])
  const [subjects, setSubjects] = useState([])
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchingData, setFetchingData] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    subject_id: '', total_classes: '', attended_classes: ''
  })
  const [submitLoading, setSubmitLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setFetchingData(true)
    try {
      const profileRes = await studentAPI.getProfile().catch(() => ({ data: null }))
      if (profileRes.data) {
        setProfile(profileRes.data)
        const [attRes, subRes] = await Promise.all([
          studentAPI.getAttendance(),
          studentAPI.getSubjects(profileRes.data.current_semester)
        ])
        setAttendance(attRes.data)
        setSubjects(subRes.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setFetchingData(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.subject_id || form.total_classes === '' || form.attended_classes === '') {
      return alert('Please fill in all fields')
    }
    
    setSubmitLoading(true)
    try {
      await studentAPI.addAttendance({
        subject_id: parseInt(form.subject_id),
        total_classes: parseInt(form.total_classes),
        attended_classes: parseInt(form.attended_classes)
      })
      setShowForm(false)
      setForm({ subject_id: '', total_classes: '', attended_classes: '' })
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error adding attendance')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEditClick = (att) => {
    setForm({
      subject_id: att.subject_id,
      total_classes: att.total_classes,
      attended_classes: att.attended_classes
    })
    setShowForm(true)
  }

  const getColor = (pct) => {
    if (pct >= 85) return { bar: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-100', icon: 'text-emerald-500' }
    if (pct >= 75) return { bar: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50 border-amber-100', icon: 'text-amber-500' }
    return { bar: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50 border-red-200', icon: 'text-red-500' }
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
              Attendance Tracker
            </h1>
            <p className="text-gray-500 mt-1">Keep track of your classes and avoid shortages</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Update Attendance
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-indigo-50 rounded-2xl">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Tracked Subjects</div>
              <div className="text-3xl font-bold text-gray-900 mt-1">{attendance.length}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-emerald-50 rounded-2xl">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Safe Subjects</div>
              <div className="text-3xl font-bold text-emerald-600 mt-1">{attendance.filter(a => !a.is_shortage).length}</div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-red-50 rounded-2xl">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wider">Shortage Subjects</div>
              <div className="text-3xl font-bold text-red-600 mt-1">{attendance.filter(a => a.is_shortage).length}</div>
            </div>
          </div>
        </div>

        {/* Add/Update Form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 animate-fade-in-down">
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                Update Attendance Record
              </h4>
              <span className="text-xs bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full font-medium">Adding an existing subject updates it</span>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Subject</label>
                  <select value={form.subject_id}
                    onChange={e => setForm({...form, subject_id: e.target.value})}
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                    <option value="" disabled>Select subject</option>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Total Classes Held</label>
                  <input type="number" value={form.total_classes} min="0" required
                    onChange={e => setForm({...form, total_classes: e.target.value})}
                    placeholder="e.g. 40"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Classes Attended</label>
                  <input type="number" value={form.attended_classes} min="0" required
                    onChange={e => setForm({...form, attended_classes: e.target.value})}
                    placeholder="e.g. 35"
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" disabled={submitLoading}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                  {submitLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : null}
                  Save Record
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="bg-white text-gray-600 border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Attendance Cards Grid */}
        {fetchingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <CardSkeleton key={i} height="h-48" />)}
          </div>
        ) : attendance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {attendance.map(att => {
              const colors = getColor(att.percentage)
              return (
                <div key={att.id} className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all group ${colors.bg}`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-gray-900 text-lg leading-tight w-3/4">
                      {att.subject_name}
                    </h3>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(att)} className="text-gray-400 hover:text-indigo-600 p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-end gap-2 mb-3">
                    <span className={`text-4xl font-extrabold tracking-tight ${colors.text}`}>
                      {att.percentage}%
                    </span>
                    {att.percentage >= 85 && (
                      <svg className={`w-6 h-6 mb-1 ${colors.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    )}
                  </div>
                  
                  <div className="w-full bg-gray-200/50 rounded-full h-2.5 mb-4 overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
                      style={{ width: `${att.percentage}%` }}>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 font-medium">{att.attended_classes} / {att.total_classes} Classes</span>
                      <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Attended</span>
                    </div>
                    
                    {att.is_shortage && att.classes_needed > 0 && (
                      <div className="mt-2 bg-red-100/50 border border-red-100 rounded-lg p-3 flex items-start gap-2">
                        <svg className="w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <div>
                          <p className="text-xs font-bold text-red-700">Shortage Alert</p>
                          <p className="text-xs text-red-600 mt-0.5">Need <span className="font-bold">{att.classes_needed}</span> consecutive classes to reach 85%</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="py-16 text-center border-2 border-dashed border-gray-200 rounded-2xl bg-white">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📅</span>
            </div>
            <h4 className="text-gray-900 font-medium mb-1">No Attendance Tracked</h4>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">You haven't added any attendance records yet. Add your first record to track your progress.</p>
            <button onClick={() => setShowForm(true)} className="text-indigo-600 font-medium hover:text-indigo-700 text-sm">
              + Update Attendance
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default AttendancePage