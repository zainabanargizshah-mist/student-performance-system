// Download a blob file
export const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

// Format date nicely
export const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })
}

// Get grade color
export const getGradeColor = (grade) => {
  const colors = {
    'O': 'text-green-600',
    'A+': 'text-green-500',
    'A': 'text-blue-500',
    'B+': 'text-blue-400',
    'B': 'text-yellow-500',
    'C': 'text-orange-500',
    'F': 'text-red-600',
  }
  return colors[grade] || 'text-gray-500'
}

// Get attendance color
export const getAttendanceColor = (percentage) => {
  if (percentage >= 85) return 'text-green-600'
  if (percentage >= 75) return 'text-yellow-500'
  return 'text-red-600'
}

// Get match color for dream jobs
export const getMatchColor = (percentage) => {
  if (percentage >= 75) return 'text-green-600'
  if (percentage >= 50) return 'text-yellow-500'
  return 'text-red-500'
}

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}