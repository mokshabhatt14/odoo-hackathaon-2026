import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./SignUp";
import SignIn from "./SignIn";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/employee-dashboard" element={<h1 className="text-center mt-16 text-2xl">Employee Dashboard (coming soon)</h1>} />
        <Route path="/admin-dashboard" element={<h1 className="text-center mt-16 text-2xl">Admin Dashboard (coming soon)</h1>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

