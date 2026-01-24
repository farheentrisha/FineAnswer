import {
    GoogleAuthProvider,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from "firebase/auth";


import { createContext, useEffect, useState } from "react";

import auth from "../../Firebase/firebase.config";

export const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();

const ContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Creating The Function Of The USER
  const createUser = (email, password) => {
    setLoading(true);
    return createUserWithEmailAndPassword(auth, email, password);
  };

  // Login Function
  const logIn = (email, password) => {
    setLoading(true);
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Google SignIn
  const googleSignIn = () => {
    setLoading(true);
    return signInWithPopup(auth, googleProvider);
  };


  // Logout Function
  const logOut = () => {
    setLoading(true);
    return signOut(auth);
  };

  //   Update Profile
  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };

  // State Management
  useEffect(() => {
    onAuthStateChanged(auth, (currentUser) => {
      console.log("Current User==>", currentUser);
      if (currentUser) {
        // get Access token
        // TODO: Uncomment when useAxiosPublic hook is created
        // const userData = {
        //   email: currentUser.email,
        // };
        // axiosPublic.post("/jwt", userData).then((res) => {
        //   if (res.data.token) {
        //     localStorage.setItem("Access-Token", res.data.token);
        //     setUser(currentUser);
        //     setLoading(false);
        //   }
        // });
        setUser(currentUser);
        setLoading(false);
      } else {
        localStorage.removeItem("Access-Token");
        setUser(null);
        setLoading(false);
      }
    });
  }, []);

  const authInfo = {
    user,
    createUser,
    logIn,
    logOut,
    loading,
    googleSignIn,
    updateUserProfile,
    setLoading,
  };
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default ContextProvider;