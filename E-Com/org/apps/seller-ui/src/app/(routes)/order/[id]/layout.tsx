import React from 'react'

const Layout = ({children}:{children:React.ReactNode}) => {
  return (
      <div className='flex h-full bg-black min-h-screen'>
      {/* Main Content area */}
      <main className='flex-1'>
        <div className='overflow-auto'>{children}</div>
      </main>

    </div>
  )
}

export default Layout
