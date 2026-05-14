import { useState, useEffect } from 'react'
import { studentAPI, authAPI } from '../../utils/api'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import LoadingSpinner from '../../components/LoadingSpinner'

const SettingsPage = () => {
  const [profile, setProfile] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    full_name: '', roll_number: '', degree: '', branch: '', current_semester: 1
  })
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' })

  // Password Form State
  const [passwordForm, setPasswordForm] = useState({
    current_password: '', new_password: '', confirm_password: ''
  })
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [profileRes, userRes] = await Promise.all([
        studentAPI.getProfile().catch(() => ({ data: null })),
        authAPI.getMe().catch(() => ({ data: null }))
      ])
      
      if (userRes.data) setUser(userRes.data)
      
      if (profileRes.data) {
        setProfile(profileRes.data)
        setProfileForm({
          full_name: profileRes.data.full_name || '',
          roll_number: profileRes.data.roll_number || '',
          degree: profileRes.data.degree || '',
          branch: profileRes.data.branch || '',
          current_semester: profileRes.data.current_semester || 1
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMsg({ type: '', text: '' })
    
    try {
      const res = await studentAPI.updateProfile(profileForm)
      setProfile(res.data)
      setProfileMsg({ type: 'success', text: 'Profile updated successfully!' })
      setTimeout(() => setProfileMsg({ type: '', text: '' }), 3000)
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to update profile' })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMsg({ type: '', text: '' })
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      return setPasswordMsg({ type: 'error', text: 'New passwords do not match' })
    }
    
    if (passwordForm.new_password.length < 6) {
      return setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters' })
    }

    setSavingPassword(true)
    try {
      await authAPI.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password
      })
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' })
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      setTimeout(() => setPasswordMsg({ type: '', text: '' }), 3000)
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.response?.data?.detail || 'Failed to change password' })
    } finally {
      setSavingPassword(false)
    }
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
            Account Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage your profile and account security</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Account Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center animate-fade-in-up">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-3xl text-white font-bold mx-auto mb-4 shadow-lg shadow-indigo-200">
                {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : user?.full_name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {profile?.full_name || user?.full_name || 'Student'}
              </h2>
              <p className="text-gray-500 text-sm mb-4">{user?.email}</p>
              
              {profile ? (
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold border border-indigo-100">{profile.roll_number}</span>
                  <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100">Semester {profile.current_semester}</span>
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">{profile.branch}</span>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-xl text-amber-700 text-sm">
                  Please complete your academic profile to unlock all features.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Forms */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            
            {/* Edit Profile Form */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-fade-in-up" style={{animationDelay: '100ms'}}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                Academic Profile
              </h3>
              
              {profileMsg.text && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${profileMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {profileMsg.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Full Name</label>
                    <input type="text" required value={profileForm.full_name} onChange={e => setProfileForm({...profileForm, full_name: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Roll Number</label>
                    <input type="text" required value={profileForm.roll_number} onChange={e => setProfileForm({...profileForm, roll_number: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Degree</label>
                    <input type="text" required value={profileForm.degree} onChange={e => setProfileForm({...profileForm, degree: e.target.value})} placeholder="e.g. B.Tech"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Branch</label>
                    <input type="text" required value={profileForm.branch} onChange={e => setProfileForm({...profileForm, branch: e.target.value})} placeholder="e.g. Computer Science"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Current Semester</label>
                    <select required value={profileForm.current_semester} onChange={e => setProfileForm({...profileForm, current_semester: parseInt(e.target.value)})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors">
                      {[1,2,3,4,5,6,7,8,9,10].map(s => <option key={s} value={s}>Semester {s}</option>)}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={savingProfile}
                    className="bg-indigo-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 disabled:opacity-70 flex items-center gap-2">
                    {savingProfile ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : null}
                    Save Profile Changes
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-fade-in-up" style={{animationDelay: '200ms'}}>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                Security
              </h3>
              
              {passwordMsg.text && (
                <div className={`p-4 rounded-xl mb-6 text-sm font-medium ${passwordMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                  {passwordMsg.text}
                </div>
              )}

              <form onSubmit={handleChangePassword}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
                  <div className="md:col-span-2">
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Current Password</label>
                    <input type="password" required value={passwordForm.current_password} onChange={e => setPasswordForm({...passwordForm, current_password: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">New Password</label>
                    <input type="password" required value={passwordForm.new_password} onChange={e => setPasswordForm({...passwordForm, new_password: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-1.5">Confirm New Password</label>
                    <input type="password" required value={passwordForm.confirm_password} onChange={e => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors" />
                  </div>
                </div>
                <div className="flex justify-end">
                  <button type="submit" disabled={savingPassword}
                    className="bg-gray-900 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors shadow-md disabled:opacity-70 flex items-center gap-2">
                    {savingPassword ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : null}
                    Update Password
                  </button>
                </div>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}

export default SettingsPage
