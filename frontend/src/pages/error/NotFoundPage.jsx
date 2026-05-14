import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center animate-fade-in-up">
        {/* Decorative Graphic */}
        <div className="relative w-48 h-48 mx-auto mb-8">
          <div className="absolute inset-0 bg-indigo-100 rounded-full animate-pulse opacity-50"></div>
          <div className="absolute inset-4 bg-indigo-50 rounded-full shadow-inner flex items-center justify-center">
            <span className="text-6xl filter drop-shadow-md">🔍</span>
          </div>
          {/* Floating elements */}
          <div className="absolute -top-4 -right-4 text-3xl animate-bounce" style={{animationDelay: '100ms'}}>✨</div>
          <div className="absolute -bottom-4 -left-4 text-3xl animate-bounce" style={{animationDelay: '300ms'}}>🤔</div>
        </div>

        <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Oops! The page you're looking for seems to have gone missing or never existed. 
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard" 
            className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Back to Dashboard
          </Link>
          <button onClick={() => window.history.back()}
            className="bg-white text-gray-700 border border-gray-200 px-8 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Go Back
          </button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
