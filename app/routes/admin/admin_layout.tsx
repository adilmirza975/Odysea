import React from 'react'
import { Outlet } from 'react-router'

 
const admin_layout = () => {
  return (
    <div className='admin-layout'>
      AdminLayout
      <aside className='w-full max-w-[270px] hidden lg:block'>
        Sidebar
      </aside>

      <aside className='children'>
        <Outlet/>
      </aside>
    </div>
  )
}

export default admin_layout
