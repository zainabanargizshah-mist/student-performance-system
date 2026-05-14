import { useState, useEffect } from 'react'
import { studentAPI } from '../../utils/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import { CardSkeleton } from '../../components/Skeleton'

const GradesPage = () => {
  const [profile, setProfile] = useState(null)
  const [subjects, setSubjects] = useState([])
  const [cgpa, setCgpa] = useState(null)
  const [sgpa, setSgpa] = useState(null)
  const [loading, setLoading] = useState(true)
  const [fetchingSubjects, setFetchingSubjects] = useState(false)
  const [showProfileForm, setShowProfileForm] = useState(false)
  const [showSubjectForm, setShowSubjectForm] = useState(false)
  const [selectedSemester, setSelectedSemester] = useState(1)
  
  // Edit State
  const [editingSubject, setEditingSubject] = useState(null)
  const [editForm, setEditForm] = useState({})
  
  // Delete State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [subjectToDelete, setSubjectToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [profileForm, setProfileForm] = useState({
    full_name: '', roll_number: '', degree: '', branch: '', current_semester: 1
  })
  const [subjectForm, setSubjectForm] = useState({
    name: '', code: '', credits: 3, semester: 1,
    internal_marks: 0, external_marks: 0
  })

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (profile) {
      fetchSubjectsAndSGPA()
    }
  }, [selectedSemester, profile])

  const fetchData = async () => {
    try {
      const profileRes = await studentAPI.getProfile()
      setProfile(profileRes.data)
      const cgpaRes = await studentAPI.getCGPA()
      setCgpa(cgpaRes.data)
    } catch {
      setShowProfileForm(true)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubjectsAndSGPA = async () => {
    setFetchingSubjects(true)
    try {
      const [subRes, sgpaRes] = await Promise.all([
        studentAPI.getSubjects(selectedSemester),
        studentAPI.getSGPA(selectedSemester).catch(() => ({ data: { sgpa: 0 } }))
      ])
      setSubjects(subRes.data)
      setSgpa(sgpaRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setFetchingSubjects(false)
    }
  }

  const handleCreateProfile = async (e) => {
    e.preventDefault()
    try {
      await studentAPI.createProfile(profileForm)
      setShowProfileForm(false)
      fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error creating profile')
    }
  }

  const handleAddSubject = async (e) => {
    e.preventDefault()
    try {
      await studentAPI.addSubject({...subjectForm, semester: selectedSemester})
      setShowSubjectForm(false)
      setSubjectForm({ name: '', code: '', credits: 3, semester: 1, internal_marks: 0, external_marks: 0 })
      await fetchSubjectsAndSGPA()
      const cgpaRes = await studentAPI.getCGPA()
      setCgpa(cgpaRes.data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error adding subject')
    }
  }

  const handleEditClick = (subject) => {
    setEditingSubject(subject.id)
    setEditForm({
      name: subject.name,
      code: subject.code,
      credits: subject.credits,
      internal_marks: subject.internal_marks,
      external_marks: subject.external_marks
    })
  }

  const handleSaveEdit = async () => {
    try {
      await studentAPI.updateSubject(editingSubject, { ...editForm, semester: selectedSemester })
      setEditingSubject(null)
      await fetchSubjectsAndSGPA()
      const cgpaRes = await studentAPI.getCGPA()
      setCgpa(cgpaRes.data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error updating subject')
    }
  }

  const confirmDelete = (subject) => {
    setSubjectToDelete(subject)
    setIsDeleteModalOpen(true)
  }

  const handleDeleteSubject = async () => {
    if (!subjectToDelete) return
    setIsDeleting(true)
    try {
      await studentAPI.deleteSubject(subjectToDelete.id)
      setIsDeleteModalOpen(false)
      setSubjectToDelete(null)
      await fetchSubjectsAndSGPA()
      const cgpaRes = await studentAPI.getCGPA()
      setCgpa(cgpaRes.data)
    } catch (err) {
      alert(err.response?.data?.detail || 'Error deleting subject')
    } finally {
      setIsDeleting(false)
    }
  }

  const getGradeBadge = (grade) => {
    const styles = {
      'O': 'bg-green-100 text-green-700 ring-green-600/20 shadow-green-100',
      'A+': 'bg-emerald-100 text-emerald-700 ring-emerald-600/20 shadow-emerald-100',
      'A': 'bg-teal-100 text-teal-700 ring-teal-600/20 shadow-teal-100',
      'B+': 'bg-blue-100 text-blue-700 ring-blue-600/20 shadow-blue-100',
      'B': 'bg-indigo-100 text-indigo-700 ring-indigo-600/20 shadow-indigo-100',
      'C': 'bg-yellow-100 text-yellow-700 ring-yellow-600/20 shadow-yellow-100',
      'F': 'bg-red-100 text-red-700 ring-red-600/20 shadow-red-100'
    }
    const style = styles[grade] || 'bg-gray-100 text-gray-700 ring-gray-600/20 shadow-gray-100'
    
    return (
      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ring-1 ring-inset shadow-sm transition-transform hover:scale-110 ${style}`}>
        {grade}
      </span>
    )
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
              Grades & CGPA
            </h1>
            <p className="text-gray-500 mt-1">Manage your academic performance seamlessly</p>
          </div>
          {cgpa && (
            <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-indigo-50 flex items-center gap-4 hover:shadow-md transition-shadow">
              <div className="p-3 bg-indigo-50 rounded-xl">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0v6"></path></svg>
              </div>
              <div>
                <div className="text-sm text-gray-500 font-medium">Overall CGPA</div>
                <div className="text-2xl font-bold text-gray-900">{cgpa.cgpa}</div>
              </div>
            </div>
          )}
        </div>

        {/* Profile Form */}
        {showProfileForm && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 animate-fade-in-up">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Setup Student Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: 'Full Name', key: 'full_name', type: 'text', placeholder: 'Zainaba Nargis' },
                { label: 'Roll Number', key: 'roll_number', type: 'text', placeholder: '21CS001' },
                { label: 'Degree', key: 'degree', type: 'text', placeholder: 'B.Tech' },
                { label: 'Branch', key: 'branch', type: 'text', placeholder: 'Computer Science' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">{field.label}</label>
                  <input type={field.type} placeholder={field.placeholder}
                    value={profileForm[field.key]}
                    onChange={e => setProfileForm({...profileForm, [field.key]: e.target.value})}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  />
                </div>
              ))}
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1.5">Current Semester</label>
                <input type="number" min="1" max="8"
                  value={profileForm.current_semester}
                  onChange={e => setProfileForm({...profileForm, current_semester: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                />
              </div>
            </div>
            <button onClick={handleCreateProfile}
              className="mt-6 bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
              Save Profile
            </button>
          </div>
        )}

        {profile && (
          <div className="space-y-6">
            {/* Semester Tabs */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-gray-100 flex gap-2 overflow-x-auto no-scrollbar">
              {Array.from({length: profile.current_semester}, (_, i) => i + 1).map(sem => (
                <button key={sem}
                  onClick={() => setSelectedSemester(sem)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    selectedSemester === sem 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                  Semester {sem}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              {/* Header for Semester Subjects */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-4">
                  <h3 className="text-xl font-bold text-gray-900">Semester {selectedSemester} Subjects</h3>
                  {sgpa && sgpa.sgpa > 0 && (
                    <div className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-bold rounded-lg border border-purple-100">
                      SGPA: {sgpa.sgpa}
                    </div>
                  )}
                </div>
                <button onClick={() => setShowSubjectForm(!showSubjectForm)}
                  className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-100 transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                  Add Subject
                </button>
              </div>

              {/* Add Subject Form */}
              {showSubjectForm && (
                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-6 animate-fade-in-down">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    New Subject Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Subject Name</label>
                      <input type="text" placeholder="e.g. Data Structures" value={subjectForm.name} onChange={e => setSubjectForm({...subjectForm, name: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Code</label>
                      <input type="text" placeholder="CS301" value={subjectForm.code} onChange={e => setSubjectForm({...subjectForm, code: e.target.value})}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Credits</label>
                      <input type="number" placeholder="3" value={subjectForm.credits} onChange={e => setSubjectForm({...subjectForm, credits: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">Internal</label>
                      <input type="number" placeholder="40" value={subjectForm.internal_marks} onChange={e => setSubjectForm({...subjectForm, internal_marks: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">External</label>
                      <input type="number" placeholder="60" value={subjectForm.external_marks} onChange={e => setSubjectForm({...subjectForm, external_marks: parseFloat(e.target.value)})}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
                    </div>
                  </div>
                  <div className="flex gap-3 mt-5">
                    <button onClick={handleAddSubject}
                      className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                      Save Subject
                    </button>
                    <button onClick={() => setShowSubjectForm(false)}
                      className="bg-white text-gray-600 border border-gray-200 px-5 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Subjects Table */}
              {fetchingSubjects ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => <CardSkeleton key={i} height="h-16" />)}
                </div>
              ) : subjects.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-500 border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Subject</th>
                        <th className="px-6 py-4 font-semibold">Code</th>
                        <th className="px-6 py-4 font-semibold">Credits</th>
                        <th className="px-6 py-4 font-semibold">Internal</th>
                        <th className="px-6 py-4 font-semibold">External</th>
                        <th className="px-6 py-4 font-semibold">Total</th>
                        <th className="px-6 py-4 font-semibold">Grade</th>
                        <th className="px-6 py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {subjects.map(subject => (
                        <tr key={subject.id} className="hover:bg-slate-50/50 transition-colors group">
                          {editingSubject === subject.id ? (
                            // Edit Mode
                            <>
                              <td className="px-6 py-3">
                                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full px-2 py-1 text-sm border rounded" />
                              </td>
                              <td className="px-6 py-3">
                                <input type="text" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} className="w-20 px-2 py-1 text-sm border rounded" />
                              </td>
                              <td className="px-6 py-3">
                                <input type="number" value={editForm.credits} onChange={e => setEditForm({...editForm, credits: parseFloat(e.target.value)})} className="w-16 px-2 py-1 text-sm border rounded" />
                              </td>
                              <td className="px-6 py-3">
                                <input type="number" value={editForm.internal_marks} onChange={e => setEditForm({...editForm, internal_marks: parseFloat(e.target.value)})} className="w-16 px-2 py-1 text-sm border rounded" />
                              </td>
                              <td className="px-6 py-3">
                                <input type="number" value={editForm.external_marks} onChange={e => setEditForm({...editForm, external_marks: parseFloat(e.target.value)})} className="w-16 px-2 py-1 text-sm border rounded" />
                              </td>
                              <td className="px-6 py-3 text-gray-400">-</td>
                              <td className="px-6 py-3 text-gray-400">-</td>
                              <td className="px-6 py-3 text-right space-x-2">
                                <button onClick={handleSaveEdit} className="text-green-600 hover:text-green-700 font-medium">Save</button>
                                <button onClick={() => setEditingSubject(null)} className="text-gray-500 hover:text-gray-700">Cancel</button>
                              </td>
                            </>
                          ) : (
                            // View Mode
                            <>
                              <td className="px-6 py-4 font-medium text-gray-900">{subject.name}</td>
                              <td className="px-6 py-4 text-gray-500">{subject.code}</td>
                              <td className="px-6 py-4 text-gray-500">{subject.credits}</td>
                              <td className="px-6 py-4 text-gray-500">{subject.internal_marks}</td>
                              <td className="px-6 py-4 text-gray-500">{subject.external_marks}</td>
                              <td className="px-6 py-4 font-semibold text-gray-900">{subject.total_marks}</td>
                              <td className="px-6 py-4">{getGradeBadge(subject.grade)}</td>
                              <td className="px-6 py-4 text-right">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => handleEditClick(subject)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                  </button>
                                  <button onClick={() => confirmDelete(subject)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h4 className="text-gray-900 font-medium mb-1">No Subjects Yet</h4>
                  <p className="text-gray-500 text-sm max-w-sm mx-auto mb-4">You haven't added any subjects for Semester {selectedSemester} yet. Add your first subject to start tracking your SGPA.</p>
                  <button onClick={() => setShowSubjectForm(true)} className="text-indigo-600 font-medium hover:text-indigo-700 text-sm">
                    + Add your first subject
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Subject"
        message={`Are you sure you want to delete ${subjectToDelete?.name}? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Subject'}
        onConfirm={handleDeleteSubject}
        onCancel={() => !isDeleting && setIsDeleteModalOpen(false)}
        isDestructive={true}
      />
    </div>
  )
}

export default GradesPage