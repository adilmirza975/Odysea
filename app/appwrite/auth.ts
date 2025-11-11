import { OAuthProvider, Query, ID } from "appwrite"
import { account,appwriteConfig,database } from "./client"
import { redirect } from "react-router"


export const loginWithGoogle = async () => {
  try{
    account.createOAuth2Session(OAuthProvider.Google)
  }catch(e){
    console.log({message:loginWithGoogle,e})
  }
}
export const getUser = async () => {
  try{
    const user = await account.get()
    if(!user){
      return redirect('/sign-in')
    }

    // now extract some document from database for me 
    const {documents} = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.equal('accountId',user.$id),
        Query.select(['name','email','imageUrl','joinedAt','accountId'])
      ]
    )

  }catch(e){
    console.log(e)
  }
}
export const logoutUser = async () => {
  try{
    await account.deleteSession('current')
    return true
  }catch(e){
    console.log('logoutUser error:',e)
    return false
  }
}
export const getGooglePicture = async () => {
  try{
    // get the current user session
    const session = await account.getSession('current')

    // get the OAuth2 token from the session
    const oAuthToken = session.providerAccessToken

    if(!oAuthToken){
      console.log({message:'No oAuth token available'})
      return null
    }
    
    // make a request to the google people API to get the profile photo
    const response = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=photos',{
        headers:{
          Authorization:`Bearer ${oAuthToken}`
        }
      }
    )

    if(!response.ok){
      console.log('Failed to fetch profile photo from google people API')
      return null
    }

    const data = await response.json()

    // extract the profile photo url from the response
    const photoUrl = data.photos && data.photos.length > 0
    ? data.photos[0].url
    :null

    return photoUrl

  }catch(e){
    console.log({message:'getGooglePicture error:',e})
    return null
  }
}
export const storeUserData = async () => {
  try{
    const user = await account.get()
    if(!user){
      return null
    }
    // check if the user already exist in the database
    const {documents} = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId',user.$id)] 
    )
    if(documents.length > 0){
      return documents[0]
    }

    // get profile photo from google
    const imageUrl = await getGooglePicture()

    // create new user document
    const newUser = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),{
        accountId: user.$id,
        email:user.email,
        name:user.name,
        imageUrl: imageUrl || '',
        joinedAt: new Date().toISOString(),
      }
    )
  }catch(e){
    console.log(e)
  }
}
export const getExistingUser = async (id:string) => {
  try{
    const{ documents,total } = await database.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [
        Query.equal('accountId',id),
        Query.select(['name','email','imageUrl','joinedAt','accountId']),
      ]
    )
    return total > 0 ? documents[0]:null

  }catch(error){
    console.error('Error Fetching User:',error)
    return null
  }
} 
