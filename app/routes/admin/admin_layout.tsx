import React from 'react'
import { Outlet, redirect } from 'react-router'
import { SidebarComponent } from '@syncfusion/ej2-react-navigations'
import { MobileSidebar,} from 'components'
import Navitems from 'components/Navitems'
import { account } from '~/appwrite/client'
import { getExistingUser, storeUserData } from '~/appwrite/auth'


// loader at the top because data fetching takes some time and meanwhile the loader makes app appear faster.
export async function clientLoader(){
  try{
    const user = await account.get()
    if(!user.$id){ 
      return redirect('/sign_in')
    }
    // regular user should only be able to see the dashboard ,others just get redirect to the home page
    const existingUser = await getExistingUser(user.$id)
    if (existingUser ?.status==='user'){
      return redirect('/')
    }

    // finally we will return the existing users to the 
    return existingUser?.$id ? existingUser:await storeUserData()
  }catch(e){
    console.log('Error in Client Loader',e)
    return redirect('/sign_in')
  }
}


// main content -->
const admin_layout = () => {
  return (
    <div className='admin-layout'>
      
      <MobileSidebar />

      <aside className='w-full max-w-[270px] hidden lg:block'>
        <SidebarComponent width={270} enableGestures={false}>

          <Navitems />

        </SidebarComponent>
      </aside>

      <aside className='children'>
        <Outlet />
      </aside>

    </div>
  )
}

export default admin_layout
