import { useEffect, useState } from "react";
import { signOut } from "firebase/auth";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "./firebase";
import Attendance from "./Attendance";

function AdminDashboard() {
  const navigate = useNavigate();

  const [active, setActive] = useState("Dashboard");
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // GET USERS
      const usersSnapshot = await getDocs(
        collection(db, "users")
      );

      const employeeData = usersSnapshot.docs
        .map((item) => ({
          id: item.id,
          ...item.data(),
        }))
        .filter((user) => user.role === "employee");

      setEmployees(employeeData);

      // GET ATTENDANCE
      const attendanceSnapshot = await getDocs(
        collection(db, "attendance")
      );

      const attendanceData = attendanceSnapshot.docs.map(
        (item) => ({
          id: item.id,
          ...item.data(),
        })
      );

      setAttendance(attendanceData);

      // GET LEAVES
      const leavesSnapshot = await getDocs(
        collection(db, "leaves")
      );

      const leaveData = leavesSnapshot.docs.map((item) => ({
        id: item.id,
        ...item.data(),
      }));

      setLeaves(leaveData);

    } catch (error) {
      console.error("Error loading HR data:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const updateLeave = async (leaveId, status) => {
    try {
      await updateDoc(doc(db, "leaves", leaveId), {
        status: status,
      });

      await loadData();

    } catch (error) {
      console.error("Leave update error:", error);
    }
  };

  const pendingLeaves = leaves.filter(
    (leave) => leave.status === "Pending"
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ================= SIDEBAR ================= */}

      <aside className="w-64 bg-slate-900 text-white p-6">

        <h1 className="text-2xl font-bold">
          DayFlow
        </h1>

        <p className="text-slate-400 text-sm mt-1 mb-10">
          HR Management
        </p>

        {[
          "Dashboard",
          "Employees",
          "Attendance",
          "Leave Requests",
        ].map((item) => (

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

        ))}

        <button
          onClick={logout}
          className="w-full text-left px-4 py-3 mt-10 text-red-300 hover:bg-red-950 rounded-lg"
        >
          Logout
        </button>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="flex-1 p-8 overflow-auto">

        {/* HEADER */}

        <div className="flex justify-between items-center mb-8">

          <div>
            <p className="text-slate-500">
              HR Administration
            </p>

            <h2 className="text-3xl font-bold text-slate-900">
              {active}
            </h2>
          </div>

          <div className="bg-white px-5 py-3 rounded-xl shadow-sm">
            <span className="text-blue-600 font-semibold">
              ● Admin / HR
            </span>
          </div>

        </div>


        {/* LOADING */}

        {loading ? (

          <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
            <p className="text-slate-500">
              Loading HR data...
            </p>
          </div>

        ) : (

          <>

            {/* ================================================= */}
            {/* DASHBOARD */}
            {/* ================================================= */}

            {active === "Dashboard" && (

              <>

                {/* STAT CARDS */}

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

                  <StatCard
                    title="Total Employees"
                    value={employees.length}
                  />

                  <StatCard
                    title="Present Today"
                    value={attendance.length}
                  />

                  <StatCard
                    title="Pending Leaves"
                    value={pendingLeaves.length}
                  />

                  <StatCard
                    title="Total Leave Requests"
                    value={leaves.length}
                  />

                </div>


                {/* EMPLOYEES + LEAVES */}

                <div className="grid md:grid-cols-2 gap-6">

                  {/* EMPLOYEES */}

                  <div className="bg-white rounded-2xl p-6 shadow-sm">

                    <h3 className="text-xl font-bold mb-5">
                      Employees
                    </h3>

                    {employees.length === 0 ? (

                      <p className="text-slate-500">
                        No employees registered.
                      </p>

                    ) : (

                      employees.slice(0, 5).map((employee) => (

                        <div
                          key={employee.id}
                          className="flex justify-between items-center border-b py-4"
                        >

                          <div>

                            <p className="font-semibold">
                              {employee.name}
                            </p>

                            <p className="text-sm text-slate-500">
                              {employee.email}
                            </p>

                          </div>

                          <span className="text-green-600 text-sm">
                            Active
                          </span>

                        </div>

                      ))

                    )}

                  </div>


                  {/* LEAVE REQUESTS */}

                  <div className="bg-white rounded-2xl p-6 shadow-sm">

                    <h3 className="text-xl font-bold mb-5">
                      Pending Leave Requests
                    </h3>

                    {pendingLeaves.length === 0 ? (

                      <p className="text-slate-500">
                        No pending requests.
                      </p>

                    ) : (

                      pendingLeaves.slice(0, 5).map((leave) => (

                        <div
                          key={leave.id}
                          className="border-b py-4"
                        >

                          <p className="font-semibold">
                            {leave.email}
                          </p>

                          <p className="text-sm text-slate-500 mt-1">
                            {leave.type || "Leave"}
                          </p>

                          <p className="text-sm mt-1">
                            {leave.reason}
                          </p>

                          <div className="flex gap-2 mt-3">

                            <button
                              onClick={() =>
                                updateLeave(
                                  leave.id,
                                  "Approved"
                                )
                              }
                              className="bg-green-600 text-white px-3 py-1 rounded-lg"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                updateLeave(
                                  leave.id,
                                  "Rejected"
                                )
                              }
                              className="bg-red-600 text-white px-3 py-1 rounded-lg"
                            >
                              Reject
                            </button>

                          </div>

                        </div>

                      ))

                    )}

                  </div>

                </div>

              </>

            )}


            {/* ================================================= */}
            {/* EMPLOYEES */}
            {/* ================================================= */}

            {active === "Employees" && (

              <div className="bg-white rounded-2xl p-6 shadow-sm">

                <div className="flex justify-between items-center mb-6">

                  <div>

                    <h3 className="text-2xl font-bold">
                      Employee Directory
                    </h3>

                    <p className="text-slate-500 mt-1">
                      All registered employees
                    </p>

                  </div>

                  <span className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold">
                    {employees.length} Employees
                  </span>

                </div>


                {employees.length === 0 ? (

                  <p className="text-slate-500">
                    No employees found.
                  </p>

                ) : (

                  <div className="overflow-x-auto">

                    <table className="w-full text-left">

                      <thead>

                        <tr className="border-b bg-slate-50">

                          <th className="p-4">
                            Name
                          </th>

                          <th className="p-4">
                            Email
                          </th>

                          <th className="p-4">
                            Phone
                          </th>

                          <th className="p-4">
                            Status
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {employees.map((employee) => (

                          <tr
                            key={employee.id}
                            className="border-b hover:bg-slate-50"
                          >

                            <td className="p-4 font-semibold">
                              {employee.name}
                            </td>

                            <td className="p-4">
                              {employee.email}
                            </td>

                            <td className="p-4">
                              {employee.phone || "Not provided"}
                            </td>

                            <td className="p-4">

                              <span className="text-green-600 font-semibold">
                                ● Active
                              </span>

                            </td>

                          </tr>

                        ))}

                      </tbody>

                    </table>

                  </div>

                )}

              </div>

            )}


            {/* ================================================= */}
            {/* ATTENDANCE */}
            {/* ================================================= */}

            {active === "Attendance" && (

              <Attendance />

            )}


            {/* ================================================= */}
            {/* LEAVE REQUESTS */}
            {/* ================================================= */}

            {active === "Leave Requests" && (

              <div className="bg-white rounded-2xl p-6 shadow-sm">

                <div className="flex justify-between items-center mb-6">

                  <div>

                    <h3 className="text-2xl font-bold">
                      Leave Requests
                    </h3>

                    <p className="text-slate-500 mt-1">
                      Manage employee leave requests
                    </p>

                  </div>

                  <span className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold">
                    {pendingLeaves.length} Pending
                  </span>

                </div>


                {leaves.length === 0 ? (

                  <div className="text-center py-10">

                    <p className="text-slate-500">
                      No leave requests found.
                    </p>

                  </div>

                ) : (

                  <div className="space-y-4">

                    {leaves.map((leave) => (

                      <div
                        key={leave.id}
                        className="border rounded-xl p-5"
                      >

                        <div className="flex justify-between">

                          <div>

                            <p className="font-bold">
                              {leave.email}
                            </p>

                            <p className="text-slate-500 mt-1">
                              {leave.type || "Leave"} Leave
                            </p>

                            <p className="mt-2">
                              <span className="font-medium">
                                Reason:
                              </span>{" "}
                              {leave.reason || "No reason provided"}
                            </p>

                          </div>


                          <span
                            className={`font-semibold ${
                              leave.status === "Approved"
                                ? "text-green-600"
                                : leave.status === "Rejected"
                                ? "text-red-600"
                                : "text-orange-500"
                            }`}
                          >
                            {leave.status || "Pending"}
                          </span>

                        </div>


                        {(!leave.status ||
                          leave.status === "Pending") && (

                          <div className="flex gap-3 mt-5">

                            <button
                              onClick={() =>
                                updateLeave(
                                  leave.id,
                                  "Approved"
                                )
                              }
                              className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                            >
                              Approve
                            </button>

                            <button
                              onClick={() =>
                                updateLeave(
                                  leave.id,
                                  "Rejected"
                                )
                              }
                              className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
                            >
                              Reject
                            </button>

                          </div>

                        )}

                      </div>

                    ))}

                  </div>

                )}

              </div>

            )}

          </>

        )}

      </main>

    </div>
  );
}


/* ================= STAT CARD ================= */

function StatCard({ title, value }) {

  return (

    <div className="bg-white rounded-2xl p-6 shadow-sm">

      <p className="text-slate-500">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

    </div>

  );
}


export default AdminDashboard;