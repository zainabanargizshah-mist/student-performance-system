import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, smartAPI, calendarAPI } from '../../utils/api'
import { CardSkeleton } from '../../components/Skeleton'
import { formatDate } from '../../utils/helpers'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { useLocation } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const Dashboard = () => {
  const { user } = useAuth()
  const location = useLocation()
  const [profile, setProfile] = useState(null)
  const [cgpa, setCgpa] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [upcomingExams, setUpcomingExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // GPA Goal state
  const [gpaGoal, setGpaGoal] = useState(9.0)

  const fetchData = useCallback(async () => {
    try {
      const profileRes = await studentAPI.getProfile()
      setProfile(profileRes.data)
      const [cgpaRes, analyticsRes, examsRes] = await Promise.all([
        studentAPI.getCGPA(),
        smartAPI.getAnalytics(),
        calendarAPI.getUpcomingExams(),
      ])
      setCgpa(cgpaRes.data)
      setAnalytics(analyticsRes.data)
      setUpcomingExams(examsRes.data.exams || [])
    } catch (err) {
      console.log('No profile yet')
    } finally {
      setLoading(false)
    }
  }, [])

  // Re-fetch every time the user navigates to the dashboard
  useEffect(() => {
    fetchData()
  }, [location.key, fetchData])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="ml-0 lg:ml-60 pt-14 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => <CardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2"><CardSkeleton /></div>
            <div><CardSkeleton /></div>
          </div>
        </main>
      </div>
    )
  }

  // Calculate goal progress
  const currentCgpa = parseFloat(cgpa?.cgpa || 0)
  const goalProgress = Math.min(100, Math.max(0, (currentCgpa / gpaGoal) * 100))

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="ml-0 lg:ml-60 pt-14 p-6">
      <div className="max-w-7xl mx-auto animate-fade-in-up">
      {/* Welcome header */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Here's your academic overview and progress
          </p>
        </div>
        
        {/* GPA Goal Tracker Mini */}
        {profile && (
          <div className="hidden md:flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500 font-medium">CGPA Goal</span>
              <span className="text-sm font-bold text-indigo-600">{currentCgpa} / {gpaGoal.toFixed(1)}</span>
            </div>
            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${goalProgress >= 100 ? 'bg-green-500' : 'bg-indigo-500'}`}
                style={{ width: `${goalProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {!profile ? (
        /* No profile yet */
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-indigo-200 shadow-sm transition-all hover:shadow-md">
          <div className="text-6xl mb-4 animate-bounce">🎓</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete your profile</h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Add your student details and first semester subjects to get personalized insights and analytics.
          </p>
          <button
            onClick={() => window.location.href = '/grades'}
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all hover:scale-105 shadow-md hover:shadow-lg"
          >
            Set up profile now
          </button>
        </div>
      ) : (
        <>
          {/* Premium Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 transition-transform hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <span className="text-indigo-100 font-medium text-sm tracking-wide uppercase">Current CGPA</span>
                <span className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">🎯</span>
              </div>
              <div className="text-4xl font-extrabold tracking-tight">
                {cgpa?.cgpa || '0.00'}
              </div>
              <div className="text-sm text-indigo-100 mt-2 font-medium">
                {cgpa?.total_credits || 0} credits completed
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-green-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">Subjects</span>
                  <span className="bg-green-50 text-green-600 p-2 rounded-lg">📚</span>
                </div>
                <div className="text-4xl font-extrabold text-gray-900">
                  {analytics?.passed_subjects || 0}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded">Passed</span>
                  <span className="text-sm text-gray-400">/ {analytics?.failed_subjects || 0} failed</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">Skills</span>
                  <span className="bg-purple-50 text-purple-600 p-2 rounded-lg">🧠</span>
                </div>
                <div className="text-4xl font-extrabold text-gray-900">
                  {analytics?.total_skills || 0}
                </div>
                <div className="text-sm text-gray-400 mt-2 font-medium">
                  {analytics?.total_certifications || 0} certifications earned
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm transition-transform hover:-translate-y-1 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-500 font-medium text-sm tracking-wide uppercase">Semester</span>
                  <span className="bg-orange-50 text-orange-600 p-2 rounded-lg">📅</span>
                </div>
                <div className="text-4xl font-extrabold text-gray-900">
                  {profile?.current_semester || 0}
                </div>
                <div className="text-sm text-gray-400 mt-2 font-medium truncate" title={`${profile?.degree} — ${profile?.branch}`}>
                  {profile?.degree} • {profile?.branch}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* SGPA Area Chart */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">SGPA Trend</h3>
                <span className="text-sm text-gray-500 font-medium">Semester-wise</span>
              </div>
              
              {analytics?.semester_performance?.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analytics.semester_performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorSgpa" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="semester" 
                        tickFormatter={(v) => `Sem ${v}`} 
                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                        axisLine={false}
                        tickLine={false}
                        dy={10}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        tick={{ fontSize: 12, fill: '#6b7280' }} 
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`${value}`, 'SGPA']}
                        labelFormatter={(label) => `Semester ${label}`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="sgpa" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorSgpa)" 
                        activeDot={{ r: 8, strokeWidth: 0, fill: '#4f46e5' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-3xl mb-2">📊</span>
                  <p className="text-sm font-medium">Add subjects to see your SGPA trend</p>
                </div>
              )}
            </div>

            {/* Upcoming exams */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-gray-900">Upcoming Exams</h3>
                <a href="/calendar" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">View all</a>
              </div>
              
              {upcomingExams.length > 0 ? (
                <div className="flex flex-col gap-4 flex-1">
                  {upcomingExams.slice(0, 4).map((exam) => {
                    const isCritical = exam.urgency === 'critical';
                    const isSoon = exam.urgency === 'soon';
                    
                    return (
                      <div key={exam.id} className="group flex gap-4 items-start p-3 -mx-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl shrink-0 ${
                          isCritical ? 'bg-red-100 text-red-700' : 
                          isSoon ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          <span className="text-xs font-bold uppercase">{new Date(exam.date).toLocaleString('default', { month: 'short' })}</span>
                          <span className="text-lg font-extrabold leading-none">{new Date(exam.date).getDate()}</span>
                        </div>
                        <div className="flex-1 min-w-0 pt-1">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">{exam.subject_name || exam.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                            {exam.duration_minutes ? `${exam.duration_minutes} mins` : 'Exam'}
                          </p>
                        </div>
                        <div className="text-right pt-1">
                          <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                            isCritical ? 'bg-red-50 text-red-700' : 
                            isSoon ? 'bg-yellow-50 text-yellow-700' : 
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {exam.days_left === 0 ? 'Today!' : `${exam.days_left}d`}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <span className="text-3xl mb-2">🗓️</span>
                  <p className="text-sm font-medium">No upcoming exams</p>
                </div>
              )}
            </div>
          </div>

          {/* Best & Worst subjects Insights */}
          {analytics?.best_subject && (
            <div className="mt-6 mb-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Performance Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute -right-6 -top-6 text-8xl opacity-10 group-hover:scale-110 transition-transform">🏆</div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Top Performing
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analytics.best_subject.name}
                    </div>
                    <div className="flex items-end gap-3 mt-4">
                      <div className="text-4xl font-extrabold text-emerald-600">{analytics.best_subject.marks}<span className="text-xl text-emerald-400">/100</span></div>
                      <div className="text-lg font-semibold text-gray-600 mb-1">Grade {analytics.best_subject.grade}</div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-rose-50 to-orange-50 rounded-2xl p-6 border border-rose-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
                  <div className="absolute -right-6 -top-6 text-8xl opacity-10 group-hover:scale-110 transition-transform">📈</div>
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-3">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span> Needs Attention
                    </div>
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {analytics.worst_subject.name}
                    </div>
                    <div className="flex items-end gap-3 mt-4">
                      <div className="text-4xl font-extrabold text-rose-600">{analytics.worst_subject.marks}<span className="text-xl text-rose-400">/100</span></div>
                      <div className="text-lg font-semibold text-gray-600 mb-1">Grade {analytics.worst_subject.grade}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
      </div>
      </main>
    </div>
  )
}

export default Dashboard