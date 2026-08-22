// src/context/AuthContext.jsx
// Global authentication state. Wraps the app, exposes the current
// Firebase Auth user plus the matching Firestore `users/{uid}` profile
// (which carries role, personalDetails, jobDetails).

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null); // Firestore `users/{uid}` doc
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (uid) => {
    const snap = await getDoc(doc(db, "users", uid));
    return snap.exists() ? { uid, ...snap.data() } : null;
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      setFirebaseUser(user);
      if (user) {
        try {
          const profile = await fetchProfile(user.uid);
          setUserProfile(profile);
        } catch (err) {
          console.error("Failed to load user profile:", err);
          setError(err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [fetchProfile]);

  const signIn = useCallback(async (email, password) => {
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      return cred.user;
    } catch (err) {
      setError(mapAuthError(err));
      throw err;
    }
  }, []);

  const signUp = useCallback(async ({ email, password, employeeId, name, role }) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(cred.user);

      const profile = {
        uid: cred.user.uid,
        email,
        role: role === "HR" ? "Admin" : "Employee",
        personalDetails: {
          name,
          phone: "",
          address: "",
          profilePictureUrl: "",
        },
        jobDetails: {
          employeeId,
          designation: "",
          department: "",
        },
        createdAt: serverTimestamp(),
      };

      await setDoc(doc(db, "users", cred.user.uid), profile);
      setUserProfile(profile);
      return cred.user;
    } catch (err) {
      setError(mapAuthError(err));
      throw err;
    }
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    setUserProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!firebaseUser) return;
    const profile = await fetchProfile(firebaseUser.uid);
    setUserProfile(profile);
  }, [firebaseUser, fetchProfile]);

  const value = {
    firebaseUser,
    userProfile,
    isAdmin: userProfile?.role === "Admin",
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    setUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}

function mapAuthError(err) {
  const map = {
    "auth/invalid-email": "That email address doesn't look right.",
    "auth/user-disabled": "This account has been disabled.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect email or password.",
    "auth/invalid-credential": "Incorrect email or password.",
    "auth/email-already-in-use": "An account already exists for that email.",
    "auth/weak-password": "Password should be at least 6 characters.",
  };
  return map[err.code] || "Something went wrong. Please try again.";
}
