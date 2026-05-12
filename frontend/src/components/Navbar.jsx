import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
      
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">SP</span>
        </div>
        <span className="font-semibold text-gray-800 text-sm">
          Student Performance
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-semibold text-sm">
              {user?.full_name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="text-sm text-gray-700 hidden md:block">
            {user?.full_name}
          </span>
        </div>

        {/* Logout button */}
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-red-500 transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar