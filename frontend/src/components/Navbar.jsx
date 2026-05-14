import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50">

      {/* Left side */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuToggle} className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">SP</span>
        </div>
        <span className="font-semibold text-gray-800 text-sm">
          Student Performance
        </span>
      </div>

      {/* Right side */}
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 hover:bg-gray-50 rounded-lg px-2 py-1.5 transition-colors"
        >
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-sm">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-700 hidden md:block">
            {user?.full_name}
          </span>
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl border border-gray-200 shadow-lg z-50 py-1 animate-fade-in">
              <button onClick={() => { navigate('/settings'); setShowDropdown(false) }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                ⚙️ Settings
              </button>
              <hr className="my-1 border-gray-100" />
              <button onClick={logout}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                🚪 Logout
              </button>
            </div>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar