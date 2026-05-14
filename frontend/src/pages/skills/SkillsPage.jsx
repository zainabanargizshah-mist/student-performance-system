import { useState, useEffect } from 'react'
import { smartAPI } from '../../utils/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts'

const SKILL_CATEGORIES = [
  'Programming', 'Data & AI', 'Systems', 'Web Development',
  'Logic & Math', 'Engineering', 'Design', 'Communication', 'Other'
]

const SkillsPage = () => {
  const [skillsData, setSkillsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Add skill form
  const [showAddForm, setShowAddForm] = useState(false)
  const [skillForm, setSkillForm] = useState({ name: '', category: 'Other' })
  const [addingSkill, setAddingSkill] = useState(false)
  const [addError, setAddError] = useState('')

  // Delete state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [skillToDelete, setSkillToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const handleAddSkill = async (e) => {
    e.preventDefault()
    if (!skillForm.name.trim()) return
    setAddingSkill(true)
    setAddError('')
    try {
      await smartAPI.addSkill(skillForm)
      setSkillForm({ name: '', category: 'Other' })
      setShowAddForm(false)
      await fetchSkills()
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Failed to add skill')
    } finally {
      setAddingSkill(false)
    }
  }

  const confirmDelete = (skill) => {
    setSkillToDelete(skill)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteSkill = async () => {
    if (!skillToDelete) return
    setIsDeleting(true)
    try {
      await smartAPI.deleteSkill(skillToDelete.id)
      setIsDeleteModalOpen(false)
      setSkillToDelete(null)
      await fetchSkills()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete skill')
    } finally {
      setIsDeleting(false)
    }
  }

  // Generate data for Radar Chart by grouping skills into categories
  const getRadarData = (skills) => {
    if (!skills || skills.length === 0) return []
    
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
          item.A += 20
          if (item.A > 100) item.A = 100
          found = true
        }
      })
      if (!found) {
        data[Math.floor(Math.random() * data.length)].A += 10
      }
    })

    return data
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="ml-0 lg:ml-60 pt-14 p-8">

        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Skills Profile
            </h1>
            <p className="text-gray-500 mt-1">Visualize your capabilities acquired through courses, certifications & custom entries</p>
          </div>
          <button
            onClick={() => { setShowAddForm(!showAddForm); setAddError('') }}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2 shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Skill
          </button>
        </div>

        {/* Add Skill Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 animate-fade-in">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              Add a Custom Skill
            </h4>
            
            {addError && (
              <div className="p-3 rounded-xl mb-4 text-sm font-medium bg-red-50 text-red-700 border border-red-100">
                {addError}
              </div>
            )}

            <form onSubmit={handleAddSkill}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="md:col-span-1">
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Skill Name</label>
                  <input
                    type="text"
                    value={skillForm.name}
                    onChange={e => setSkillForm({...skillForm, name: e.target.value})}
                    placeholder="e.g. React.js, Docker, Figma"
                    required
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Category</label>
                  <select
                    value={skillForm.category}
                    onChange={e => setSkillForm({...skillForm, category: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  >
                    {SKILL_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end gap-3">
                  <button
                    type="submit"
                    disabled={addingSkill}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
                  >
                    {addingSkill ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : null}
                    Add Skill
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="bg-white text-gray-600 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

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

            {/* Right Column: Skill Tags, Custom Skills & Breakdown */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              
              {/* Custom Skills Section */}
              {skillsData.custom_skills && skillsData.custom_skills.length > 0 && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path></svg>
                    My Custom Skills
                    <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold ml-2">{skillsData.custom_skills.length}</span>
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {skillsData.custom_skills.map((skill) => (
                      <span key={skill.id}
                        className="group relative px-4 py-2 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-xl text-sm font-bold shadow-sm border border-purple-100/50 hover:-translate-y-1 hover:shadow-md transition-all duration-300"
                      >
                        {skill.name}
                        <button
                          onClick={() => confirmDelete(skill)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-sm"
                          title="Delete skill"
                        >
                          ×
                        </button>
                        {skill.category !== 'Other' && (
                          <span className="block text-[10px] text-purple-400 font-medium mt-0.5">{skill.category}</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* All Skills Cloud */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  All Skills
                  <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-bold ml-2">{skillsData.all_skills.length}</span>
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
                  <div className="py-8 text-center text-gray-400">
                    <p className="text-sm">No skills acquired yet. Add subjects, certifications, or custom skills to get started.</p>
                  </div>
                )}
              </div>

              {/* Skills Breakdown */}
              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
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
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">Add subjects in Grades page, courses in Certifications, or add custom skills directly here.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
            >
              + Add Your First Skill
            </button>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Skill"
        message={`Are you sure you want to remove "${skillToDelete?.name}" from your skills? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Skill'}
        onConfirm={handleDeleteSkill}
        onCancel={() => !isDeleting && setIsDeleteModalOpen(false)}
        isDestructive={true}
      />
    </div>
  )
}

export default SkillsPage