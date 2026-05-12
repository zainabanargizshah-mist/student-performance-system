import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { studentAPI, smartAPI, calendarAPI } from '../../utils/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { formatDate } from '../../utils/helpers'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const Dashboard = () => {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [cgpa, setCgpa] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [upcomingExams, setUpcomingExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
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
    }
    fetchData()
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      <main className="ml-56 pt-14 p-6">

        {/* Welcome header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's your academic overview
          </p>
        </div>

        {!profile ? (
          /* No profile yet */
          <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-indigo-300">
            <div className="text-4xl mb-3">🎓</div>
            <h3 className="font-semibold text-gray-900 mb-2">Complete your profile</h3>
            <p className="text-gray-500 text-sm mb-4">
              Add your student details to get started
            </p>
            <button
              onClick={() => window.location.href = '/grades'}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              Set up profile
            </button>
          </div>
        ) : (
          <>
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">CGPA</span>
                  <span className="text-2xl">🎯</span>
                </div>
                <div className="text-3xl font-bold text-indigo-600">
                  {cgpa?.cgpa || '0.00'}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {cgpa?.total_credits || 0} credits completed
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Subjects</span>
                  <span className="text-2xl">📚</span>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {analytics?.passed_subjects || 0}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {analytics?.failed_subjects || 0} failed subjects
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Skills</span>
                  <span className="text-2xl">🧠</span>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {analytics?.total_skills || 0}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Skills learned so far
                </div>
              </div>

              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-500">Semester</span>
                  <span className="text-2xl">📅</span>
                </div>
                <div className="text-3xl font-bold text-orange-500">
                  {profile?.current_semester || 0}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {profile?.degree} — {profile?.branch}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* SGPA Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">SGPA Trend</h3>
                {analytics?.semester_performance?.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={analytics.semester_performance}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="semester"
                        tickFormatter={(v) => `Sem ${v}`}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value) => [`${value}`, 'SGPA']}
                        labelFormatter={(label) => `Semester ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="sgpa"
                        stroke="#534AB7"
                        strokeWidth={2}
                        dot={{ fill: '#534AB7', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                    Add subjects to see your SGPA trend
                  </div>
                )}
              </div>

              {/* Upcoming exams */}
              <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Upcoming Exams</h3>
                {upcomingExams.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {upcomingExams.slice(0, 4).map((exam) => (
                      <div
                        key={exam.id}
                        className={`p-3 rounded-lg border ${
                          exam.urgency === 'critical'
                            ? 'bg-red-50 border-red-200'
                            : exam.urgency === 'soon'
                            ? 'bg-yellow-50 border-yellow-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="font-medium text-gray-900 text-sm">
                          {exam.subject_name || exam.title}
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">
                            {formatDate(exam.date)}
                          </span>
                          <span className={`text-xs font-semibold ${
                            exam.urgency === 'critical'
                              ? 'text-red-600'
                              : exam.urgency === 'soon'
                              ? 'text-yellow-600'
                              : 'text-gray-500'
                          }`}>
                            {exam.days_left === 0 ? 'Today!' : `${exam.days_left}d left`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                    No upcoming exams
                  </div>
                )}
              </div>
            </div>

            {/* Best & Worst subjects */}
            {analytics?.best_subject && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                  <div className="text-sm text-green-600 font-medium mb-1">
                    🏆 Best Subject
                  </div>
                  <div className="font-bold text-gray-900">
                    {analytics.best_subject.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {analytics.best_subject.marks}/100 — Grade {analytics.best_subject.grade}
                  </div>
                </div>
                <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                  <div className="text-sm text-orange-600 font-medium mb-1">
                    ⚠ Needs Attention
                  </div>
                  <div className="font-bold text-gray-900">
                    {analytics.worst_subject.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {analytics.worst_subject.marks}/100 — Grade {analytics.worst_subject.grade}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default Dashboard