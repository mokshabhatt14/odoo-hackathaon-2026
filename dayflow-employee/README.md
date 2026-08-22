# Dayflow — Employee Experience Module

Frontend + Firebase integration for the employee-facing side of Dayflow
(Dashboard, Profile, Attendance). Built with React + Vite, Tailwind CSS,
Firebase v9 (Auth + Firestore), ready for Vercel.

## 1. Setup

```bash
npm install
cp .env.example .env.local   # then fill in your Firebase project values
npm run dev
```

Get the Firebase values from **Firebase Console → Project settings →
General → Your apps → SDK setup and configuration**.

## 2. Firestore schema (matches the spec)

```
users/{uid}
  email: string
  role: "Employee" | "Admin"
  personalDetails: { name, phone, address, profilePictureUrl }
  jobDetails: { employeeId, designation, department }

attendance/{id}
  userId: string
  date: "YYYY-MM-DD"
  checkIn: timestamp
  checkOut: timestamp | null
  status: "Present" | "Absent" | "Half-day" | "Leave"

leaveRequests/{id}
  userId: string
  type: "Paid" | "Sick" | "Unpaid"
  startDate: "YYYY-MM-DD"
  endDate: "YYYY-MM-DD"
  remarks: string
  status: "Pending" | "Approved" | "Rejected"
  createdAt: timestamp
```

## 3. Required Firestore indexes

The attendance and leave queries combine `where` + `orderBy` on different
fields, so Firestore will need composite indexes:

- `attendance`: `userId ASC, date DESC`
- `leaveRequests`: `userId ASC, createdAt DESC`

On first run, the Firebase console error message includes a direct link
to auto-create the missing index — click it once and the query works.

## 4. Suggested Firestore security rules

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function isOwner(uid) { return request.auth.uid == uid; }
    function isAdmin() {
      return isSignedIn() &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "Admin";
    }

    match /users/{uid} {
      allow read: if isOwner(uid) || isAdmin();
      allow create: if isOwner(uid);
      // Employees may only touch personalDetails.{phone,address,profilePictureUrl}
      allow update: if isAdmin() || (
        isOwner(uid) &&
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['personalDetails'])
      );
    }

    match /attendance/{id} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin());
    }

    match /leaveRequests/{id} {
      allow read: if isSignedIn() && (resource.data.userId == request.auth.uid || isAdmin());
      allow create: if isSignedIn() && request.resource.data.userId == request.auth.uid;
      allow update: if isAdmin(); // only HR/Admin can approve/reject
    }
  }
}
```

The client-side queries already filter with `where("userId", "==", uid)`
per the spec — these rules are the enforcement backstop.

## 5. What's included

- **`/dashboard`** — quick-access cards, monthly attendance % + leave
  balance widget, and the "punch clock" check-in/check-out toggle.
- **`/profile`** — read view (personal / job / salary / documents) and an
  edit modal restricted to `phone`, `address`, `profilePictureUrl`. The
  avatar field simulates an upload by converting a local image to a
  base64 data URL — swap in Firebase Storage's `uploadBytes` for a real
  file host in production.
- **`/attendance`** — weekly grid view and a detailed daily log table,
  both scoped strictly to `userId == auth.currentUser.uid`.
- Route protection via `ProtectedRoute`, redirecting unauthenticated
  users to `/login`.

## 6. Deploying to Vercel

1. Push this project to a Git repo and import it in Vercel.
2. Add the six `VITE_FIREBASE_*` variables from `.env.example` under
   **Project Settings → Environment Variables**.
3. Build command `npm run build`, output directory `dist` (Vite
   defaults — Vercel detects these automatically).
4. In the Firebase console, add your Vercel domain (and
   `localhost` for local dev) under **Authentication → Settings →
   Authorized domains**.

## 7. Not included in this module

The Admin/HR dashboard (employee list, attendance/leave approval,
payroll control) and the sign-up email-verification gate on login are
out of scope for this Employee Experience Module — see the spec's
section 3.2.2 / 3.6.2 for that follow-up build.
