# ApplyNepal Job Portal – System Overview and Design

## A. Application Overview

ApplyNepal is a MERN-based job portal focused on the Nepalese market.

- **Purpose**  
  Connect job seekers and recruiters in Nepal through a centralized online platform.

- **Target Users**  
  - Job seekers (applicants) searching for jobs in Nepal.  
  - Recruiters/companies posting vacancies and managing applicants.  
  - System administrators managing platform quality, compliance, and security.

- **Problem It Solves**  
  - Reduces friction in finding relevant jobs and candidates.  
  - Supports Nepal-specific requirements (local phone formats, categories, salary ranges).  
  - Adds trust via recruiter verification and admin oversight.  
  - Centralizes communication with notifications and application tracking.

## B. Business Workflow

### 1. Job Seeker Workflow

1. **Register / Login**  
   - Creates a `User` account with role `jobseeker`.  
   - Credentials are stored securely (hashed password) and JWT is issued on login.

2. **Create / Update Profile**  
   - Fills personal details, skills, experience, and uploads a profile photo and resume.  
   - Profile is used to pre-fill applications and help recruiters evaluate candidates.

3. **Browse and Search Jobs**  
   - Filters by category, location, salary range, experience, and job type.  
   - Views detailed job descriptions created by recruiters.

4. **Apply for Jobs**  
   - Selects a job and submits an `Application` linked to the selected job and their `User` record.  
   - Uploads or selects an existing resume file stored under `/uploads` (path persisted in the application).

5. **Track Application Status**  
   - Views application history and status: `pending`, `shortlisted`, `accepted`, or `rejected`.  
   - Receives notifications when recruiters change application status.

6. **Manage Saved Jobs**  
   - Optionally saves jobs for later review using the `savedJobs` reference array in `User`.

### 2. Recruiter Workflow

1. **Register / Login**  
   - Creates a `Recruiter` account with company details.  
   - Credentials are hashed; JWT issued on login with role `recruiter`.

2. **Submit Verification Documents**  
   - Uploads company registration documents stored in `/uploads`.  
   - A `CompanyVerification` record is created with status `pending`.

3. **Post and Manage Jobs**  
   - Creates new `Job` entries including title, description, skills, salary range, job type, category, location, and deadline.  
   - Jobs are linked to the `Recruiter` (field `postedBy`).  
   - Can edit or deactivate jobs; expired jobs are automatically marked inactive by comparing the current date with `deadline`.

4. **View Applicants**  
   - For each job, lists related `Application` records.  
   - Downloads or opens applicant resumes from `/uploads`.

5. **Review and Update Application Status**  
   - Reviews profile, skills, and resume.  
   - Changes status to `shortlisted`, `accepted`, or `rejected`.  
   - Status updates trigger `Notification` entries for job seekers.

6. **Manage Company Profile**  
   - Updates company name, description, address, and website.  
   - Views verification status (pending/verified/rejected).

### 3. Admin Workflow

1. **Admin Login**  
   - Logs in using the `Admin` model; password is hashed, and JWT role `admin` is issued.

2. **Verify Recruiters**  
   - Views `CompanyVerification` records with corresponding documents.  
   - Approves or rejects verifications by updating `status` and optionally `rejectionReason`.  
   - Sets `reviewedBy` and `reviewedAt`, linking decisions back to the admin.

3. **Manage Users and Recruiters**  
   - Can activate/deactivate `User` and `Recruiter` accounts (`isActive` flag).  
   - Can remove abusive accounts or handle reports.

4. **Manage Jobs**  
   - Monitors and moderates `Job` postings.  
   - Removes or deactivates jobs that violate policies or are reported.  
   - Ensures expired jobs are not visible to job seekers.

5. **Monitor Notifications and System Health**  
   - Ensures notification flows are functioning (e.g., application status changes, company verification updates).

## C. System Architecture

### 1. Frontend (React)

- Built with React and typical SPA structure (pages, components, context).  
- Handles:
  - Routing for public (job listing) and protected sections (dashboards).  
  - Forms for registration, login, profile, job posting, and applications.  
  - API integration with the backend via REST endpoints.  
  - Token storage (e.g., localStorage) and attaching JWT to authenticated requests.

### 2. Backend (Node + Express)

- Express server exposes REST APIs grouped by controllers:  
  `authController`, `userController`, `recruiterController`, `jobController`, `applicationController`, `adminController`, `notificationController`.
- Middleware:
  - `auth` for JWT verification and role-based checks.  
  - `upload` for handling multipart/form-data and file storage.  
  - `validation` for request validation.
- Implements core business logic: creating jobs, applying, updating statuses, recruiter verification, and admin operations.

### 3. Database (MongoDB + Mongoose)

Key collections and relationships:

- `User` – job seekers.  
- `Recruiter` – company HR users.  
- `Admin` – platform administrators.  
- `Job` – job postings created by recruiters.  
- `Application` – links a user to a job, with status and resume path.  
- `CompanyVerification` – recruiter verification documents and decisions.  
- `Notification` – messages to users and recruiters (status changes, verification events).

Mongoose models enforce schema-level validation (enums, formats, uniqueness) and define relationships via `ObjectId` references.

### 4. Authentication (JWT)

- On login, the backend verifies credentials (`matchPassword` methods on models) and signs a JWT containing:
  - User/recruiter/admin ID (`_id`).  
  - Role (`jobseeker`, `recruiter`, or `admin`).
- The token is sent to the client and attached to subsequent API requests in headers.
- Middleware verifies token signature, extracts payload, and attaches user context to `req`.

### 5. File Storage (`/uploads`)

- Resumes and company documents are uploaded via `upload` middleware.  
- Files are stored under a dedicated `/uploads` directory, with generated filenames to avoid collisions.  
- Models store only the relative file path, not binary content.  
- Access control ensures only authorized users (owner, recruiter, or admin) can download sensitive documents.

## D. Database Design Explanation

### 1. Core Entities

- **User**  
  Represents a job seeker; contains profile, contact, skills, experience, and references to saved jobs.

- **Recruiter**  
  Represents a hiring representative or company account; includes company profile data and verification-related fields.

- **Admin**  
  Represents platform administrators who have elevated permissions and can verify recruiters and moderate content.

- **Job**  
  Describes an open position posted by a recruiter.  
  - `postedBy` links to the recruiter.  
  - Salary range is modeled as an embedded object (`salaryRange.min`, `salaryRange.max`) with validation ensuring `max >= min`.  
  - `deadline` and `isActive` manage visibility and auto-expiry.

- **Application**  
  Links one job seeker (`applicant`) to one job (`job`).  
  Includes resume path, current status, notes, and an index enforcing one application per user per job.

- **CompanyVerification**  
  1:1 relationship with `Recruiter` via `recruiter` field (unique).  
  Stores uploaded document metadata, status, reviewer admin, and review timestamps.

- **Notification**  
  Polymorphic recipient using `recipient` and `recipientModel` (`User` or `Recruiter`).  
  Can optionally reference a `Job` and/or `Application` to provide context.  
  `type` enum ensures only supported notification events are stored.

### 2. Relationships

- **User – Application – Job**  
  - `Application.job` → `Job._id`.  
  - `Application.applicant` → `User._id`.  
  This models the many-to-many relationship between users and jobs via the `Application` join collection.

- **Recruiter – Job**  
  - `Job.postedBy` → `Recruiter._id`.  
  One recruiter can post many jobs; each job belongs to exactly one recruiter.

- **Recruiter – CompanyVerification – Admin**  
  - `CompanyVerification.recruiter` → `Recruiter._id` (unique: 1:1).  
  - `CompanyVerification.reviewedBy` → `Admin._id`.  
  This allows tracking who reviewed which recruiter with a single authoritative record per recruiter.

- **Notifications**  
  - `Notification.recipient` references either `User` or `Recruiter` (via `recipientModel`).  
  - Optional references: `relatedJob` and `relatedApplication` to connect events to specific entities.

## E. Security Design

### 1. JWT Authentication

- Stateless authentication: server issues JWTs instead of storing sessions.  
- Tokens are signed with a secret key; middleware verifies signature on each request.  
- Payload carries the user ID and role used downstream for authorization checks.

### 2. Role-Based Access Control (RBAC)

- Roles: `jobseeker`, `recruiter`, `admin`.  
- Middleware inspects JWT payload and enforces access:
  - Job seeker endpoints: viewing/applying to jobs, managing own profile and applications.  
  - Recruiter endpoints: posting jobs, managing own jobs, viewing applicants for their jobs only.  
  - Admin endpoints: verifying recruiters, managing users and jobs across the platform.

### 3. Password Hashing

- `User`, `Recruiter`, and `Admin` schemas define `pre('save')` hooks.  
- Plain-text passwords are never stored; instead, bcrypt hashes are generated with a cost factor (e.g., 12).  
- `matchPassword` methods compare login attempts against stored hashes.

### 4. File Upload Validation and Security

- Upload middleware validates:
  - File type (e.g., PDF, DOCX for resumes; specific formats for company documents).  
  - File size limits.  
- Files are stored with sanitized, unique filenames in `/uploads`.  
- Client never gets direct OS paths; only safe relative paths are exposed.  
- Access is restricted so that only:  
  - The owner job seeker, relevant recruiter, or admin can access resumes.  
  - Only admin and the owning recruiter can access verification documents.

### 5. Job Expiration and Data Integrity

- Jobs store a `deadline` field.  
- Business logic ensures:
  - Expired jobs are marked inactive (`isActive=false`) and excluded from job seeker listings.  
  - New applications cannot be submitted to expired or inactive jobs.

- Schema-level validations (salary range, enums, formats) prevent inconsistent or invalid data from entering the database.

## F. Technical Interview Q&A

### 1. Why use JWT instead of traditional server-side sessions?

**Answer:**  
JWTs make the backend stateless: no per-user session storage is required on the server. This is ideal for scalable APIs and microservices. Tokens are self-contained, carrying user ID and role, and can be verified with just the secret key. In ApplyNepal, React acts as a SPA client and attaches the JWT to each request, which fits well with RESTful APIs and avoids sticky sessions across multiple backend instances.

### 2. How is role-based access control (RBAC) enforced?

**Answer:**  
When a user logs in, the JWT payload includes their role (`jobseeker`, `recruiter`, or `admin`). An `auth` middleware verifies the token and attaches this role to `req.user`. Route-level middleware then checks the role before executing controller logic. For example, job posting routes allow only `recruiter`, while verification and user-management routes require `admin`. Controllers can also perform ownership checks (e.g., a recruiter can only see applications for jobs they posted).

### 3. How are resume and company document uploads secured?

**Answer:**  
Uploads go through a dedicated middleware that validates file size and type, stores files under `/uploads` with safe, unique filenames, and persists only the path in MongoDB. Direct arbitrary path access is blocked; instead, secure routes check the authenticated user and role before streaming files. Job seeker resumes are accessible only to the respective applicant, relevant recruiters, and admins. Company documents are similarly restricted to admins and the owning recruiter, preventing unauthorized downloads.

### 4. How does job expiration work in the system?

**Answer:**  
Each `Job` document has a `deadline` date and an `isActive` flag. On reads, queries filter by `isActive=true` and `deadline >= currentDate` to show only valid jobs to job seekers. Background tasks or controller logic can automatically flip `isActive` to `false` once `deadline` is past. When applying, the application controller checks that the job is still active and not past its deadline, preventing late applications.

### 5. How is salary range validation implemented?

**Answer:**  
The `Job` schema models `salaryRange` as an embedded object with `min` and `max` properties. A custom validator on `salaryRange.max` ensures that `max >= min` when both are numeric. If the condition fails, Mongoose rejects the document and returns a meaningful validation error. This guarantees that all stored salary ranges are logically consistent and prevents bad data from leaking into the UI.

### 6. How does admin verification of recruiters work end-to-end?

**Answer:**  
When a recruiter uploads verification documents, the backend creates or updates a `CompanyVerification` record linked uniquely to that recruiter. The status starts as `pending`. Admins access a protected endpoint listing pending verifications, review uploaded documents from `/uploads`, and update the record to `approved` or `rejected`, filling in `reviewedBy`, `reviewedAt`, and optional `rejectionReason`. The recruiter’s `verificationStatus` is synchronized with this decision, and a `Notification` of type `company_verified` or `company_rejected` is created for the recruiter.
