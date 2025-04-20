import { useSelector,useDispatch } from "react-redux";
import { useRef, useState,useEffect } from "react";
import { updateUserStart,updateUserSuccess,updateUserFailure, deleteUserFailure, deleteUserStart, deleteUserSuccess, signOutUserStart, signOutUserFailure, signOutUserSuccess } from "../redux/user/userSlice";
import {Link} from "react-router-dom";



export default function Profile() {
  
  const { currentUser ,loading,error} = useSelector((state) => state.user);
  const fileRef= useRef(null);
  const [formData, setFormData] = useState({});
  const dispatch= useDispatch();
  const [showListingsError,setShowListingsError]= useState(false);
  const [userListings,setUserListings]=useState([]);

  const [updateSuccess,setUpdateSuccess]= useState(false);
  const [file,setFile]= useState(undefined);
  const [filePerc,setFilePerc]= useState(0);
  console.log(filePerc);
  console.log(file);

  const handleChange=(e)=>{
    setFormData({ ...formData, [e.target.id] : e.target.value });

  }
  const handleSubmit=async(e)=>{
    e.preventDefault();
    try {
      dispatch(updateUserStart())
      const res = await fetch(`/api/user/update/${currentUser._id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if(data.success === false)
        {
          dispatch(updateUserFailure(data.message));
          return;

        }
        dispatch(updateUserSuccess(data));
        setUpdateSuccess(true);

    }catch(error)
    {
      dispatch(updateUserFailure(error.message));
    }
  }

  const handleDeleteUser= async()=>{
    try{
      dispatch(deleteUserStart())
      const res= await fetch(`/api/user/delete/${currentUser._id}`,{
          method:'DELETE',
          credentials: 'include',
        }
      );
      const data=await res.json();
      if(data.success===false)
      {
        dispatch(deleteUserFailure(data.message));
        return
      }
      dispatch(deleteUserSuccess(data));

    }catch(error)
    {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut= async ()=>{
    try{
      dispatch(signOutUserStart());
      const res = await fetch(`http://localhost:3000/api/auth/signout`, {
        method: "GET",
        credentials: "include", // Ensure cookies are included
      });
      const data= await res.json();
      if(data.success==false)
      {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
      
    }catch(error)
    {
      dispatch(signOutUserFailure(error.message));

    }
  }

  const handleShowListings= async()=>{
    try{
      setShowListingsError(false);
      const res = await fetch (`/api/user/listings/${currentUser._id}`);
      const data= await res.json();

      if(data.success===false)
      {
        setShowListingsError(true);
        return;
      }
      setUserListings(data);

    }catch(error)
    {
      setShowListingsError(true);

    }
  }
  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`http://localhost:3000/api/listing/delete/${listingId}`, {
        method: 'DELETE',
        credentials: 'include', // This ensures cookies are sent with the request
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));
    } catch (error) {
      console.log(error.message);
    }
  };
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input onChange={(e)=>setFile(e.target.files[0])} type="file" ref={fileRef} hidden accept="image/*"/>
        <img onClick={()=>fileRef.current.click()}
          className="rounded-full h-24 w-24 object-cover hover:cursor-pointer self-center mt-2"
          src={currentUser.avatar}
          alt="profile"
        />

        <input
          type="text"
          placeholder="Username"
          defaultValue={currentUser.username}
          id="username"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="text"
          placeholder="Email"
          defaultValue={currentUser.email}
          id="email"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />
        <input
          type="password"
          placeholder="Password"
          id="password"
          className="border p-3 rounded-lg"
          onChange={handleChange}
        />

        <button disabled={loading} className="bg-slate-700 text-white rounded-lg p-3 uppercase hover:opacity-95 disabled:opacity-80">
          {loading?'WORKING ON IT... ': 'UPDATE'}
        </button>
        <Link className="bg-green-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95" to={'/create-listing'}>Create Listing</Link>
      </form>
      <div className="flex justify-between mt-5">
        <span onClick={handleDeleteUser} className="text-red-700 cursor-pointer">Delete Account</span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">Sign out</span>
      </div>
      <p className="text-red-700 mt-5" >{error?error :' '}</p>
      <p className="text-green-700 mt-5" >{updateSuccess?'User is Updated Successfully' :' '}</p>

      
      {userListings && userListings.length>0 && 
      <div className="flex flex-col gap-4">
        <h1 className="text-center mt-7 text-2xl font-semibold" >Your Listings</h1>
        {userListings.map((listing)=>
          <div key={listing._id} className="border rounded-lg p-3 flex justify-between items-center gap-4">
            <Link to={`/listing/${listing._id}`} >
            <img src={listing.imageUrls[0]} alt="listing cover" className="h-16 w-16 object-contain "  />
            </Link>
            <Link className="text-slate-700 font-semibold hover:underline truncate flex-1"to={`/listing/${listing._id}`} >
            <p >{listing.name}</p>
            </Link>
            <div className="flex flex-col items-center">
              <button onClick={()=>handleListingDelete(listing._id)} className="text-red-700 uppercase">Delete</button>
              <Link to={`/update-listing/${listing._id}`} >
              <button className="text-green-700 uppercase">Edit</button>
              </Link>
            </div>
            
          </div>
        )}
      </div>
      }
    </div>
  );
}
