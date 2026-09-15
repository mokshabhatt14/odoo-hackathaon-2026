import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const userDoc = await getDoc(
        doc(db, "users", userCred.user.uid)
      );

      const role = userDoc.exists()
        ? userDoc.data().role
        : "employee";

      navigate(
        role === "admin"
          ? "/admin-dashboard"
          : "/employee-dashboard"
      );
    } catch (err) {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md p-8 border border-gray-300 rounded-xl shadow-sm">

        <h1 className="text-3xl font-bold mb-2 text-gray-900">
          Sign In
        </h1>

        <p className="text-gray-500 mb-6">
          Welcome back to DayFlow
        </p>

        <form
          onSubmit={handleSignIn}
          className="flex flex-col gap-4"
        >

          <input
            className="border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            className="border border-gray-300 p-3 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition"
          >
            Sign In
          </button>

        </form>

        {/* SIGN UP LINK */}
        <div className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={() => navigate("/signup")}
            className="text-blue-600 font-semibold hover:underline"
          >
            Sign Up
          </button>
        </div>

      </div>
    </div>
  );
}

export default SignIn;