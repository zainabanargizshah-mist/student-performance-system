import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import Dashboard from './pages/dashboard/Dashboard'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      } />
    </Routes>
  )
}

export default App