import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/grades', icon: '📝', label: 'Grades & CGPA' },
  { to: '/attendance', icon: '📅', label: 'Attendance' },
  { to: '/certifications', icon: '🏆', label: 'Certifications' },
  { to: '/calendar', icon: '🗓️', label: 'Calendar' },
  { to: '/skills', icon: '🧠', label: 'Skills' },
  { to: '/jobs', icon: '💼', label: 'Dream Jobs' },
  { to: '/reports', icon: '📄', label: 'Reports' },
]

const bottomLinks = [
  { to: '/settings', icon: '⚙️', label: 'Settings' },
]

const Sidebar = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside className={`fixed left-0 top-14 bottom-0 w-60 bg-white border-r border-gray-200 overflow-y-auto z-40 transition-transform duration-300 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        <div className="p-4 flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Main Menu
          </p>
          <nav className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-medium'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <span className="text-base">{link.icon}</span>
                <span>{link.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-100">
          {bottomLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>
      </aside>
    </>
  )
}

export default Sidebar