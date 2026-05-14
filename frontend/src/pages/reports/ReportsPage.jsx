import { useState } from 'react'
import { reportsAPI } from '../../utils/api'
import { downloadFile } from '../../utils/helpers'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'

const ReportsPage = () => {
  const [downloading, setDownloading] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleDownload = async (type) => {
    setDownloading(type)
    try {
      let res, filename
      if (type === 'pdf') {
        res = await reportsAPI.downloadPDF()
        filename = 'performance_report.pdf'
      } else if (type === 'excel') {
        res = await reportsAPI.downloadExcel()
        filename = 'performance_report.xlsx'
      } else {
        res = await reportsAPI.downloadResume()
        filename = 'resume_summary.pdf'
      }
      downloadFile(res.data, filename)
    } catch (err) {
      alert('Error downloading report. Make sure you have added subjects first!')
    } finally { 
      setDownloading('') 
    }
  }

  const reports = [
    {
      type: 'pdf',
      icon: '📄',
      title: 'Full Performance Report',
      description: 'Complete academic report with grades, attendance, and SGPA trends. Perfect for parents or mentors.',
      color: 'from-red-500 to-rose-600',
      shadow: 'shadow-red-200',
      bgHover: 'hover:bg-red-50',
      tag: 'PDF Document'
    },
    {
      type: 'excel',
      icon: '📊',
      title: 'Excel Data Export',
      description: 'Raw data of your marks, attendance and certifications in a spreadsheet for custom analysis.',
      color: 'from-emerald-500 to-green-600',
      shadow: 'shadow-emerald-200',
      bgHover: 'hover:bg-emerald-50',
      tag: 'XLSX Spreadsheet'
    },
    {
      type: 'resume',
      icon: '🎓',
      title: 'Resume Academic Summary',
      description: 'One-page professional PDF with your CGPA, strong subjects and acquired skills. Ready for job applications.',
      color: 'from-indigo-500 to-purple-600',
      shadow: 'shadow-indigo-200',
      bgHover: 'hover:bg-indigo-50',
      tag: 'PDF Resume'
    }
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="ml-0 lg:ml-60 pt-14 p-8">

        {/* Header Section */}
        <div className="mb-10 animate-fade-in-up">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            Export Center
          </h1>
          <p className="text-gray-500 mt-2 text-lg">Generate professional documents from your academic data</p>
        </div>

        {/* Report Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {reports.map(report => (
            <div key={report.type}
              className={`bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 flex flex-col overflow-hidden group`}>
              
              {/* Card Header with Gradient */}
              <div className={`h-3 bg-gradient-to-r ${report.color}`}></div>
              
              <div className="p-8 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${report.color} flex items-center justify-center text-3xl shadow-lg ${report.shadow} text-white transform group-hover:scale-110 transition-transform duration-300`}>
                    {report.icon}
                  </div>
                  <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-500 rounded-full">
                    {report.tag}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{report.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-1">{report.description}</p>
                
                <button
                  onClick={() => handleDownload(report.type)}
                  disabled={downloading === report.type}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${report.color} text-white shadow-md ${report.shadow} hover:shadow-lg flex items-center justify-center gap-2`}>
                  {downloading === report.type ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      Download Now
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Info/Tips Section */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center animate-fade-in-up">
          <div className="w-16 h-16 shrink-0 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center text-3xl">
            💡
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3">Important Notes</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                You must add at least one subject with marks before downloading reports.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                The Excel export extracts data into separate sheets for Grades, Attendance, and Certifications.
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Resume Summaries automatically highlight your top 5 strongest subjects.
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ReportsPage