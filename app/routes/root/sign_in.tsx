
import { Link, redirect } from "react-router";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import { loginWithGoogle } from "~/appwrite/auth";
import { account } from "~/appwrite/client";

// loader at the top because data fetching takes some time and meanwhile the loader makes app appear faster.
export async function clientLoader(){
  try{
    const user = await account.get()
    if(!user.$id){ 
      return redirect('/')
    }
  }catch(e){
    console.log('Error Fetching User',e)
  }
}



const sign_in = () => {

  return (
    <main className="auth">
      <section className="size-full glassmorphism flex-center px-6">
        <div className="sign-in-card">
          <header className="header">
            <Link to="/">
              <img
                src="/assets/icons/logo.svg"
                alt="logo"
                className="size-[30px] ml-[40%]"
              />
              <h1 className="p-28-bold text-dark-100">Odysea</h1>
            </Link>
          </header>

          <article>
            <h2 className="p-28-semibold text-dark-100 text-center">
              Start Your Travel Journey
            </h2>

            <p className="p-18-regular text-center text-gray-100 !leading-7">
              Sign in with Google to manage destinations,and user activity with
              ease.
            </p>



            <ButtonComponent 
              type="button"
              iconCss="e-search-icon"
              className="button-class !h-11 !w-full"
              onClick={loginWithGoogle}
            >
              <img
                src="/assets/icons/google.svg"
                className="size-5"
                alt="Google"
              />
              <span className="p-18-semibold text-white">Sign in with Google</span>
            </ButtonComponent>



          </article>
        </div>
      </section>
    </main>
  );
};

export default sign_in;
