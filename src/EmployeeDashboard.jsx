import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [active, setActive] = useState("Dashboard");
  const [checkedIn, setCheckedIn] = useState(false);
  const [leaveType, setLeaveType] = useState("Paid");
  const [leaveReason, setLeaveReason] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!auth.currentUser) {
      navigate("/");
      return;
    }

    setUser(auth.currentUser);
  }, [navigate]);

  const checkIn = async () => {
    try {
      await addDoc(collection(db, "attendance"), {
        employeeId: auth.currentUser.uid,
        email: auth.currentUser.email,
        date: new Date().toISOString().split("T")[0],
        checkIn: new Date().toLocaleTimeString(),
        status: "Present",
      });

      setCheckedIn(true);
      setMessage("Checked in successfully!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const applyLeave = async (e) => {
    e.preventDefault();

    if (!leaveReason.trim()) {
      setMessage("Please enter a reason.");
      return;
    }

    try {
      await addDoc(collection(db, "leaves"), {
        employeeId: auth.currentUser.uid,
        email: auth.currentUser.email,
        type: leaveType,
        reason: leaveReason,
        status: "Pending",
        createdAt: new Date(),
      });

      setLeaveReason("");
      setMessage("Leave request submitted!");
    } catch (error) {
      setMessage(error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h1 className="text-2xl font-bold mb-2">DayFlow</h1>
        <p className="text-slate-400 text-sm mb-10">
          Employee Management
        </p>

        {["Dashboard", "Attendance", "Leave", "Payroll", "Profile"].map(
          (item) => (
            <button
              key={item}
              onClick={() => setActive(item)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 ${
                active === item
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }`}
            >
              {item}
            </button>
          )
        )}

        <button
          onClick={logout}
          className="w-full text-left px-4 py-3 mt-10 text-red-300 hover:bg-red-950 rounded-lg"
        >
          Logout
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-slate-500">Welcome back</p>
            <h2 className="text-3xl font-bold text-slate-900">
              {user?.email}
            </h2>
          </div>

          <div className="bg-white px-5 py-3 rounded-xl shadow-sm">
            <span className="text-green-600 font-semibold">
              ● Employee
            </span>
          </div>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 p-4 rounded-xl mb-6">
            {message}
          </div>
        )}

        {/* DASHBOARD */}
        {active === "Dashboard" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
              <Card title="Attendance" value="Present" />
              <Card title="Leave Balance" value="12 Days" />
              <Card title="Pending Requests" value="1" />
              <Card title="Payroll" value="₹45,000" />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">
                  Today's Attendance
                </h3>

                <p className="text-slate-500 mb-5">
                  Mark your attendance for today.
                </p>

                <button
                  onClick={checkIn}
                  disabled={checkedIn}
                  className={`px-6 py-3 rounded-lg text-white ${
                    checkedIn
                      ? "bg-green-600"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {checkedIn ? "✓ Checked In" : "Check In"}
                </button>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">
                  Quick Actions
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setActive("Leave")}
                    className="p-4 bg-blue-50 rounded-xl text-blue-700"
                  >
                    Apply Leave
                  </button>

                  <button
                    onClick={() => setActive("Attendance")}
                    className="p-4 bg-green-50 rounded-xl text-green-700"
                  >
                    View Attendance
                  </button>

                  <button
                    onClick={() => setActive("Payroll")}
                    className="p-4 bg-purple-50 rounded-xl text-purple-700"
                  >
                    View Payroll
                  </button>

                  <button
                    onClick={() => setActive("Profile")}
                    className="p-4 bg-orange-50 rounded-xl text-orange-700"
                  >
                    My Profile
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ATTENDANCE */}
        {active === "Attendance" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">My Attendance</h2>

            <div className="border rounded-xl p-5 flex justify-between items-center">
              <div>
                <p className="font-semibold">
                  {new Date().toDateString()}
                </p>
                <p className="text-slate-500">
                  Today's attendance
                </p>
              </div>

              <button
                onClick={checkIn}
                disabled={checkedIn}
                className="bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                {checkedIn ? "Present" : "Check In"}
              </button>
            </div>
          </section>
        )}

        {/* LEAVE */}
        {active === "Leave" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Apply for Leave
            </h2>

            <form onSubmit={applyLeave} className="space-y-5">
              <div>
                <label className="block mb-2 font-medium">
                  Leave Type
                </label>

                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value)}
                  className="w-full border p-3 rounded-lg"
                >
                  <option>Paid</option>
                  <option>Sick</option>
                  <option>Unpaid</option>
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  Reason
                </label>

                <textarea
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                  className="w-full border p-3 rounded-lg"
                  rows="4"
                  placeholder="Enter reason for leave..."
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg"
              >
                Submit Leave Request
              </button>
            </form>
          </section>
        )}

        {/* PAYROLL */}
        {active === "Payroll" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">
              Payroll
            </h2>

            <div className="grid md:grid-cols-3 gap-5">
              <Card title="Basic Salary" value="₹30,000" />
              <Card title="Allowances" value="₹10,000" />
              <Card title="Net Salary" value="₹45,000" />
            </div>

            <div className="mt-8 border rounded-xl p-5">
              <h3 className="font-bold mb-2">September 2026</h3>
              <p className="text-slate-500">
                Salary status: Processed
              </p>
            </div>
          </section>
        )}

        {/* PROFILE */}
        {active === "Profile" && (
          <section className="bg-white rounded-2xl p-6 shadow-sm max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              My Profile
            </h2>

            <div className="space-y-4">
              <Info label="Email" value={user?.email} />
              <Info label="Role" value="Employee" />
              <Info label="Employee ID" value={user?.uid?.slice(0, 8)} />
              <Info label="Status" value="Active" />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm">
      <p className="text-slate-500">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="border-b pb-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}