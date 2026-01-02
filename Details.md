# ApplyNepal – System Analysis & Documentation (MERN Job Portal)

---

## 1. Actors & Roles

### 1.1 Actor: Job Seeker (Applicant)

- **Description**  
  Individual user seeking employment opportunities in Nepal.

- **Responsibilities**
  - **[R1]** Create and maintain personal account and `JobSeekerProfile`.
  - **[R2]** Upload and manage resumes.
  - **[R3]** Browse and filter job listings.
  - **[R4]** Apply for jobs and track application status.
  - **[R5]** Save jobs for later (wishlist).
  - **[R6]** Manage notifications (view, mark as read).
  - **[R7]** Update personal settings (password, contact details).

- **Permissions**
  - **[P1]** Register and login.
  - **[P2]** View public job listings without login (limited).
  - **[P3]** Apply to jobs only when:
    - Authenticated as `Job Seeker`.
    - Has at least one active `Resume`.
  - **[P4]** Edit/Delete own `JobSeekerProfile`.
  - **[P5]** Upload/Delete own `Resume` files.
  - **[P6]** View own `Application` history and statuses.
  - **[P7]** Save/unsave jobs (own `SavedJob` records).
  - **[P8]** View notifications addressed to them.

---

### 1.2 Actor: Recruiter (Company Representative)

- **Description**  
  User acting on behalf of a company, responsible for posting and managing jobs.

- **Responsibilities**
  - **[R10]** Create and maintain `RecruiterProfile`.
  - **[R11]** Create and maintain associated `Company` profiles.
  - **[R12]** Post new `Job` listings.
  - **[R13]** Review applicants (`Application` records) and resumes.
  - **[R14]** Update application status (shortlist, reject, hire).
  - **[R15]** Upload `CompanyDocument` for verification.
  - **[R16]** Communicate with applicants via system notifications.
  - **[R17]** Close or update jobs (extend deadlines, edit details).

- **Permissions**
  - **[P10]** Register and login as recruiter.
  - **[P11]** Create/update `RecruiterProfile` and associated `Company` (before verification, may be in “pending” state).
  - **[P12]** **Post jobs only after recruiter/company is verified by Admin.**
  - **[P13]** View and manage `Application` records belonging to their jobs.
  - **[P14]** Upload `CompanyDocument` for KYC/verification.
  - **[P15]** View notifications related to company, jobs, and verification.
  - **[P16]** Cannot modify data belonging to other companies or users.

---

### 1.3 Actor: Admin

- **Description**  
  System administrator managing users, companies, jobs, and overall platform.

- **Responsibilities**
  - **[R20]** Manage all `User` accounts (activate/deactivate, reset).
  - **[R21]** Verify or reject `Recruiter` and `Company` based on `CompanyDocument`.
  - **[R22]** Moderate job listings (approve, reject, hide, remove).
  - **[R23]** Handle abuse reports or suspicious activities.
  - **[R24]** Access platform-wide metrics and logs.

- **Permissions (Admin-only actions)**
  - **[P20]** Full CRUD on all user-related entities (read/write/delete), with audit logging.
  - **[P21]** Verify or unverify `RecruiterProfile` and `Company`.
  - **[P22]** Force-close or delete `Job` postings.
  - **[P23]** View all `Application` and `Resume` data.
  - **[P24]** Manage system-level configuration (e.g., allowed file types, max uploads).
  - **[P25]** Create/read `Notification` for any user or broadcast announcements.

---

## 2. Entities & Attributes

> Notation:  
> - **PK** = Primary Key  
> - **FK** = Foreign Key  
> - **Req** / **Opt** = Required / Optional  
> - Types assume MongoDB + Mongoose-like schema.

### 2.1 Entity: User

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute       | Type        | Req/Opt | Unique | Validation / Notes                                                                 |
|----------------|------------|---------|--------|-------------------------------------------------------------------------------------|
| id             | ObjectId   | Req     | Yes    | MongoDB ObjectId                                                                    |
| role           | String     | Req     | No     | Enum: `["job_seeker", "recruiter", "admin"]`                                       |
| email          | String     | Req     | Yes    | Format: email, regex: `^[^\s@]+@[^\s@]+\.[^\s@]+$`                                  |
| passwordHash   | String     | Req     | No     | Hashed password (e.g., bcrypt), min length 60 chars (hash length)                  |
| isActive       | Boolean    | Req     | No     | Default: true                                                                       |
| createdAt      | Date       | Req     | No     | Default: now                                                                        |
| updatedAt      | Date       | Req     | No     | Auto-updated                                                                        |
| lastLoginAt    | Date       | Opt     | No     | Last successful login time                                                          |
| phoneNumber    | String     | Opt     | No     | Nepal format (see Section 10), regex: `^(98|97)\d{8}$`                              |
| emailVerified  | Boolean    | Req     | No     | Default: false                                                                      |
| resetToken     | String     | Opt     | No     | For password reset; expiry handled elsewhere                                       |
| resetTokenExp  | Date       | Opt     | No     | Expiry of reset token                                                               |

---

### 2.2 Entity: JobSeekerProfile

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute        | Type        | Req/Opt | Unique | Validation / Notes                                 |
|-----------------|------------|---------|--------|---------------------------------------------------|
| id              | ObjectId   | Req     | Yes    | PK                                                |
| userId          | ObjectId   | Req     | Yes    | FK → User.id, unique (one-to-one)                |
| fullName        | String     | Req     | No     | Trimmed, min 2, max 100 chars                     |
| dateOfBirth     | Date       | Opt     | No     | Age >= 16 (business rule, validated in backend)   |
| gender          | String     | Opt     | No     | Enum: `["male","female","other","prefer_not"]`    |
| location        | String     | Opt     | No     | Nepal city/district (free text, suggested list)   |
| experienceYears | Number     | Opt     | No     | Min: 0, max: 50                                   |
| highestEducation| String     | Opt     | No     | e.g., `SLC`, `+2`, `Bachelor`, `Master`           |
| skills          | [String]   | Opt     | No     | Array of skill tags                               |
| headline        | String     | Opt     | No     | Short profile title, max 150 chars                |
| about           | String     | Opt     | No     | Longer description, max 2000 chars                |
| createdAt       | Date       | Req     | No     | Default: now                                      |
| updatedAt       | Date       | Req     | No     | Auto-updated                                      |

---

### 2.3 Entity: RecruiterProfile

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute        | Type      | Req/Opt | Unique | Validation / Notes                                       |
|-----------------|-----------|---------|--------|---------------------------------------------------------|
| id              | ObjectId  | Req     | Yes    | PK                                                      |
| userId          | ObjectId  | Req     | Yes    | FK → User.id, unique (one-to-one)                      |
| fullName        | String    | Req     | No     | Name of recruiter contact                               |
| positionTitle   | String    | Opt     | No     | e.g., HR Manager                                        |
| phoneNumber     | String    | Req     | No     | Nepal format, regex: `^(98|97)\d{8}$`                   |
| companyId       | ObjectId  | Opt     | No     | FK → Company.id, nullable before linking                |
| isVerified      | Boolean   | Req     | No     | Default: false, set true by Admin                       |
| verificationAt  | Date      | Opt     | No     | Timestamp when verified                                 |
| createdAt       | Date      | Req     | No     | Default: now                                            |
| updatedAt       | Date       | Req     | No     | Auto-updated                                            |

---

### 2.4 Entity: AdminProfile

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute    | Type      | Req/Opt | Unique | Validation / Notes                          |
|-------------|-----------|---------|--------|--------------------------------------------|
| id          | ObjectId  | Req     | Yes    | PK                                         |
| userId      | ObjectId  | Req     | Yes    | FK → User.id, unique (one-to-one)         |
| fullName    | String    | Req     | No     | Admin name                                 |
| roleTitle   | String    | Opt     | No     | e.g., Super Admin, Moderator               |
| createdAt   | Date      | Req     | No     | Default: now                               |
| updatedAt   | Date      | Req     | No     | Auto-updated                               |

---

### 2.5 Entity: Company

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute       | Type      | Req/Opt | Unique | Validation / Notes                                             |
|----------------|-----------|---------|--------|-----------------------------------------------------------------|
| id             | ObjectId  | Req     | Yes    | PK                                                              |
| name           | String    | Req     | Yes    | Company name, trimmed, max 150 chars                           |
| registrationNo | String    | Opt     | No     | Company registration; used in verification                     |
| industry       | String    | Opt     | No     | e.g., IT, Finance                                              |
| website        | String    | Opt     | No     | URL format; regex basic URL check                              |
| address        | String    | Opt     | No     | Street + city + district                                       |
| city           | String    | Opt     | No     | Nepal city                                                      |
| district       | String    | Opt     | No     | Nepal district                                                  |
| country        | String    | Req     | No     | Default: "Nepal"                                               |
| description    | String    | Opt     | No     | Company description, max 3000 chars                            |
| logoPath       | String    | Opt     | No     | `/uploads/company-logos/...`                                   |
| isVerified     | Boolean   | Req     | No     | Default: false; set by Admin                                   |
| verifiedAt     | Date      | Opt     | No     | Timestamp of verification                                      |
| createdBy      | ObjectId  | Req     | No     | FK → RecruiterProfile.id or User.id (recruiter)                |
| createdAt      | Date      | Req     | No     | Default: now                                                   |
| updatedAt      | Date      | Req     | No     | Auto-updated                                                   |

---

### 2.6 Entity: Job

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute         | Type      | Req/Opt | Unique | Validation / Notes                                                             |
|------------------|-----------|---------|--------|-------------------------------------------------------------------------------|
| id               | ObjectId  | Req     | Yes    | PK                                                                            |
| title            | String    | Req     | No     | Job title, max 150 chars                                                     |
| description      | String    | Req     | No     | Job description, rich text allowed, max 10000 chars                          |
| companyId        | ObjectId  | Req     | No     | FK → Company.id                                                               |
| recruiterId      | ObjectId  | Req     | No     | FK → RecruiterProfile.id                                                     |
| location         | String    | Req     | No     | City/district in Nepal                                                       |
| employmentType   | String    | Req     | No     | Enum: `["full_time", "part_time", "internship", "contract"]`                 |
| minSalary        | Number    | Opt     | No     | NPR amount, >= 0, must be < `maxSalary` if both present                      |
| maxSalary        | Number    | Opt     | No     | NPR amount, >= `minSalary`                                                   |
| currency         | String    | Req     | No     | Enum: `["NPR"]`                                                               |
| isNegotiable     | Boolean   | Opt     | No     | Default: false                                                                |
| experienceMin    | Number    | Opt     | No     | Years, >=0                                                                    |
| experienceMax    | Number    | Opt     | No     | Years, >= experienceMin                                                       |
| skillsRequired   | [String]  | Opt     | No     | Array of skill tags                                                           |
| educationLevel   | String    | Opt     | No     | e.g., `Bachelor`, `Master`                                                   |
| deadline         | Date      | Req     | No     | Application deadline; must be >= today                                       |
| autoExpireAt     | Date      | Opt     | No     | Typically = deadline; used for auto-expiry                                   |
| status           | String    | Req     | No     | Enum: `["draft","pending_approval","active","expired","closed","rejected"]`  |
| viewCount        | Number    | Req     | No     | Default: 0                                                                    |
| createdAt        | Date      | Req     | No     | Default: now                                                                  |
| updatedAt        | Date      | Req     | No     | Auto-updated                                                                  |

- **Key Business Validations**
  - `minSalary < maxSalary` enforced when both fields are not null.
  - `deadline >= currentDate`.
  - Jobs cannot be active if the associated `Company` or `RecruiterProfile` is not verified.

---

### 2.7 Entity: Application

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute     | Type      | Req/Opt | Unique | Validation / Notes                                              |
|--------------|-----------|---------|--------|------------------------------------------------------------------|
| id           | ObjectId  | Req     | Yes    | PK                                                               |
| jobId        | ObjectId  | Req     | No     | FK → Job.id                                                      |
| applicantId  | ObjectId  | Req     | No     | FK → JobSeekerProfile.id                                        |
| resumeId     | ObjectId  | Req     | No     | FK → Resume.id                                                   |
| coverLetter  | String    | Opt     | No     | Max 5000 chars                                                   |
| status       | String    | Req     | No     | Enum: `["applied","shortlisted","rejected","hired","withdrawn"]`|
| appliedAt    | Date      | Req     | No     | Default: now                                                     |
| updatedAt    | Date      | Req     | No     | Auto-updated                                                     |
| notes        | String    | Opt     | No     | Internal recruiter/admin notes                                   |

- **Constraints**
  - Unique compound index: `(jobId, applicantId)` (no duplicate applications for same job by same seeker).
  - Can only be created if:
    - Job status is `active`.
    - Current date ≤ job.deadline.
    - Applicant has at least one active `Resume`.

---

### 2.8 Entity: Resume

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute       | Type      | Req/Opt | Unique | Validation / Notes                                |
|----------------|-----------|---------|--------|--------------------------------------------------|
| id             | ObjectId  | Req     | Yes    | PK                                               |
| jobSeekerId    | ObjectId  | Req     | No     | FK → JobSeekerProfile.id                         |
| filePath       | String    | Req     | No     | `/uploads/resumes/...`                           |
| originalName   | String    | Req     | No     | Original filename                                |
| mimeType       | String    | Req     | No     | Allowed: `application/pdf`, optional DOCX        |
| fileSizeBytes  | Number    | Req     | No     | Max e.g., 5MB (configured)                       |
| isActive       | Boolean   | Req     | No     | Only active resumes selectable during apply      |
| createdAt      | Date      | Req     | No     | Default: now                                     |

- **Validation Rules**
  - File type whitelist validated on backend and frontend.
  - File size < configured maximum.

---

### 2.9 Entity: CompanyDocument

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute      | Type      | Req/Opt | Unique | Validation / Notes                                       |
|---------------|-----------|---------|--------|---------------------------------------------------------|
| id            | ObjectId  | Req     | Yes    | PK                                                      |
| companyId     | ObjectId  | Req     | No     | FK → Company.id                                         |
| uploaderId    | ObjectId  | Req     | No     | FK → RecruiterProfile.id                                |
| type          | String    | Req     | No     | Enum: `["registration_cert","pan","tax_clearance","other"]` |
| filePath      | String    | Req     | No     | `/uploads/company-docs/...`                             |
| mimeType      | String    | Req     | No     | PDF/JPEG/PNG only                                       |
| fileSizeBytes | Number    | Req     | No     | Max size (e.g., 5MB)                                    |
| status        | String    | Req     | No     | Enum: `["pending","approved","rejected"]`               |
| reviewedBy    | ObjectId  | Opt     | No     | FK → AdminProfile.id                                    |
| reviewedAt    | Date      | Opt     | No     | Timestamp when reviewed                                 |
| remarks       | String    | Opt     | No     | Admin comments, max 2000 chars                          |
| uploadedAt    | Date      | Req     | No     | Default: now                                            |

---

### 2.10 Entity: Notification

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute    | Type      | Req/Opt | Unique | Validation / Notes                                |
|-------------|-----------|---------|--------|--------------------------------------------------|
| id          | ObjectId  | Req     | Yes    | PK                                               |
| userId      | ObjectId  | Req     | No     | FK → User.id                                     |
| type        | String    | Req     | No     | Enum: `["application_status","job_update","verification","system"]` |
| title       | String    | Req     | No     | Max 150 chars                                    |
| message     | String    | Req     | No     | Max 2000 chars                                   |
| data        | Object    | Opt     | No     | JSON payload (jobId, applicationId, etc.)        |
| isRead      | Boolean   | Req     | No     | Default: false                                   |
| createdAt   | Date      | Req     | No     | Default: now                                     |
| readAt      | Date      | Opt     | No     | Timestamp when read                              |

---

### 2.11 Entity: SavedJob

- **Primary Key**
  - `id` (ObjectId, PK)

- **Attributes**

| Attribute      | Type      | Req/Opt | Unique | Validation / Notes                         |
|---------------|-----------|---------|--------|-------------------------------------------|
| id            | ObjectId  | Req     | Yes    | PK                                        |
| jobSeekerId   | ObjectId  | Req     | No     | FK → JobSeekerProfile.id                  |
| jobId         | ObjectId  | Req     | No     | FK → Job.id                               |
| savedAt       | Date      | Req     | No     | Default: now                               |

- **Constraints**
  - Unique compound index: `(jobSeekerId, jobId)` (no duplicate saves).

---

## 3. Entity Relationships

### 3.1 User & Profiles

- **User–JobSeekerProfile**
  - Type: One-to-One.
  - Direction: `User (1) → (0/1) JobSeekerProfile`.
  - FK: `JobSeekerProfile.userId` → `User.id` (unique).
  - On Delete:
    - If `User` deleted: cascade delete `JobSeekerProfile`, `Resume`, `Application`, `SavedJob`, and `Notification` for that user.
  - On Update:
    - `User.id` immutable; profile references remain unchanged.

- **User–RecruiterProfile**
  - Type: One-to-One.
  - Direction: `User (1) → (0/1) RecruiterProfile`.
  - FK: `RecruiterProfile.userId`.
  - On Delete:
    - If `User` deleted: cascade delete `RecruiterProfile`, possibly soft-delete `Company` if no other recruiters; set affected `Job` to `closed`.
  - On Update:
    - `User.id` immutable.

- **User–AdminProfile**
  - Type: One-to-One.
  - Direction: `User (1) → (0/1) AdminProfile`.
  - FK: `AdminProfile.userId`.
  - On Delete:
    - Restricted; usually admins are deactivated not removed.

---

### 3.2 Company & Recruiter

- **Company–RecruiterProfile**
  - Type: One-to-Many.
  - Direction: `Company (1) → (0..N) RecruiterProfile`.
  - FK: `RecruiterProfile.companyId`.
  - On Delete:
    - If `Company` deleted (rare, usually soft-delete): set `RecruiterProfile.companyId = null`, mark related jobs as `closed`.
  - On Update:
    - Company’s name/address updates propagate to job display but FKs unchanged.

- **Company–CompanyDocument**
  - Type: One-to-Many.
  - Direction: `Company (1) → (0..N) CompanyDocument`.
  - FK: `CompanyDocument.companyId`.
  - On Delete:
    - If `Company` deleted: delete associated `CompanyDocument` files and DB records.

---

### 3.3 Company & Job

- **Company–Job**
  - Type: One-to-Many.
  - Direction: `Company (1) → (0..N) Job`.
  - FK: `Job.companyId`.
  - On Delete:
    - If `Company` is deactivated: jobs set to `closed` or `expired`, applications remain for audit.

- **RecruiterProfile–Job**
  - Type: One-to-Many.
  - Direction: `RecruiterProfile (1) → (0..N) Job`.
  - FK: `Job.recruiterId`.
  - On Delete:
    - If recruiter removed or deactivated: their jobs set to `closed`.

---

### 3.4 Job & Application

- **Job–Application**
  - Type: One-to-Many.
  - Direction: `Job (1) → (0..N) Application`.
  - FK: `Application.jobId`.
  - On Delete:
    - If job deleted or closed: applications retained but marked inactive or jobId kept for history; soft-delete preferred.

---

### 3.5 JobSeekerProfile, Resume, SavedJob, Application

- **JobSeekerProfile–Resume**
  - Type: One-to-Many.
  - Direction: `JobSeekerProfile (1) → (0..N) Resume`.
  - FK: `Resume.jobSeekerId`.
  - On Delete:
    - If profile deleted: cascade delete resumes and files.

- **JobSeekerProfile–SavedJob**
  - Type: One-to-Many.
  - Direction: `JobSeekerProfile (1) → (0..N) SavedJob`.
  - FK: `SavedJob.jobSeekerId`.
  - On Delete:
    - If profile deleted: delete saved jobs.

- **JobSeekerProfile–Application**
  - Type: One-to-Many.
  - Direction: `JobSeekerProfile (1) → (0..N) Application`.
  - FK: `Application.applicantId`.
  - On Delete:
    - Profile deletion should retain anonymized applications or soft-delete depending on policy.

- **Resume–Application**
  - Type: One-to-Many.
  - Direction: `Resume (1) → (0..N) Application`.
  - FK: `Application.resumeId`.
  - On Delete:
    - If resume deleted: disallow deletion if referenced by active or historical applications, or keep resume file until retention.

---

### 3.6 User & Notification

- **User–Notification**
  - Type: One-to-Many.
  - Direction: `User (1) → (0..N) Notification`.
  - FK: `Notification.userId`.
  - On Delete:
    - If user deleted: cascade delete notifications.

---

### 3.7 Many-to-Many (Conceptual)

- **JobSeeker–Job (via Application)**
  - Many Job Seekers can apply to many Jobs.
  - Implemented through `Application` as join entity.

- **JobSeeker–Job (via SavedJob)**
  - Many Job Seekers can save many Jobs.
  - Implemented through `SavedJob` as join entity.

---

## 4. Use Case Specifications

### 4.1 Job Seeker Use Cases

#### UC-JS-01: Register as Job Seeker

- **Actor**: Job Seeker
- **Trigger**: User clicks “Sign Up as Job Seeker”.
- **Preconditions**
  - User is not logged in.
  - Email not already registered.
- **Main Flow**
  1. User enters email, password, and optional phone number.
  2. System validates input (email format, password strength).
  3. System creates `User` with role `job_seeker`.
  4. System sends verification email (optional).
  5. System logs user in and redirects to profile setup.
- **Alternate Flows**
  - A1: Email already exists → show error and suggest login/forgot password.
  - A2: Weak password → show validation errors.
- **Postconditions**
  - New `User` record created.
  - User session/JWT issued.

#### UC-JS-02: Create/Update Job Seeker Profile

- **Actor**: Job Seeker
- **Trigger**: User navigates to “My Profile”.
- **Preconditions**
  - User is logged in with role `job_seeker`.
- **Main Flow**
  1. User fills profile fields (name, location, skills, etc.).
  2. System validates fields.
  3. System creates or updates `JobSeekerProfile`.
- **Alternate Flows**
  - A1: Missing required fields → stay on form, show validation errors.
- **Postconditions**
  - `JobSeekerProfile` saved/updated.

#### UC-JS-03: Upload Resume

- **Actor**: Job Seeker
- **Trigger**: User clicks “Upload Resume”.
- **Preconditions**
  - Logged in as job seeker.
- **Main Flow**
  1. User selects resume file.
  2. Frontend validates file type/size.
  3. Backend uploads file to `/uploads/resumes`.
  4. Backend creates `Resume` record associated with `JobSeekerProfile`.
- **Alternate Flows**
  - A1: Invalid file type or too large → reject upload.
- **Postconditions**
  - At least one active `Resume` may exist.

#### UC-JS-04: Browse and Filter Jobs

- **Actor**: Job Seeker (or guest)
- **Trigger**: User opens job listing page.
- **Preconditions**
  - None.
- **Main Flow**
  1. User views list of `Job` where `status="active"` and `deadline >= today`.
  2. User applies filters (location, job type, salary, skills).
  3. System queries and displays filtered results.
- **Alternate Flows**
  - A1: No matching results → display “no jobs found”.
- **Postconditions**
  - None (read-only).

#### UC-JS-05: Apply to Job

- **Actor**: Job Seeker
- **Trigger**: User clicks “Apply” on a job.
- **Preconditions**
  - Logged in as job seeker.
  - Has at least one active `Resume`.
  - Job is `active` and not past `deadline`.
- **Main Flow**
  1. System loads job details and available resumes.
  2. User selects a resume and adds optional cover letter.
  3. System validates that no existing `Application` for same job and applicant.
  4. System creates `Application` with status `applied`.
  5. System creates `Notification` to recruiter.
- **Alternate Flows**
  - A1: No resume available → system blocks and prompts to upload resume (business rule).
  - A2: Job expired → show error, prevent application.
- **Postconditions**
  - `Application` created and visible to recruiter and applicant.

#### UC-JS-06: Track Application Status

- **Actor**: Job Seeker
- **Trigger**: User opens “My Applications”.
- **Preconditions**
  - Logged in as job seeker.
- **Main Flow**
  1. System fetches `Application` records where `applicantId` = user profile.
  2. System displays list with job title, company, and status.
- **Alternate Flows**
  - None significant.
- **Postconditions**
  - None (read-only).

#### UC-JS-07: Save/Unsave Job

- **Actor**: Job Seeker
- **Trigger**: User clicks “Save Job” or “Unsave Job”.
- **Preconditions**
  - Logged in as job seeker.
- **Main Flow**
  - Save:
    1. System checks if `SavedJob` exists.
    2. If not, creates new `SavedJob`.
  - Unsave:
    1. System deletes corresponding `SavedJob`.
- **Alternate Flows**
  - A1: Duplicate save attempt → no-op.
- **Postconditions**
  - Saved jobs list updated.

---

### 4.2 Recruiter Use Cases

#### UC-R-01: Register as Recruiter

- Similar to UC-JS-01 but `role = recruiter`.

#### UC-R-02: Create/Update Recruiter Profile & Company

- **Actor**: Recruiter
- **Trigger**: Access “Recruiter Dashboard” or “Company Profile”.
- **Preconditions**
  - Logged in as recruiter.
- **Main Flow**
  1. Recruiter fills personal and company details.
  2. System validates.
  3. System creates/updates `RecruiterProfile` and `Company`.
  4. System marks `isVerified = false` and notifies admin.
- **Postconditions**
  - Recruiter and company exist but may be unverified; cannot post jobs until verified.

#### UC-R-03: Upload Company Documents

- **Actor**: Recruiter
- **Preconditions**
  - Logged in as recruiter.
  - Company linked.
- **Main Flow**
  1. Recruiter uploads registration certificate, PAN, etc.
  2. Backend stores file and creates `CompanyDocument` with status `pending`.
  3. Notification to Admin for review.
- **Postconditions**
  - `CompanyDocument` pending approval.

#### UC-R-04: Post Job

- **Actor**: Recruiter
- **Preconditions**
  - Logged in as recruiter.
  - `RecruiterProfile.isVerified = true` and `Company.isVerified = true`.
- **Main Flow**
  1. Recruiter fills job form.
  2. System validates fields (salary, deadline).
  3. System creates `Job` with `status = active` or `pending_approval` depending on moderation setting.
- **Alternate Flows**
  - A1: Recruiter not verified → block posting, show message.
  - A2: Invalid salary range/deadline → show form errors.
- **Postconditions**
  - New job active or pending.

#### UC-R-05: Review Applicants

- **Actor**: Recruiter
- **Preconditions**
  - Logged in as recruiter.
  - Owns a job with applications.
- **Main Flow**
  1. Recruiter opens job detail → applicant list.
  2. System queries `Application` where `jobId` = job.
  3. System displays applications with links to resumes.
- **Postconditions**
  - None (view).

#### UC-R-06: Update Application Status

- **Actor**: Recruiter
- **Preconditions**
  - Logged in as recruiter.
  - Has permission on that job.
- **Main Flow**
  1. Recruiter selects an application.
  2. Sets status (e.g., `shortlisted`, `rejected`, `hired`).
  3. System updates `Application.status`.
  4. System sends `Notification` to applicant.
- **Postconditions**
  - Application status updated; notification delivered.

---

### 4.3 Admin Use Cases

#### UC-A-01: Verify Recruiter & Company

- **Actor**: Admin
- **Preconditions**
  - Logged in as admin.
  - Pending `CompanyDocument` exists.
- **Main Flow**
  1. Admin opens list of pending documents.
  2. Reviews uploaded files.
  3. Approves or rejects document with remarks.
  4. If approved, sets `Company.isVerified = true` and/or `RecruiterProfile.isVerified = true`.
  5. Sends notification to recruiter.
- **Postconditions**
  - Recruiter may gain permission to post jobs.

#### UC-A-02: Manage Jobs

- **Actor**: Admin
- **Main Flow**
  1. Admin views list of jobs.
  2. Can approve, reject, or forcibly close jobs violating policies.
  3. System updates `Job.status` and sends notifications.
- **Postconditions**
  - Job state reflects admin decisions.

#### UC-A-03: Manage Users

- **Actor**: Admin
- **Main Flow**
  1. Admin lists users.
  2. Can activate/deactivate accounts.
  3. System updates `User.isActive`.
- **Postconditions**
  - Deactivated users cannot log in or perform actions.

---

## 5. Activity Workflows

### 5.1 Job Seeker: Browse → Apply → Track Status

1. **Start**
2. User visits job listing page.
3. System loads active jobs (filter by Nepal location if chosen).
4. User applies filters (location, salary, keyword).
5. System returns filtered jobs.
6. **Decision**: User logged in?
   - No → can view details; must login to apply.
   - Yes → proceed.
7. User opens job detail.
8. **Decision**: Has at least one active `Resume`?
   - No → system prompts “Upload resume first”; redirect to resume upload.
   - Yes → proceed.
9. User clicks “Apply”.
10. System displays apply form (select resume, cover letter).
11. User submits application.
12. Backend validates job status (active, not expired), uniqueness, and resume.
13. On success:
    - Create `Application`.
    - Create `Notification` to recruiter.
14. System shows confirmation.
15. Later, user opens “My Applications”.
16. System lists applications with current statuses.
17. **End**.

---

### 5.2 Recruiter: Post Job → Review Applicants → Update Status

1. **Start**
2. Recruiter logs in and opens dashboard.
3. **Decision**: Is recruiter & company verified?
   - No → system shows status and instructs to upload documents; cannot post jobs.
   - Yes → proceed.
4. Recruiter clicks “Post New Job”.
5. Fills job details (title, description, salary, deadline, location).
6. System validates salary range and deadline.
7. On success, system creates `Job` as `active` or `pending_approval`.
8. Applications begin coming in.
9. Recruiter opens job applicants list.
10. System fetches `Application` by `jobId`.
11. Recruiter views each application and downloads/view resumes.
12. Recruiter selects an application to update status.
13. Sets new status (shortlisted, rejected, hired).
14. System updates `Application` and sends `Notification` to applicant.
15. Recruiter may close job when enough hires.
16. System sets `Job.status = closed`.
17. **End**.

---

### 5.3 Admin: Verify Recruiters → Manage Users → Manage Jobs

1. **Start**
2. Admin logs into admin panel.
3. Admin opens “Pending Verifications”.
4. System shows list of `CompanyDocument` with `pending` status.
5. Admin selects a document, views file, and checks company details.
6. **Decision**: Accept verification?
   - Approve:
     - Set `CompanyDocument.status = approved`.
     - Set `Company.isVerified = true`; set linked `RecruiterProfile.isVerified = true`.
     - Send `Notification` to recruiter.
   - Reject:
     - Set `CompanyDocument.status = rejected`, add remarks.
     - Notify recruiter with reasons.
7. Admin opens “Users Management”.
8. Can search by email, role, status.
9. Admin deactivates abusive users (set `User.isActive = false`).
10. Admin opens “Job Management”.
11. Can view, approve, reject, or close jobs violating terms.
12. System updates job status and notifies owners.
13. **End**.

---

## 6. Sequence Flow Descriptions

### 6.1 Job Application Process

- **Actors/Components**: Job Seeker (Browser), React Frontend, Express API, MongoDB, Notification Service.

1. Job Seeker clicks “Apply” on job detail (Frontend).
2. Frontend sends `GET /api/resumes` to fetch available resumes.
3. Backend (Express) queries `Resume` by `jobSeekerId` from MongoDB and returns list.
4. User selects resume, writes cover letter, clicks “Submit”.
5. Frontend sends `POST /api/applications` with `{ jobId, resumeId, coverLetter }` and JWT in headers.
6. Backend middleware verifies JWT, loads `User`, and checks role `job_seeker`.
7. Backend validates:
   - Job exists and is `active`, not expired.
   - Resume belongs to job seeker.
   - No existing `Application` with same `(jobId, applicantId)`.
   - At least one active resume exists.
8. On success:
   - Insert `Application` into MongoDB.
   - Create `Notification` for recruiter’s `User.id`.
9. Backend responds 201 with application details.
10. Frontend shows success message and updates “My Applications” list (optional refresh).

---

### 6.2 Recruiter Reviewing Applicant

- **Actors/Components**: Recruiter, React Frontend, Express API, MongoDB, File Storage.

1. Recruiter opens “Job Applicants” page.
2. Frontend sends `GET /api/jobs/:jobId/applications`.
3. Backend verifies JWT, checks recruiter role and job ownership.
4. Backend queries `Application` where `jobId` and joins applicant profile (`JobSeekerProfile`) and resume metadata.
5. Results returned to frontend.
6. Recruiter clicks on an application to view details.
7. Frontend displays applicant info; for resume download, sends `GET /api/resumes/:id/download`.
8. Backend checks permission (recruiter must own job associated with application) and streams file from `/uploads/resumes`.
9. Recruiter updates status (e.g., shortlist).
10. Frontend sends `PATCH /api/applications/:id` with new status.
11. Backend confirms ownership, updates `Application.status`, and creates `Notification` for applicant.
12. Response returns updated application; frontend reflects new status.

---

### 6.3 Admin Verifying Recruiter

- **Actors/Components**: Admin, React Admin UI, Express Admin API, MongoDB, File Storage, Notification Service.

1. Admin logs in; admin UI stores JWT with admin role.
2. Admin opens “Pending Documents”.
3. Frontend calls `GET /api/admin/company-documents?status=pending`.
4. Backend admin middleware validates JWT and admin role.
5. Backend queries `CompanyDocument` with `status = pending` and sends results.
6. Admin selects a document; frontend calls `GET /api/admin/company-documents/:id`.
7. Backend returns metadata and file URL; for viewing file, `GET /api/admin/company-documents/:id/file`.
8. Admin reviews and decides to approve or reject.
9. Admin submits decision via `PATCH /api/admin/company-documents/:id` with `{ status, remarks }`.
10. Backend updates `CompanyDocument.status`, sets `reviewedBy`, `reviewedAt`.
11. If approved, backend sets `Company.isVerified = true` and `RecruiterProfile.isVerified = true`.
12. Backend creates `Notification` for recruiter’s user.
13. Response returns success; frontend updates list.

---

## 7. Business Rules & Constraints

- **BR1: Resume Mandatory Before Applying**
  - A job seeker must have at least one active `Resume` to create `Application`.
  - Backend enforces; frontend also checks.

- **BR2: Salary Validation**
  - If `minSalary` and `maxSalary` both provided:
    - `0 <= minSalary < maxSalary`.
  - Currency must be `NPR`.

- **BR3: Job Auto-Expiry**
  - Jobs with `deadline < currentDate` automatically become `expired`.
  - Background job or scheduled task updates `Job.status` and prevents new applications.

- **BR4: Role-Based Access Control (RBAC)**
  - `job_seeker`:
    - May manage their profile, resumes, saved jobs, and applications.
  - `recruiter`:
    - May manage jobs belonging to their `Company` and view applicants to those jobs.
  - `admin`:
    - May perform high-privilege operations (verification, moderation, configuration).
  - Implemented via middleware checking JWT and `User.role`.

- **BR5: Recruiter Verification**
  - `RecruiterProfile.isVerified` and `Company.isVerified` must both be `true` before:
    - Recruiter can post active jobs.
  - If verification revoked, new job posts are blocked and existing jobs may be auto-closed.

- **BR6: Admin-Only Actions**
  - Approve/reject recruiters and companies.
  - Approve/reject or close jobs.
  - Deactivate or reactivate user accounts.
  - Access all data regardless of ownership (with audit logging).

- **BR7: User Account Active State**
  - `User.isActive = false` → login blocked and actions denied.

---

## 8. System Components

### 8.1 Frontend (React)

- **Responsibilities**
  - SPA for job seekers, recruiters, and admin (possibly separate admin app).
  - Routing between pages (jobs list, job detail, profile, dashboard).
  - Form handling and client-side validation.
  - State management (e.g., Redux or Context) for auth and user data.
  - Communicates with backend via RESTful JSON APIs.
  - Displays notifications and status messages.

---

### 8.2 Backend (Node.js + Express)

- **Responsibilities**
  - REST API endpoints for all operations:
    - Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/refresh`.
    - Jobs: `/api/jobs`, `/api/jobs/:id`.
    - Applications: `/api/applications`.
    - Profiles: `/api/jobseeker-profile`, `/api/recruiter-profile`.
    - Admin: `/api/admin/...`.
  - Business logic enforcement (rules listed above).
  - Middleware for:
    - JWT verification and role checks.
    - Request validation (body schemas).
    - File upload handling (e.g., Multer).
  - Error handling and logging.

---

### 8.3 Database (MongoDB)

- **Responsibilities**
  - Persist all entities defined in Section 2.
  - Indexes:
    - Unique on `User.email`.
    - Compound on `(jobId, applicantId)` for `Application`.
    - Text indexes on job title/description for search (optional).

---

### 8.4 Authentication (JWT)

- **Flow**
  - User logs in with email + password.
  - Backend verifies password (hashed comparison).
  - On success:
    - Issues JWT containing `userId`, `role`, `isActive`.
    - Optionally issues refresh token.
  - Frontend stores JWT (e.g., HTTP-only cookie or secure storage).
  - Each protected request includes JWT; backend validates and authorizes.
  - Tokens invalidated on password change or logout as per implementation.

---

### 8.5 File Storage (`/uploads`)

- **Structure**
  - `/uploads/resumes` for `Resume` files.
  - `/uploads/company-docs` for `CompanyDocument`.
  - `/uploads/company-logos` for `Company.logoPath`.

- **Responsibilities**
  - Store files with unique filenames to prevent collision.
  - Provide secure download endpoints (auth + authorization checks).

---

### 8.6 Notification System

- **Implementation**
  - Stored as `Notification` documents in MongoDB.
  - Triggered by:
    - Application creation.
    - Application status change.
    - Recruiter/company verification decisions.
    - System announcements (admin).
  - Frontend polls or subscribes to notifications per user.

---

## 9. Security Design

- **JWT Authentication**
  - Tokens signed with strong secret or asymmetric keys.
  - Short-lived access tokens with optional refresh tokens.
  - Middleware rejects missing, expired, or invalid tokens.

- **Password Hashing**
  - Passwords never stored in plain text.
  - Use bcrypt or similar with adequate salt and cost factor.
  - Passwords validated on login by comparing hash.

- **File Upload Validation**
  - Check MIME type and extension server-side.
  - Restrict max file size.
  - Store outside of publicly listable paths; serve via authorized endpoints.
  - Generate sanitized filenames.

- **Role-Based Route Protection**
  - Express middleware enforces:
    - Only recruiters can access recruiter endpoints.
    - Only admins can access `/api/admin/*`.
    - Job seekers only access their own resumes/applications.
  - Ownership checks on `jobId`, `applicationId`, etc.

- **Input Validation**
  - Frontend:
    - Basic format checks (email, phone, numeric fields).
    - Prevent obviously invalid submissions.
  - Backend:
    - Strong validation using schema (e.g., Joi/Mongoose).
    - Sanitization to avoid injection and XSS in stored data.

---

## 10. Nepal-Specific Context

- **Phone Number Format**
  - Nepal mobile numbers: start with `98` or `97` and have 10 digits total.
  - Regex: `^(98|97)\d{8}$`.
  - Used in `User.phoneNumber` and `RecruiterProfile.phoneNumber`.

- **Location-Based Job Filtering**
  - Jobs include `location`, `city`, `district` fields referencing Nepali geography.
  - Frontend provides dropdown of districts/cities of Nepal.
  - Backend filters jobs by these fields when requested.

- **Currency**
  - All salary fields use NPR as default and enforced currency.
  - Display format: “NPR 50,000 – 70,000”.

- **Local Hiring Workflows**
  - Emphasis on local companies and Nepali locations.
  - Verification processes tailored to Nepali documents (registration cert, PAN).
  - Timezone default to NPT (UTC+5:45) for deadlines and timestamps (presentation level).

---

## 11. UML Diagram Mapping Guide

- **ER Diagram**
  - Include entities:
    - `User`, `JobSeekerProfile`, `RecruiterProfile`, `AdminProfile`,
    - `Company`, `Job`, `Application`, `Resume`,
    - `CompanyDocument`, `Notification`, `SavedJob`.
  - Represent all relationships described in Section 3 (PK/FK, cardinalities, cascades).

- **Use Case Diagram**
  - Actors:
    - Job Seeker
    - Recruiter
    - Admin
  - Use cases:
    - Job Seeker: register, manage profile, upload resume, browse jobs, apply to jobs, track applications, save jobs.
    - Recruiter: register, manage profile and company, upload company documents, post jobs, review applicants, update application status, close jobs.
    - Admin: verify recruiters/companies, manage users, manage jobs, manage system notifications.

- **Activity Diagrams**
  - Based on workflows in Section 5:
    - Job Seeker: Browse → Apply → Track.
    - Recruiter: Post Job → Review Applicants → Update Status.
    - Admin: Verify → Manage Users → Manage Jobs.

- **Sequence Diagrams**
  - Based on message flows in Section 6:
    - Application submission.
    - Application review and status update.
    - Recruiter verification by admin.

- **Component Diagram**
  - Components:
    - React Frontend (user UI, admin UI).
    - Express Backend (API server).
    - MongoDB Database.
    - JWT Auth Service (part of backend).
    - File Storage subsystem (`/uploads`).
    - Notification subsystem (backend + DB + frontend UI).

---

## 12. Technical Interview Reference (Q&A)

- **Q1: Why this data model with separate entities?**  
  **A:** Separation of concerns: `User` handles authentication and roles, while `JobSeekerProfile`, `RecruiterProfile`, and `AdminProfile` store role-specific details. This avoids cluttering the `User` entity with role-specific attributes and supports future role extensions.

- **Q2: Why separate profile entities for Job Seeker, Recruiter, and Admin?**  
  **A:** Each role has distinct attributes and workflows. Separate profile entities:
  - Simplify validation and evolution of role-specific data.
  - Maintain a clean, normalized structure.
  - Allow a single `User` model to support multiple role types without conflicting fields.

- **Q3: How is scalability handled in this MERN architecture?**  
  **A:**  
  - Horizontal scaling of Node.js backend instances behind a load balancer.
  - MongoDB’s built-in horizontal scalability: replica sets and sharding when necessary.
  - Stateless JWT-based authentication simplifies scaling backend nodes.
  - Separation of static file storage under `/uploads`, which can move to object storage (e.g., S3-compatible) in the future.
  - Use of indexes on frequently queried fields (email, job filters, application lookups).

- **Q4: How is security enforced across the system?**  
  **A:**  
  - Strong password hashing and JWT-based authentication.
  - Role-based authorization middleware on backend routes, with explicit checks for job ownership and resource access.
  - Validation and sanitization of all inputs on both frontend and backend.
  - Safe file upload handling with strict type/size limits and controlled download endpoints.
  - Deactivation of users and verification workflows for recruiters/companies to prevent abuse.
