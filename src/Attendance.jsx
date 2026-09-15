import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";

function Attendance() {
  const [attendance, setAttendance] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);

      // Get employees
      const usersSnapshot = await getDocs(
        collection(db, "users")
      );

      const employeeData = usersSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((user) => user.role === "employee");

      setEmployees(employeeData);

      // Get attendance
      const attendanceSnapshot = await getDocs(
        collection(db, "attendance")
      );

      const attendanceData = attendanceSnapshot.docs.map(
        (doc) => ({
          id: doc.id,
          ...doc.data(),
        })
      );

      console.log("Attendance records:", attendanceData);

      setAttendance(attendanceData);

    } catch (error) {
      console.error("Attendance error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getEmployeeName = (email) => {
    const employee = employees.find(
      (emp) => emp.email === email
    );

    return employee?.name || "Employee";
  };

  const formatValue = (value) => {
    if (!value) return "-";

    // Firebase Timestamp
    if (value && typeof value.toDate === "function") {
      return value.toDate().toLocaleString();
    }

    // Firestore timestamp object
    if (value && typeof value === "object" && value.seconds) {
      return new Date(
        value.seconds * 1000
      ).toLocaleString();
    }

    // JavaScript Date
    if (value instanceof Date) {
      return value.toLocaleString();
    }

    // String / number
    return String(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center">
        <p className="text-slate-500">
          Loading attendance...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-2xl font-bold">
            Attendance Overview
          </h2>

          <p className="text-slate-500 mt-1">
            Monitor employee attendance
          </p>
        </div>

        <button
          onClick={loadAttendance}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
        >
          🔄 Refresh
        </button>

      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-4 mb-6">

        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-slate-500 text-sm">
            Total Records
          </p>

          <p className="text-2xl font-bold mt-1">
            {attendance.length}
          </p>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-slate-500 text-sm">
            Present
          </p>

          <p className="text-2xl font-bold mt-1 text-green-600">
            {attendance.length}
          </p>
        </div>

        <div className="bg-purple-50 rounded-xl p-4">
          <p className="text-slate-500 text-sm">
            Employees
          </p>

          <p className="text-2xl font-bold mt-1">
            {employees.length}
          </p>
        </div>

      </div>

      {/* TABLE */}
      {attendance.length === 0 ? (

        <div className="text-center py-12">
          <div className="text-4xl mb-3">
            📋
          </div>

          <h3 className="font-semibold text-lg">
            No attendance records
          </h3>

          <p className="text-slate-500 mt-1">
            Employee check-ins will appear here.
          </p>
        </div>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>

              <tr className="border-b bg-slate-50">

                <th className="p-4">
                  Employee
                </th>

                <th className="p-4">
                  Email
                </th>

                <th className="p-4">
                  Date
                </th>

                <th className="p-4">
                  Check In
                </th>

                <th className="p-4">
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {attendance.map((record) => (

                <tr
                  key={record.id}
                  className="border-b hover:bg-slate-50"
                >

                  <td className="p-4 font-semibold">
                    {getEmployeeName(record.email)}
                  </td>

                  <td className="p-4 text-slate-600">
                    {record.email || "-"}
                  </td>

                  <td className="p-4">
                    {formatValue(record.date)}
                  </td>

                  <td className="p-4">
                    {formatValue(record.checkIn)}
                  </td>

                  <td className="p-4">

                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-semibold">
                      ✓ Present
                    </span>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      )}

    </div>
  );
}

export default Attendance;