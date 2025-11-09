import React from 'react'
import { Link, NavLink } from 'react-router'
import { sidebarItems } from '~/constants'

import { cn } from '~/lib/utils'


// we will ise handle click from miblesidebar when we are clicking something
const Navitems = ({handleClick} : {handleClick: ()=> void}) => {

  const user = {
    name: 'Adil Mirza',
    email: 'coderxtech284@gmail.com',
    imageUrl: '/assets/images/david.webp'

  }

  return (
    <section>

      <Link to='/' className='link-logo' >
        <img src="/assets/icons/logo.svg" alt="logo" className='size-[30px] ml-4' />
        <h1>Odysea</h1>
      </Link>

      <div>
        <nav className='mt-6'>
          {sidebarItems.map(({ id, href, icon, label }) =>
          (
            <NavLink to={href} key={id}>
              {({ isActive }: { isActive: boolean }) => (
                <div className={cn('mt-2 group  nav-item', {
                  'bg-primary-100 !text-white': isActive
                })} onClick={handleClick}>
                  <img
                    src={icon}
                    alt={label}
                    className={`group-hover:brightness-0 size-0 group-hover:invert ${isActive ? 'brightness-0 invert' : 'text-dark-200'}`} />
                  {label}
                </div>
              )}
            </NavLink>
          )
          )}
        </nav>

        <footer className='nav-footer'>
          <img src={user?.imageUrl || '/assets/image/david.webp'} alt={user?.name || 'Adil Mirza'} />

          <article>
            <h2>{user?.name}</h2>
            <p>{user?.email}</p>
          </article>

          <button
            onClick={() => {
              console.log('logout')
            }}
            className='cursor-pointer'
          >
            <img 
            src="/assets/icons/logout.svg" 
            alt="logout"
            className='size-6' />
          </button>


        </footer>

      </div>

    </section >
  )
}

export default Navitems





