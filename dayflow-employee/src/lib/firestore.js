// src/lib/firestore.js
// Centralized Firestore query/mutation helpers for the Employee Experience
// module. Every read here is scoped to the current user's uid — nothing
// in this file grants cross-employee visibility.

import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";

/* ---------------------------- Profile ---------------------------- */

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return { uid, ...snap.data() };
}

// Employees may only edit address, phone, and profilePictureUrl.
export async function updateOwnProfile(uid, { phone, address, profilePictureUrl }) {
  const updates = {};
  if (phone !== undefined) updates["personalDetails.phone"] = phone;
  if (address !== undefined) updates["personalDetails.address"] = address;
  if (profilePictureUrl !== undefined)
    updates["personalDetails.profilePictureUrl"] = profilePictureUrl;

  await updateDoc(doc(db, "users", uid), updates);
}

/* --------------------------- Attendance --------------------------- */

function todayStr(d = new Date()) {
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// Fetch attendance records for a single employee, most recent first.
// Strictly scoped with where("userId", "==", uid) as required by spec.
export async function getAttendanceForUser(uid, { limitDays } = {}) {
  const q = query(
    collection(db, "attendance"),
    where("userId", "==", uid),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  const records = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  return limitDays ? records.slice(0, limitDays) : records;
}

export async function getTodayAttendance(uid) {
  const q = query(
    collection(db, "attendance"),
    where("userId", "==", uid),
    where("date", "==", todayStr())
  );
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

// Creates today's record on check-in, or updates it with checkOut later.
export async function checkIn(uid) {
  const existing = await getTodayAttendance(uid);
  if (existing) return existing; // already checked in today

  const ref = await addDoc(collection(db, "attendance"), {
    userId: uid,
    date: todayStr(),
    checkIn: Timestamp.now(),
    checkOut: null,
    status: "Present",
  });
  return { id: ref.id, userId: uid, date: todayStr(), checkIn: Timestamp.now(), checkOut: null, status: "Present" };
}

export async function checkOut(recordId) {
  await updateDoc(doc(db, "attendance", recordId), {
    checkOut: Timestamp.now(),
  });
}

// Percentage of "Present" + "Half-day" (counted as 0.5) over the days
// that have a logged record within the current calendar month.
export function computeMonthlyAttendancePct(records) {
  const now = new Date();
  const monthPrefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthRecords = records.filter((r) => r.date.startsWith(monthPrefix));
  if (monthRecords.length === 0) return 0;

  const score = monthRecords.reduce((sum, r) => {
    if (r.status === "Present") return sum + 1;
    if (r.status === "Half-day") return sum + 0.5;
    return sum;
  }, 0);

  return Math.round((score / monthRecords.length) * 100);
}

/* ------------------------- Leave requests ------------------------- */

export async function getLeaveRequestsForUser(uid) {
  const q = query(
    collection(db, "leaveRequests"),
    where("userId", "==", uid),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function applyForLeave(uid, { type, startDate, endDate, remarks }) {
  const ref = await addDoc(collection(db, "leaveRequests"), {
    userId: uid,
    type,
    startDate,
    endDate,
    remarks: remarks || "",
    status: "Pending",
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

function businessDaysBetween(startStr, endStr) {
  const start = new Date(startStr);
  const end = new Date(endStr);
  let count = 0;
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

// Simple allowance model: 18 paid days/year minus approved+pending paid leave taken.
export function computeLeaveRemaining(leaveRequests, annualAllowance = 18) {
  const used = leaveRequests
    .filter((l) => l.type === "Paid" && l.status !== "Rejected")
    .reduce((sum, l) => sum + businessDaysBetween(l.startDate, l.endDate), 0);
  return Math.max(annualAllowance - used, 0);
}
