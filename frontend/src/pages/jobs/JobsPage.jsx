import { useState, useEffect } from 'react'
import { smartAPI } from '../../utils/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CardSkeleton } from '../../components/Skeleton'

const JobsPage = () => {
  const [dreamJobs, setDreamJobs] = useState([])
  const [availableJobs, setAvailableJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchingData, setFetchingData] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [selectedJob, setSelectedJob] = useState('')
  const [adding, setAdding] = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    setFetchingData(true)
    try {
      const [jobsRes, availRes] = await Promise.all([
        smartAPI.getDreamJobs(),
        smartAPI.getAvailableJobs()
      ])
      setDreamJobs(jobsRes.data)
      setAvailableJobs(availRes.data.jobs || [])
    } catch (err) {
      console.error(err)
    } finally { 
      setLoading(false)
      setFetchingData(false)
    }
  }

  const handleAddJob = async () => {
    if (!selectedJob) return
    setAdding(true)
    try {
      await smartAPI.addDreamJob({ job_title: selectedJob })
      setShowForm(false)
      setSelectedJob('')
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error adding job')
    } finally { 
      setAdding(false) 
    }
  }

  const getMatchStyles = (pct) => {
    if (pct >= 80) return { 
      text: 'text-emerald-600', 
      bg: 'bg-emerald-500', 
      cardBg: 'bg-emerald-50/30',
      ring: 'stroke-emerald-500',
      shadow: 'shadow-emerald-100'
    }
    if (pct >= 50) return { 
      text: 'text-amber-600', 
      bg: 'bg-amber-500', 
      cardBg: 'bg-amber-50/30',
      ring: 'stroke-amber-500',
      shadow: 'shadow-amber-100'
    }
    return { 
      text: 'text-red-500', 
      bg: 'bg-red-500', 
      cardBg: 'bg-red-50/30',
      ring: 'stroke-red-500',
      shadow: 'shadow-red-100'
    }
  }

  // Calculate stroke dash array for circular progress
  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Sidebar />
      <main className="ml-56 pt-14 p-8">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Dream Jobs Target
            </h1>
            <p className="text-gray-500 mt-1">See how your current skills match up to your dream career</p>
          </div>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Target Job
          </button>
        </div>

        {/* Add job form */}
        {showForm && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 animate-fade-in-down">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
              Select Your Target Career
            </h4>
            <div className="flex flex-col sm:flex-row gap-4">
              <select value={selectedJob} onChange={e => setSelectedJob(e.target.value)}
                className="flex-grow px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                <option value="" disabled>Choose a job role...</option>
                {availableJobs.map(job => (
                  <option key={job} value={job}>{job}</option>
                ))}
              </select>
              <div className="flex gap-3">
                <button onClick={handleAddJob} disabled={adding || !selectedJob}
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm whitespace-nowrap flex items-center gap-2">
                  {adding ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : null}
                  Track Match
                </button>
                <button onClick={() => setShowForm(false)}
                  className="bg-white text-gray-600 border border-gray-200 px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dream jobs list */}
        {fetchingData ? (
          <div className="flex flex-col gap-6">
            {[1, 2].map(i => <CardSkeleton key={i} height="h-64" />)}
          </div>
        ) : dreamJobs.length > 0 ? (
          <div className="flex flex-col gap-8">
            {dreamJobs.map(job => {
              const styles = getMatchStyles(job.match_percentage)
              const strokeDashoffset = circumference - (job.match_percentage / 100) * circumference;

              return (
                <div key={job.id} className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${styles.cardBg}`}>
                  
                  {/* Top Section */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
                    <div className="flex items-center gap-6">
                      {/* Animated Circular Progress */}
                      <div className="relative w-24 h-24 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                          {/* Background circle */}
                          <circle cx="32" cy="32" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="6" />
                          {/* Progress circle */}
                          <circle cx="32" cy="32" r={radius} fill="none" 
                            className={`${styles.ring} transition-all duration-1500 ease-out`}
                            strokeWidth="6" strokeLinecap="round"
                            style={{ 
                              strokeDasharray: circumference, 
                              strokeDashoffset: strokeDashoffset 
                            }} 
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-xl font-bold ${styles.text}`}>{job.match_percentage}%</span>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-extrabold text-gray-900 text-2xl mb-1">{job.job_title}</h3>
                        <p className="text-gray-500 font-medium">Skill Match Analysis</p>
                      </div>
                    </div>
                    
                    <div className="hidden md:block">
                      <div className={`px-4 py-2 rounded-full font-bold text-sm bg-white shadow-sm border ${styles.text}`}>
                        {job.match_percentage >= 80 ? 'Highly Qualified' : job.match_percentage >= 50 ? 'On Track' : 'Needs Work'}
                      </div>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    
                    {/* Skills you have */}
                    <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs">✅</div>
                        <h4 className="font-bold text-gray-900">Skills Acquired</h4>
                      </div>
                      {job.have?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {job.have.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-semibold border border-emerald-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-400 text-sm italic">None yet</p>
                      )}
                    </div>

                    {/* Missing Must Have */}
                    <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs">❌</div>
                        <h4 className="font-bold text-gray-900">Required Skills</h4>
                      </div>
                      {job.missing_must_have?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {job.missing_must_have.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-semibold border border-red-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-emerald-500 text-sm font-medium">All requirements met! 🎉</p>
                      )}
                    </div>

                    {/* Missing Good to Have */}
                    <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs">⚡</div>
                        <h4 className="font-bold text-gray-900">Bonus Skills</h4>
                      </div>
                      {job.missing_good_to_have?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {job.missing_good_to_have.map((skill, i) => (
                            <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-semibold border border-amber-100">
                              {skill}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-emerald-500 text-sm font-medium">All bonuses met! 🌟</p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <span className="text-4xl">💼</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Set Your Career Target</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">Add a dream job to see exactly which skills you need to learn to become a top candidate.</p>
            <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
              Select Your First Dream Job
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default JobsPage