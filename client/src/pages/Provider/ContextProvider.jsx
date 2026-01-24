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
  const logOut = async () => {
    try {
      setLoading(true);
      // Sign out from Firebase
      await signOut(auth);
      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("Access-Token");
      setUser(null);
      setLoading(false);
    } catch (error) {
      console.error("Logout error:", error);
      setLoading(false);
    }
  };

  // Get Current User from Backend
  const getCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return null;
      }

      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = await response.json();

      if (!response.ok) {
        // Token invalid, clear it
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
        return null;
      }

      const { data } = result;
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      setLoading(false);
      return data;
    } catch (error) {
      console.error("Get current user error:", error);
      setUser(null);
      setLoading(false);
      return null;
    }
  };

  //   Update Profile
  const updateUserProfile = (name, photo) => {
    return updateProfile(auth.currentUser, {
      displayName: name,
      photoURL: photo,
    });
  };

  // State Management - Get current user from backend on mount
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        // If token exists, get user from backend
        await getCurrentUser();
      } else {
        setLoading(false);
      }
    };

    fetchUser();

    // Also listen to Firebase auth state changes (for Google login)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        // If Firebase user exists but no backend token, try to get user from backend
        const token = localStorage.getItem("token");
        if (token) {
          await getCurrentUser();
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const authInfo = {
    user,
    createUser,
    logIn,
    logOut,
    loading,
    googleSignIn,
    updateUserProfile,
    getCurrentUser,
    setLoading,
  };
  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default ContextProvider;