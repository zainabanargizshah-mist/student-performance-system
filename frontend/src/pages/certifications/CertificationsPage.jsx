import { useState, useEffect } from 'react'
import { studentAPI } from '../../utils/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'
import ConfirmModal from '../../components/ConfirmModal'
import { CardSkeleton } from '../../components/Skeleton'

const CertificationsPage = () => {
  const [certifications, setCertifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchingData, setFetchingData] = useState(false)
  const [showForm, setShowForm] = useState(false)
  
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState({
    name: '', platform: 'Coursera', skills_gained: '', certificate_url: '', completed_date: ''
  })
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [certToDelete, setCertToDelete] = useState(null)
  const [submitLoading, setSubmitLoading] = useState(false)

  const platforms = ['Coursera', 'Udemy', 'NPTEL', 'edX', 'LinkedIn Learning', 'AWS', 'Google', 'Microsoft', 'Other']

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setFetchingData(true)
    try {
      const res = await studentAPI.getCertifications()
      setCertifications(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
      setFetchingData(false)
    }
  }

  const handleOpenAddForm = () => {
    setEditingId(null)
    setForm({ name: '', platform: 'Coursera', skills_gained: '', certificate_url: '', completed_date: '' })
    setShowForm(true)
  }

  const handleEditClick = (cert) => {
    setEditingId(cert.id)
    setForm({
      name: cert.name,
      platform: cert.platform,
      skills_gained: cert.skills_gained,
      certificate_url: cert.certificate_url,
      completed_date: cert.completed_date ? cert.completed_date.split('T')[0] : ''
    })
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitLoading(true)
    
    // Ensure date is valid ISO string or empty
    const dataToSubmit = { ...form }
    if (!dataToSubmit.completed_date) {
        dataToSubmit.completed_date = new Date().toISOString()
    } else {
        dataToSubmit.completed_date = new Date(dataToSubmit.completed_date).toISOString()
    }

    try {
      if (editingId) {
        await studentAPI.updateCertification(editingId, dataToSubmit)
      } else {
        await studentAPI.addCertification(dataToSubmit)
      }
      setShowForm(false)
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error saving certification')
    } finally {
      setSubmitLoading(false)
    }
  }

  const confirmDelete = (cert) => {
    setCertToDelete(cert)
    setIsDeleteModalOpen(true)
  }

  const handleDelete = async () => {
    if (!certToDelete) return
    setSubmitLoading(true)
    try {
      await studentAPI.deleteCertification(certToDelete.id)
      setIsDeleteModalOpen(false)
      setCertToDelete(null)
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error deleting certification')
    } finally {
      setSubmitLoading(false)
    }
  }

  const getPlatformIcon = (platform) => {
    const p = platform.toLowerCase()
    if (p.includes('coursera')) return <span className="text-blue-600 bg-blue-50 p-2 rounded-lg text-xl font-bold font-serif">C</span>
    if (p.includes('udemy')) return <span className="text-purple-600 bg-purple-50 p-2 rounded-lg text-xl font-bold font-sans tracking-tighter">U</span>
    if (p.includes('nptel')) return <span className="text-orange-600 bg-orange-50 p-2 rounded-lg text-xl font-bold">N</span>
    if (p.includes('google')) return <span className="text-red-500 bg-red-50 p-2 rounded-lg text-xl font-bold">G</span>
    if (p.includes('aws')) return <span className="text-amber-500 bg-amber-50 p-2 rounded-lg text-xl font-bold">A</span>
    return <span className="text-gray-600 bg-gray-100 p-2 rounded-lg text-xl font-bold">🎓</span>
  }

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
              Certifications
            </h1>
            <p className="text-gray-500 mt-1">Track your extra-curricular learning and upskilling</p>
          </div>
          <button onClick={handleOpenAddForm}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
            Add Certificate
          </button>
        </div>

        {/* Add/Edit Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-fade-in-up">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h3 className="text-lg font-bold text-gray-900">
                  {editingId ? 'Edit Certification' : 'Add New Certification'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Course / Certificate Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="e.g. Machine Learning Specialization"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Platform / Provider</label>
                    <select required value={form.platform} onChange={e => setForm({...form, platform: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors">
                      {platforms.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Completion Date</label>
                    <input type="date" required value={form.completed_date} onChange={e => setForm({...form, completed_date: e.target.value})}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Skills Gained (comma separated)</label>
                    <input type="text" value={form.skills_gained} onChange={e => setForm({...form, skills_gained: e.target.value})}
                      placeholder="e.g. Python, TensorFlow, Data Analysis"
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Certificate URL (optional)</label>
                    <input type="url" value={form.certificate_url} onChange={e => setForm({...form, certificate_url: e.target.value})}
                      placeholder="https://coursera.org/verify/..."
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors" />
                  </div>
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                  <button type="button" onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl transition-colors border border-transparent">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitLoading}
                    className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                    {submitLoading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : null}
                    {editingId ? 'Save Changes' : 'Add Certification'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Certifications Grid */}
        {fetchingData ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <CardSkeleton key={i} height="h-64" />)}
          </div>
        ) : certifications.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certifications.map(cert => (
              <div key={cert.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full overflow-hidden">
                <div className="p-6 flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      {getPlatformIcon(cert.platform)}
                      <div>
                        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">{cert.platform}</div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(cert.completed_date).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(cert)} className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                      </button>
                      <button onClick={() => confirmDelete(cert)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 text-lg leading-tight mb-4">
                    {cert.name}
                  </h3>
                  
                  {cert.skills_gained && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {cert.skills_gained.split(',').map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-lg border border-gray-100">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                {cert.certificate_url ? (
                  <a href={cert.certificate_url} target="_blank" rel="noopener noreferrer" 
                    className="bg-gray-50 border-t border-gray-100 p-4 text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex justify-center items-center gap-2">
                    View Credential
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                  </a>
                ) : (
                  <div className="bg-gray-50/50 border-t border-gray-100 p-4 text-center text-sm text-gray-400">
                    No link provided
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 backdrop-blur-sm">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
              <span className="text-4xl">🏆</span>
            </div>
            <h4 className="text-gray-900 font-bold text-lg mb-2">No Certifications Yet</h4>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6 leading-relaxed">Add your external courses and certifications to build a stronger profile and improve job recommendations.</p>
            <button onClick={handleOpenAddForm} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200">
              Add Your First Certificate
            </button>
          </div>
        )}
      </main>

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        title="Delete Certification"
        message={`Are you sure you want to delete "${certToDelete?.name}"? This action cannot be undone.`}
        confirmText={submitLoading ? 'Deleting...' : 'Delete'}
        onConfirm={handleDelete}
        onCancel={() => !submitLoading && setIsDeleteModalOpen(false)}
        isDestructive={true}
      />
    </div>
  )
}

export default CertificationsPage
