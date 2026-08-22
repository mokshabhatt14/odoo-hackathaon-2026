import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route
          path="/employee-dashboard"
          element={
            <ProtectedRoute allowedRole="employee">
              <h1 className="text-center mt-16 text-2xl">Employee Dashboard (coming soon)</h1>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <h1 className="text-center mt-16 text-2xl">Admin Dashboard (coming soon)</h1>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

