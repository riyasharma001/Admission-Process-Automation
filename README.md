# ABES Engineering College — Admission Management Portal

A complete admission management portal built with the **MERN stack** (MongoDB, Express, React and Node.js) for **ABES Engineering College, Ghaziabad**.

Applicants can create an account, fill the admission form, upload documents and track the status of their application. A dedicated **reviewer** role can verify every form with a checklist and record decisions, while the admission cell has full access to review applications, export data, manage programmes and publish notices.

> This is an educational project and is not an official website of ABES Engineering College. The programme data, fees and notice dates are sample data for demonstration.

![ABES admission portal logo](client/public/assets/logo.png)

---

## Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Demo logins](#demo-logins)
- [Available scripts](#available-scripts)
- [How the portal works](#how-the-portal-works)
- [API reference](#api-reference)
- [Database models](#database-models)
- [Document uploads](#document-uploads)
- [Replacing the logo](#replacing-the-logo)
- [Customising the portal](#customising-the-portal)
- [Production build and deployment](#production-build-and-deployment)
- [Troubleshooting](#troubleshooting)
- [Security notes and limitations](#security-notes-and-limitations)

---

## Features

### Public pages

- College-style home page with admission information, helpline details and important dates
- List of B.Tech, MBA and MCA programmes with duration, seats, first-year fee and eligibility
- Admission notice board
- Student registration and login

### Applicant (student)

- Register and log in with email and password
- Fill a five-part admission form:
  - Programme selection
  - Personal details
  - Class 10, Class 12 and entrance exam details
  - Upload of photograph, marksheets and photo ID
  - Declaration and submission
- One application per programme (enforced by the database)
- Automatic application number in the format `ABES-2026-0001`
- Dashboard listing all applications and their current status
- Detailed application view with a status timeline and print option

### Reviewer (review desk)

- Dedicated reviewer login that opens the review desk
- Live counts for newly submitted, under-review, documents-pending, approved and rejected applications
- Oldest-first list of applications that need action
- Full searchable and filterable list of all applications
- Open any form to see personal details, academic details and every uploaded document
- Four-point verification checklist: personal details, academic details, documents and eligibility
- Save review notes and mark an application as under review
- Request additional documents, approve or reject an application
- Approval is blocked until all four checks are complete
- Requesting documents or rejecting requires a note for the applicant
- CSV export access
- Reviewers cannot add or change programmes or notices

### Admission cell (admin)

- Staff login with full access
- Dashboard with total applications, pending reviews, approved and rejected counts, student accounts and active programmes
- Recent applications and programme-wise application counts
- Search by application number, applicant name or email
- Filter by status and programme
- Review full applications and uploaded documents
- Use the same verification checklist and decision panel as reviewers, with final authority over applications
- Export all applications to CSV (opens in Excel)
- Add, edit and delete programmes
- Publish, hide or delete notices

---

## Tech stack

| Layer    | Technology                                             |
| -------- | ------------------------------------------------------ |
| Frontend | React 18 (JavaScript), React Router 6, Axios, Vite      |
| Styling  | Plain CSS (`client/src/index.css`), no UI framework     |
| Backend  | Node.js, Express 4                                      |
| Database | MongoDB with Mongoose 8                                 |
| Auth     | JWT (7-day expiry), bcryptjs password hashing           |
| Uploads  | Multer, files stored in `server/uploads`                |

The frontend and backend are separate applications during development. Vite proxies `/api` and `/uploads` to the Express server, so no CORS problems occur in local development.

---

## Project structure

```text
AdmissionAutomation/
├── client/                         React frontend
│   ├── public/
│   │   └── assets/
│   │       ├── logo.png            Logo used in the header and browser tab
│   │       └── README.txt          Logo replacement notes
│   ├── src/
│   │   ├── api/axios.js            Axios instance with JWT header
│   │   ├── components/             Header, footer, layout, route guard, status badge
│   │   ├── context/AuthContext.jsx Login state and session handling
│   │   ├── pages/                  Public, student and reviewer pages
│   │   │   └── admin/              Admin dashboard, applications, programmes, notices
│   │   ├── utils/format.js         Date, currency and error helpers
│   │   ├── App.jsx                 All routes
│   │   ├── index.css               Complete stylesheet
│   │   └── main.jsx                React entry point
│   ├── index.html
│   └── vite.config.js
├── server/                         Express API
│   ├── src/
│   │   ├── config/db.js            MongoDB connection
│   │   ├── controllers/            Auth, applications, courses, notices
│   │   ├── middleware/             JWT guard, admin guard, uploads, errors
│   │   ├── models/                 User, Course, Application, Notice, Counter
│   │   ├── routes/                 API route definitions
│   │   ├── seed/seed.js            Demo data and staff account
│   │   ├── app.js                  Express app
│   │   └── server.js               API entry point
│   ├── uploads/                    Uploaded applicant documents
│   ├── .env.example                Environment variable template
│   └── package.json
├── package.json                    Root scripts (run both apps together)
└── README.md
```

---

## Getting started

### 1. Prerequisites

- **Node.js 18 or newer** (this project was tested with Node 24)
- **npm** (comes with Node.js)
- **MongoDB 6 or newer**, running locally or a free MongoDB Atlas cluster
- A modern browser (Chrome, Firefox, Edge or Safari)

### 2. Install dependencies

Open a terminal in the project root and run:

```bash
npm run install-all
```

This installs the root scripts, the Express server and the React client.

If you prefer to install each part manually:

```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 3. Create the environment file

Copy the example file and update it if your MongoDB connection differs:

```bash
cp server/.env.example server/.env
```

Default values:

| Variable     | Default                                        | Purpose                                        |
| ------------ | ---------------------------------------------- | ---------------------------------------------- |
| `PORT`       | `5000`                                         | Express API port                               |
| `MONGO_URI`  | `mongodb://127.0.0.1:27017/abes_admissions`    | MongoDB connection string                      |
| `JWT_SECRET` | `change-this-secret-before-deploying`          | Secret used to sign login tokens               |
| `CLIENT_URL` | `http://localhost:5173`                        | Frontend origin allowed by CORS                |

For MongoDB Atlas, use the connection string shown in your Atlas dashboard, for example:

```env
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/abes_admissions
```

### 4. Seed the database

Make sure MongoDB is running, then run:

```bash
npm run seed
```

The seed script:

- creates the staff account `admin@abes.ac.in` / `Admin@123`
- creates the reviewer account `reviewer@abes.ac.in` / `Reviewer@123`
- adds nine programmes (six B.Tech branches, MBA and MCA)
- adds five sample notices
- creates three sample students and three sample applications
- keeps the application counter in sync

It is safe to run more than once. Existing records are updated or skipped; it does not delete real data. The sample applications do not contain uploaded files, so use a real application submission to test document viewing.

### 5. Start the application

From the project root:

```bash
npm run dev
```

This starts both applications:

| Service          | URL                     |
| ---------------- | ----------------------- |
| React frontend   | http://localhost:5173   |
| Express API      | http://localhost:5000   |
| API health check | http://localhost:5000/api/health |

Alternatively, run them in two terminals:

```bash
# terminal 1
cd server
npm run dev

# terminal 2
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## Demo logins

The seed script creates these accounts:

| Role           | Email                  | Password        |
| -------------- | ---------------------- | --------------- |
| Admission cell | `admin@abes.ac.in`     | `Admin@123`     |
| Reviewer       | `reviewer@abes.ac.in`  | `Reviewer@123`  |
| Student        | `student@example.com`  | `Student@123`   |

Two more sample students exist (`aman@example.com` and `sneha@example.com`, password `Student@123`) to populate the admin dashboard.

The demo credentials are also shown on the login page. Remove that box before using the portal for real admissions.

---

## Available scripts

### Root

| Command               | Description                                                     |
| --------------------- | --------------------------------------------------------------- |
| `npm run install-all` | Install root, server and client dependencies                    |
| `npm run dev`         | Run Express with nodemon and Vite together                      |
| `npm run seed`        | Add or refresh demo programmes, notices and accounts            |
| `npm run build`       | Create a production build of the React app in `client/dist`     |
| `npm start`           | Start the Express API (production build serving requires `NODE_ENV=production`) |

### Server (`cd server`)

| Command       | Description                              |
| ------------- | ---------------------------------------- |
| `npm run dev` | Start API with nodemon (auto restart)    |
| `npm start`   | Start API with Node                     |
| `npm run seed`| Seed the database                       |

### Client (`cd client`)

| Command           | Description                              |
| ----------------- | ---------------------------------------- |
| `npm run dev`     | Start Vite development server            |
| `npm run build`   | Build for production into `client/dist`  |
| `npm run preview` | Preview the production build locally     |

---

## How the portal works

### Applicant flow

1. **Register** with name, email, mobile number and password.
2. Open **Apply online** and select a programme.
3. Fill personal details and academic details.
4. Upload four documents: photograph, Class 10 marksheet, Class 12 marksheet and photo ID.
5. Accept the declaration and submit.
6. The application is saved with status **Submitted** and a unique number such as `ABES-2026-0001`.
7. Check progress from **My applications**. The admission cell adds remarks and status updates.

### Reviewer flow

1. Log in with the reviewer account. Reviewers are redirected to the review desk.
2. Open the oldest waiting application from the queue, or use **All applications** to search and filter.
3. Read every section of the form and open the photograph, marksheets and ID proof.
4. Tick the four verification checks and add review notes where needed.
5. Choose **Mark under review**, **Request documents**, **Approve** or **Reject**.
6. Requesting documents or rejecting requires a note. Approval requires all four checks.
7. The student sees the new status and note in the application timeline immediately.

#### Review desk pages

| Page | Route | What the reviewer can do |
| ---- | ----- | ------------------------ |
| Review desk | `/reviewer` | See review counts, the oldest-first queue and applications needing action |
| Review queue | `/reviewer/applications` | Search, filter and open every application |
| Application review | `/applications/:id` | Inspect the form and documents, save the checklist and record a decision |

#### Review safeguards

- Reviewers log in with an account whose role is `reviewer`; public registration always creates students.
- Approval requires all four verification checks: personal details, academic details, documents and eligibility.
- `Documents Pending` and `Rejected` decisions require a note for the applicant.
- Saving the checklist without a status does not move the application; it only stores the review.
- Every recorded status change adds the reviewer's name, note, date and time to the applicant's timeline.
- Reviewers can view and export applications but cannot add, edit or delete programmes or notices.
- Administrators retain full review access and use the same checklist and decision panel.
- Review checklist data is returned only to reviewers and administrators; it is removed from student API responses.
- The legacy `PATCH /applications/:id/status` endpoint remains admin-only; the reviewer UI uses `PATCH /applications/:id/review`.

### Admission cell flow

1. Log in with the staff account. Staff are redirected to the admin dashboard.
2. Filter or search applications, then open one to see the full form and documents.
3. Use the review panel to complete the checklist and record a decision.
4. The student sees the new status and remark on the application page.
5. Use **Export CSV** for reporting or offline review.
6. Manage programmes and notices from the admin menu.

### Application statuses

| Status               | Meaning                                                        |
| -------------------- | -------------------------------------------------------------- |
| `Submitted`          | Application received and waiting for a first review             |
| `Under Review`       | The reviewer is checking details or documents                    |
| `Documents Pending`  | The applicant needs to provide or correct a document            |
| `Approved`           | Eligibility confirmed; admission can proceed                    |
| `Rejected`           | Application closed by the reviewer or admission cell            |

Every status change creates a timeline entry showing the date, time, reviewer or staff name and remark. The four-point verification checklist and review notes are stored with the application and are visible only to reviewers and administrators.

---

## API reference

Base URL: `http://localhost:5000/api`

Protected routes require this header:

```http
Authorization: Bearer <token>
```

### Authentication

| Method | Endpoint             | Access    | Description                              |
| ------ | -------------------- | --------- | ---------------------------------------- |
| POST   | `/auth/register`     | Public    | Create a student account                 |
| POST   | `/auth/login`        | Public    | Log in as a student, reviewer or staff member |
| GET    | `/auth/me`           | Logged in | Return the current user                  |

### Programmes

| Method | Endpoint        | Access | Description                                      |
| ------ | --------------- | ------ | ------------------------------------------------ |
| GET    | `/courses`      | Public | Active programmes; add `?all=true` for all       |
| GET    | `/courses/:id`  | Public | One programme                                    |
| POST   | `/courses`      | Admin  | Create a programme                               |
| PUT    | `/courses/:id`  | Admin  | Update a programme                               |
| DELETE | `/courses/:id`  | Admin  | Delete a programme with no applications          |

### Notices

| Method | Endpoint        | Access | Description                                 |
| ------ | --------------- | ------ | ------------------------------------------- |
| GET    | `/notices`      | Public | Published notices; add `?all=true` for all  |
| POST   | `/notices`      | Admin  | Publish a notice                            |
| PUT    | `/notices/:id`  | Admin  | Update content or publish/hide a notice     |
| DELETE | `/notices/:id`  | Admin  | Delete a notice                             |

### Applications

| Method | Endpoint                      | Access              | Description                                                 |
| ------ | ----------------------------- | ------------------- | ----------------------------------------------------------- |
| POST   | `/applications`               | Student             | Submit an application (`multipart/form-data`)               |
| GET    | `/applications/my`            | Student             | List the logged-in student's applications                   |
| GET    | `/applications`               | Admin or reviewer   | List all; filters: `status`, `course`, `q`                  |
| GET    | `/applications/:id`           | Owner, admin or reviewer | Full application, documents and review data           |
| PATCH  | `/applications/:id/review`    | Admin or reviewer   | Save checklist and notes; optionally change status          |
| PATCH  | `/applications/:id/status`    | Admin               | Legacy direct status update; the UI uses `/review`          |
| GET    | `/applications/stats`         | Admin or reviewer   | Dashboard and review desk statistics                        |
| GET    | `/applications/export/csv`    | Admin or reviewer   | Download all applications as CSV                            |

### Health

| Method | Endpoint   | Access | Description          |
| ------ | ---------- | ------ | -------------------- |
| GET    | `/health`  | Public | API and server status |

### Submitting an application

The application endpoint expects `multipart/form-data` with these fields:

| Field        | Type                    | Notes                                      |
| ------------ | ----------------------- | ------------------------------------------ |
| `course`     | text                    | Programme ID                                |
| `personal`   | JSON string             | Personal details object                     |
| `academics`  | JSON string             | Class 10, Class 12 and entrance exam object |
| `photo`      | file                    | Passport size photograph                    |
| `marksheet10`| file                    | Class 10 marksheet                          |
| `marksheet12`| file                    | Class 12 marksheet                          |
| `idProof`    | file                    | Aadhaar, PAN or passport                    |

Example `personal` object:

```json
{
  "fullName": "Riya Sharma",
  "dob": "2006-04-12",
  "gender": "Female",
  "category": "General",
  "fatherName": "Rajesh Sharma",
  "motherName": "Sunita Sharma",
  "phone": "9876543210",
  "email": "student@example.com",
  "address": "B-42, Raj Nagar Extension",
  "city": "Ghaziabad",
  "state": "Uttar Pradesh",
  "pincode": "201017"
}
```

Example `academics` object:

```json
{
  "tenth": {
    "board": "CBSE",
    "school": "Delhi Public School, Ghaziabad",
    "passingYear": "2022",
    "percentage": 92.4
  },
  "twelfth": {
    "board": "CBSE",
    "school": "Delhi Public School, Ghaziabad",
    "stream": "PCM",
    "passingYear": "2024",
    "percentage": 88.6
  },
  "entrance": {
    "exam": "JEE Main",
    "rollNumber": "2401102345",
    "score": "92.4 percentile",
    "rank": "15420"
  }
}
```

A student cannot submit a second application for the same programme. The API returns `409` with the existing application number.

### Reviewing an application

Reviewers and administrators use `PATCH /applications/:id/review` to save the verification checklist and record a decision. Example body:

```json
{
  "checklist": {
    "personalDetails": true,
    "academicDetails": true,
    "documents": true,
    "eligibility": true
  },
  "notes": "All details and documents verified. Eligible for admission.",
  "status": "Approved"
}
```

- Omit `status` to save the checklist without changing the applicant's status.
- `Approved` requires all four checklist values to be `true`.
- `Documents Pending` and `Rejected` require a note for the applicant.
- When a status is supplied, the note becomes the applicant-facing remark and a timeline entry is created.
- The response contains the updated application, including `review.reviewedBy` and `review.reviewedAt`.

### Login example

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@abes.ac.in","password":"Admin@123"}'
```

Response:

```json
{
  "message": "Logged in successfully.",
  "token": "eyJhbGciOi...",
  "user": {
    "_id": "...",
    "name": "Admission Cell",
    "email": "admin@abes.ac.in",
    "phone": "01207135111",
    "role": "admin"
  }
}
```

---

## Database models

### User

- `name`, `email` (unique), `password` (hashed), `phone`
- `role`: `student`, `reviewer` or `admin`

Public registration always creates a `student` account. Reviewer and admin accounts are created by the seed script or directly in the database; they cannot be registered from the public sign-up form.

### Course

- `code` (unique, uppercase), `name`, `degree`, `duration`
- `seats`, `feePerYear`, `eligibility`, `description`
- `isActive` controls whether applicants can select the programme

### Notice

- `title`, `body`, `category` (`Admission`, `Examination` or `General`)
- `date`, `isActive`

### Application

- `applicationNo` (unique), `applicant`, `course`, `session`
- `personal`: name, date of birth, gender, category, parents' names, contact details and address
- `academics`: Class 10, Class 12 and entrance examination
- `documents`: uploaded file metadata and URLs
- `status`, `remarks`
- `timeline`: every status update with date, message and reviewer/staff name
- `review`: four verification checks, reviewer notes, `reviewedBy` and `reviewedAt`

A unique index on `applicant` + `course` prevents duplicate applications for the same programme.

### Counter

Internal collection used to generate sequential application numbers without duplicates.

---

## Document uploads

- Accepted formats: **JPG, JPEG, PNG and PDF**
- Maximum size: **5 MB per file**
- Maximum four files per application
- Files are stored in `server/uploads` with randomised names
- File metadata is saved in the application record
- Files are served at `/uploads/<filename>`; Vite proxies this path during development
- If validation fails after files are received, the server removes those files

For a real deployment, uploaded documents should be stored in private object storage and served through authenticated, expiring URLs. See [Security notes](#security-notes-and-limitations).

---

## Replacing the logo

The portal logo lives at:

```text
client/public/assets/logo.png
```

To use your own college logo:

1. Create a PNG image, preferably square and 320 × 320 pixels or larger.
2. Replace `client/public/assets/logo.png` with your file.
3. Keep the **same file name**: `logo.png`.
4. Refresh the browser. No code change is needed.

The logo is used in two places:

- `client/index.html` for the browser tab icon
- `client/src/components/Header.jsx` for the site header

If you must use a different file name or format, update those two references. More notes are in `client/public/assets/README.txt`.

---

## Customising the portal

### College details

Edit the name, address, phone number and email in:

- `client/src/components/Header.jsx`
- `client/src/components/Footer.jsx`
- `client/src/pages/Home.jsx`
- `client/src/pages/Login.jsx` and `client/src/pages/Register.jsx` (help text)
- `server/src/seed/seed.js` (notices and sample data)

### Academic session

The session is currently **2026–27**. It is set in:

- `server/src/controllers/applicationController.js` (`SESSION` and `SESSION_YEAR`)
- `server/src/seed/seed.js` (`SESSION`)

### Colours and typography

The design uses plain CSS variables at the top of `client/src/index.css`:

```css
--brand: #123a63;        /* main navy */
--accent: #9e1b1b;       /* dark red accents */
--bg: #f4f5f7;           /* page background */
```

Change these values to match the college's official colours.

### Programmes and fees

Use **Admin → Manage programmes** to add or edit programmes. You can also change the seed data and run `npm run seed` again.

---

## Production build and deployment

### Build the React app

```bash
npm run build
```

The output is written to `client/dist`.

### Run in production mode

The Express server serves the built React app automatically when `NODE_ENV=production` and `client/dist` exists:

```bash
NODE_ENV=production npm start
```

On Windows PowerShell:

```powershell
$env:NODE_ENV="production"; npm start
```

Then open `http://localhost:5000`. React routes such as `/admin` fall back to `index.html`, so refreshing the page works.

### Deployment checklist

1. Set a strong `JWT_SECRET`.
2. Use a MongoDB Atlas connection string or a managed MongoDB instance.
3. Set `CLIENT_URL` to the deployed frontend origin.
4. Build the client and run the server with `NODE_ENV=production`.
5. Serve the app over HTTPS through a reverse proxy such as Nginx or a platform like Render, Railway or Fly.io.
6. Persist the `server/uploads` directory, or replace local storage with cloud storage.
7. Remove the demo credentials box and demo accounts before going live.
8. Take regular database backups.
9. If the frontend is hosted separately, set `VITE_API_URL` before building and configure CORS on the API.

### Quick production test

```bash
npm run build
NODE_ENV=production npm start
# open http://localhost:5000
```

---

## Troubleshooting

### `Could not connect to MongoDB`

- Make sure MongoDB is running locally (`mongosh` should connect).
- Check `MONGO_URI` in `server/.env`.
- For Atlas, allow your IP address in **Network Access** and include the database name in the URI.
- If using Docker: `docker run -d --name abes-mongo -p 27017:27017 mongo:7`.

### `EADDRINUSE: address already in use :::5000`

Another process is using port 5000. Stop it, or change `PORT` in `server/.env` and the proxy target in `client/vite.config.js`.

### Login fails with the demo account

Run `npm run seed` again. If the account already exists, the seed script does not reset its password. You can delete the user from MongoDB and seed again, or create a new account on the registration page.

### `401` responses after logging in

The token is stored in `localStorage` and expires after 7 days. Log in again. If the server's `JWT_SECRET` changed, existing tokens become invalid.

### `403` when opening the admin area or review desk

Admin routes require `role: "admin"` and the review desk requires `role: "reviewer"`. Log in with the matching seeded account, or update the user's role in MongoDB. Reviewers are intentionally blocked from programme and notice management.

### File upload fails

- Only JPG, PNG and PDF files are accepted.
- Each file must be 5 MB or smaller.
- All four documents are required.

### Page looks fine on the home page but API calls fail

- Make sure the API is running on port 5000.
- Check the proxy settings in `client/vite.config.js`.
- For separate deployments, set `VITE_API_URL` and update `CLIENT_URL`.

### Browser page is blank after deploying

Run the client build, check that `client/dist` exists, and start the server with `NODE_ENV=production`. Check the browser console and server logs.

---

## Security notes and limitations

This portal is intended as a college project and a working demonstration. Before using it with real applicants:

- Uploaded documents are served publicly from `/uploads` in this version. Use private storage with authenticated downloads in production.
- JWTs are stored in `localStorage`. Consider httpOnly cookies and CSRF protection for a production system.
- Add rate limiting to login and registration endpoints.
- Add email verification, password reset, and a change-password screen.
- Validate and scan uploaded files on the server before storing them.
- Add audit logs for all reviewer and admin actions.
- Add pagination for large numbers of applications.
- Configure HTTPS, secure headers (Helmet), and proper backup and retention policies.
- Remove the seeded demo accounts and the demo credentials shown on the login page.

The sample notice dates, fees, seats and eligibility text are placeholders and should be replaced with official data.

---

## Notes

- Application numbers use the format `ABES-<session year>-<sequence>`, for example `ABES-2026-0001`.
- One applicant can submit one application per programme.
- The first application for a programme creates the sequence; the counter is kept in MongoDB.
- All timestamps are stored in UTC and displayed in Indian date format by the frontend.
- The project uses no CSS framework; styling is in a single stylesheet so it is easy to adjust for beginners.

If you are new to MERN, start with `server/src/server.js`, then read the controllers, and finally the React pages. Each file is kept small and commented where the logic is not obvious.
