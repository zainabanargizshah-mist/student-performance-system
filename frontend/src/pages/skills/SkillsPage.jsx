import { useState, useEffect } from 'react'
import { smartAPI } from '../../utils/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import { CardSkeleton } from '../../components/Skeleton'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

const SkillsPage = () => {
  const [skillsData, setSkillsData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSkills() }, [])

  const fetchSkills = async () => {
    try {
      const res = await smartAPI.getSkills()
      setSkillsData(res.data)
    } catch (err) {
      console.error(err)
    } finally { 
      setLoading(false) 
    }
  }

  // Generate data for Radar Chart by grouping skills into categories
  const getRadarData = (skills) => {
    if (!skills || skills.length === 0) return []
    
    // Simple categorization logic for demo purposes
    const categories = {
      'Programming': ['Python', 'Java', 'C++', 'JavaScript', 'HTML', 'CSS', 'C'],
      'Data & AI': ['SQL', 'Machine Learning', 'TensorFlow', 'Data Analysis', 'Deep Learning'],
      'Systems': ['Linux', 'Operating Systems', 'Networks', 'Database Management', 'Cloud'],
      'Logic & Math': ['Data Structures', 'Algorithms', 'Mathematics', 'Statistics', 'Logic'],
      'Engineering': ['Software Engineering', 'System Design', 'Testing', 'Agile']
    }

    const data = Object.keys(categories).map(cat => ({
      subject: cat,
      A: 0,
      fullMark: 100,
    }))

    skills.forEach(skill => {
      let found = false
      Object.keys(categories).forEach(cat => {
        if (categories[cat].some(s => skill.toLowerCase().includes(s.toLowerCase()))) {
          const item = data.find(d => d.subject === cat)
          item.A += 20 // add 20 points per skill in category
          if (item.A > 100) item.A = 100
          found = true
        }
      })
      if (!found) {
        // distribute uncategorized skills randomly for visual effect
        data[Math.floor(Math.random() * data.length)].A += 10
      }
    })

    return data
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Sidebar />
      <main className="ml-56 pt-14 p-8">

        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Skills Profile
          </h1>
          <p className="text-gray-500 mt-1">Visualize your capabilities acquired through courses and certifications</p>
        </div>

        {skillsData ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Stats & Radar Chart */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Total skills card */}
              <div className="bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-3xl p-8 shadow-lg relative overflow-hidden group">
                <div className="absolute -right-4 -top-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="relative z-10">
                  <div className="text-6xl font-extrabold mb-2">{skillsData.total_skills}</div>
                  <div className="text-indigo-100 font-medium text-lg">Total Skills Acquired</div>
                </div>
              </div>

              {/* Radar Chart */}
              {skillsData.all_skills.length > 0 && (
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 text-center">Skill Distribution</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData(skillsData.all_skills)}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                        <Radar name="Skills" dataKey="A" stroke="#6366f1" fill="#818cf8" fillOpacity={0.5} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Skill Tags & Breakdown */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* All Skills Cloud */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  Mastered Skills
                </h3>
                {skillsData.all_skills.length > 0 ? (
                  <div className="flex flex-wrap gap-2.5">
                    {skillsData.all_skills.map((skill, i) => (
                      <span key={i}
                        className="px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-xl text-sm font-bold shadow-sm border border-indigo-100/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                        style={{ animationDelay: `${i * 50}ms` }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No skills acquired yet.</p>
                )}
              </div>

              {/* Skills Breakdown */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  Skill Sources
                </h3>
                
                <div className="flex flex-col gap-4">
                  {skillsData.breakdown_by_subject.length > 0 ? (
                    skillsData.breakdown_by_subject.map((item, i) => (
                      <div key={i} className="group relative bg-slate-50 rounded-2xl p-5 border border-slate-100 hover:border-indigo-200 hover:bg-indigo-50/30 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg mt-0.5 ${item.type === 'certification' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'}`}>
                              {item.type === 'certification' ? '🏆' : '📚'}
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 leading-tight">{item.source}</div>
                              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
                                {item.type === 'certification' 
                                  ? `Certification • ${item.platform}` 
                                  : `Academic Subject • Semester ${item.semester}`}
                              </div>
                            </div>
                          </div>
                          <span className="text-sm bg-white border border-gray-200 px-3 py-1 rounded-lg font-bold text-gray-700 shadow-sm shrink-0">
                            {item.skills.length} Skills
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 ml-11">
                          {item.skills.map((skill, j) => (
                            <span key={j}
                              className="px-2.5 py-1 bg-white text-gray-600 rounded-md text-xs font-medium border border-gray-200 shadow-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 text-sm">
                      No learning sources found. Add subjects or certifications to see where your skills come from.
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🧠</span>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Build Your Skill Profile</h3>
            <p className="text-gray-500 text-sm max-w-md mx-auto">Add subjects in Grades page or external courses in Certifications to automatically extract and visualize your skills.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default SkillsPage