import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/grades', icon: '📝', label: 'Grades & CGPA' },
  { to: '/attendance', icon: '📅', label: 'Attendance' },
  { to: '/assignments', icon: '📌', label: 'Assignments' },
  { to: '/calendar', icon: '🗓️', label: 'Calendar' },
  { to: '/skills', icon: '🧠', label: 'Skills' },
  { to: '/jobs', icon: '💼', label: 'Dream Jobs' },
  { to: '/reports', icon: '📄', label: 'Reports' },
]

const Sidebar = () => {
  return (
    <aside className="fixed left-0 top-14 bottom-0 w-56 bg-white border-r border-gray-200 overflow-y-auto z-40">
      <div className="p-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
          Main Menu
        </p>
        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
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
    </aside>
  )
}

export default Sidebar