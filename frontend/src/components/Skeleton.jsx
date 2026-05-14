import React from 'react'

const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseClasses = 'animate-pulse bg-gray-200'
  
  const variants = {
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    text: 'rounded h-4 w-full'
  }
  
  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}></div>
  )
}

export const CardSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full">
    <Skeleton variant="text" className="w-1/3 mb-4" />
    <Skeleton variant="rectangular" className="h-24 w-full mb-4" />
    <Skeleton variant="text" className="w-2/3" />
  </div>
)

export const TableSkeleton = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden w-full">
    <div className="p-4 border-b border-gray-100 bg-gray-50">
      <Skeleton variant="text" className="w-1/4 h-6" />
    </div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="p-4 border-b border-gray-50 flex gap-4">
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
        <Skeleton variant="text" className="w-1/4" />
      </div>
    ))}
  </div>
)

export default Skeleton
