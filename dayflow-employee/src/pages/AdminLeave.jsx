import { useEffect, useState } from "react";
import { collection, getDocs, query, orderBy, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function AdminLeave() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadRequests() {
    try {
      setLoading(true);

      const q = query(
        collection(db, "leaveRequests"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);

      setRequests(
        snapshot.docs.map((item) => ({
          id: item.id,
          ...item.data(),
        }))
      );
    } catch (err) {
      console.error(err);
      setError("Could not load leave requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateStatus(id, status) {
    try {
      await updateDoc(doc(db, "leaveRequests", id), {
        status,
      });

      setRequests((current) =>
        current.map((request) =>
          request.id === id
            ? { ...request, status }
            : request
        )
      );
    } catch (err) {
      console.error(err);
      setError("Could not update the leave request.");
    }
  }

  if (loading) {
    return (
      <div className="p-10 text-center">
        Loading leave requests...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Admin — Leave Approvals
        </h1>

        <p className="mt-2 text-slate-500">
          Review and approve employee leave requests.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-100 p-3 text-red-700">
            {error}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {requests.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center shadow">
              No leave requests found.
            </div>
          ) : (
            requests.map((request) => (
              <div
                key={request.id}
                className="rounded-xl bg-white p-6 shadow"
              >
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-900">
                      Employee ID: {request.userId}
                    </p>

                    <p className="mt-2 text-sm text-slate-600">
                      Type: {request.type}
                    </p>

                    <p className="text-sm text-slate-600">
                      Dates: {request.startDate} → {request.endDate}
                    </p>

                    {request.remarks && (
                      <p className="mt-2 text-sm text-slate-600">
                        Remarks: {request.remarks}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                        request.status === "Approved"
                          ? "bg-green-100 text-green-700"
                          : request.status === "Rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {request.status}
                    </span>
                  </div>
                </div>

                {request.status === "Pending" && (
                  <div className="mt-5 flex gap-3">
                    <button
                      onClick={() =>
                        updateStatus(request.id, "Approved")
                      }
                      className="rounded-lg bg-green-600 px-5 py-2 font-semibold text-white hover:bg-green-700"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() =>
                        updateStatus(request.id, "Rejected")
                      }
                      className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}