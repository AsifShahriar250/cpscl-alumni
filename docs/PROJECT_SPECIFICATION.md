# CPSCL Alumni Platform — Project Specification

## 1. Project Overview

The CPSCL Alumni Platform is a secure, production-ready alumni management and community platform for Cantonment Public School and College Lalmonirhat (CPSCL).

The platform will connect verified alumni, organize alumni information, support events and community activities, and provide controlled communication between alumni and the institution/community.

This project is inspired by the functional structure of existing alumni platforms, including RZSAA, but must have its own branding, design, content, architecture, database implementation, and codebase.

No source code, proprietary implementation, exact UI, branding, images, text, or database design will be copied from any existing platform.

---

## 2. Primary Goals

- Create a trusted CPSCL alumni community.
- Maintain verified alumni profiles.
- Provide a searchable alumni directory.
- Support alumni events and registrations.
- Support memories, stories, achievements, and community activities.
- Provide mentorship and career opportunities.
- Provide secure administration and moderation.
- Protect alumni privacy and personal information.
- Build a maintainable production-grade system.

---

## 3. Technology Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS

### Backend

- Node.js
- Express.js
- TypeScript

### Database

- PostgreSQL
- Prisma ORM

### Infrastructure

- Redis
- Docker
- Nginx
- Linux server

### Storage

Object storage such as:

- S3-compatible storage
- Cloudinary

### Testing

- Unit testing
- Integration testing
- End-to-end testing

---

## 4. Public Features

The public website may contain:

- Home
- About
- CPSCL Legacy / Our Story
- Alumni Directory
- Events
- Memories / Gallery
- Alumni Stories
- News & Announcements
- Achievements
- Community
- Career / Jobs
- Mentorship
- Give Back
- Contact
- Login
- Join Alumni

Legal/trust pages:

- Privacy Policy
- Terms of Use
- Community Guidelines
- Cookie Policy where applicable

---

## 5. Authentication

The system must support:

- Registration
- Login
- Logout
- Email verification
- Forgot password
- Password reset
- Password change
- Session/token management
- Account settings

Authentication must be implemented securely.

Passwords must never be stored in plain text.

Sensitive authentication data must never be exposed through APIs.

---

## 6. Alumni Registration

Registration should be divided into logical sections:

### Personal Information

- Name
- Date of birth where required
- Contact information where required
- Profile photo

### Academic Information

- Batch
- Admission/graduation information
- Academic records where applicable

### Professional Information

- Profession
- Organization
- Industry
- Job information
- Skills

### Social Information

- LinkedIn
- Facebook
- Other permitted social links

### Privacy

Users must control which eligible profile information is publicly visible.

### Review

Before submission, users should be able to review their information.

---

## 7. Alumni Registration Status

Supported statuses:

- DRAFT
- EMAIL_UNVERIFIED
- PENDING_VERIFICATION
- APPROVED
- REJECTED
- CORRECTION_REQUIRED
- SUSPENDED

Expected flow:

Registration
→ Email verification
→ Pending verification
→ Admin review
→ Approved / Rejected / Correction Required

Approved alumni receive a VERIFIED status/badge.

---

## 8. Alumni Verification

Admins must be able to:

- Review registrations
- Review academic information
- Request corrections
- Approve alumni
- Reject applications
- Suspend accounts
- Add internal verification notes
- View verification history

Internal admin notes must never be visible to normal alumni.

Every important verification action should be auditable.

---

## 9. Alumni Directory

Directory features:

- Search by name
- Filter by batch
- Filter by profession
- Filter by industry
- Filter by organization
- Filter by city
- Filter by country
- Filter by skills
- Filter by graduation year
- Pagination
- Sorting

Directory results must respect privacy settings.

Never expose:

- Passwords
- Authentication tokens
- Internal admin notes
- Private contact information
- Sensitive administrative information

unless explicitly authorized.

---

## 10. Batch Management

The system should support:

- Create batch
- Edit batch
- Archive batch
- List batches
- View batch members
- Batch statistics
- Batch events
- Batch memories

Batch information should be connected to alumni records.

---

## 11. Events

Event fields may include:

- Title
- Description
- Cover image
- Category
- Date
- Time
- Venue
- Location
- Online meeting information
- Capacity
- Registration deadline
- Organizer
- Status

Event statuses:

- DRAFT
- PUBLISHED
- REGISTRATION_OPEN
- REGISTRATION_CLOSED
- COMPLETED
- CANCELLED

Features:

- Event registration
- Event cancellation
- Capacity management
- Attendance
- Reminders
- Event gallery
- Participant privacy
- Admin event management

Duplicate registrations must be prevented.

Capacity handling must be concurrency-safe.

---

## 12. Memories / Gallery

The gallery may contain:

- Albums
- Photos
- Videos
- Captions
- Dates
- Batch association
- Event association

Submission workflow:

Upload
→ Pending Moderation
→ Approved
→ Published

Moderators/admins may:

- Approve
- Reject
- Hide
- Remove
- Edit metadata

Uploads must validate:

- File type
- MIME type
- Extension
- File size
- Access permissions

Client-provided MIME type must not be trusted by itself.

Media should use object storage rather than PostgreSQL binary storage.

---

## 13. Alumni Stories

Users may:

- Create story
- Save draft
- Submit story
- Receive correction request
- View status

Admins/content managers may:

- Review
- Request correction
- Approve
- Publish
- Unpublish

Story fields:

- Title
- Content
- Author
- Batch
- Cover image
- Tags
- Status
- Published date

---

## 14. News & Announcements

Content managers/admins can manage:

- News
- Announcements
- Categories
- Tags
- Images
- Slugs
- Publishing status
- Scheduled publishing

Statuses:

- DRAFT
- REVIEW
- PUBLISHED
- ARCHIVED

---

## 15. Achievements

Achievement categories may include:

- Academic
- Research
- Career
- Entrepreneurship
- Public Service
- Sports
- Arts
- Awards
- Community Service

Achievement submissions must be moderated before public publication where verification is required.

The system must avoid presenting unverified claims as institutional facts.

---

## 16. Community

Possible community features:

- Volunteering
- Educational support
- Blood donation
- Social initiatives
- Community projects
- Fundraising where legally and institutionally approved

Community submissions must have appropriate moderation and reporting mechanisms.

---

## 17. Career / Jobs

Job fields:

- Job title
- Company
- Location
- Employment type
- Remote status
- Description
- Requirements
- Application method
- Deadline
- Poster/image
- Status

Features:

- Search
- Filtering
- Job details
- Job submission
- Moderation
- Expiration

Unmoderated spam must not be publicly published.

---

## 18. Mentorship

Mentor profiles may include:

- Expertise
- Industry
- Skills
- Experience
- Availability
- Mentorship topics

Alumni should be able to:

- Discover mentors
- Send mentorship requests
- Accept/reject requests
- Manage mentorship relationships

Privacy must be respected.

---

## 19. Notifications

Support:

- In-app notifications
- Email notifications

Examples:

- Email verification
- Registration approval
- Registration rejection
- Correction request
- Password reset
- Event registration
- Event reminder
- Story status
- Announcements
- Mentorship request

Non-critical email and notification processing should use background jobs.

---

## 20. Administration

Admin dashboard modules:

- Dashboard
- Alumni
- Verification
- Users
- Roles
- Batches
- Events
- Stories
- News
- Gallery
- Achievements
- Community
- Jobs
- Mentorship
- Notifications
- Reports
- Audit Logs
- Settings

---

## 21. Roles

Initial roles:

- SUPER_ADMIN
- ADMIN
- MODERATOR
- EVENT_MANAGER
- CONTENT_MANAGER
- ALUMNI

Possible future roles:

- MENTOR
- STUDENT
- VOLUNTEER

Authorization must be enforced by the backend.

Hiding frontend UI elements is not considered security.

---

## 22. Database

Primary database:

PostgreSQL

ORM:

Prisma

Core entities:

- users
- roles
- permissions
- user_roles
- alumni_profiles
- academic_records
- batches
- professions
- locations
- events
- event_registrations
- event_attendance
- stories
- news
- achievements
- galleries
- gallery_items
- notifications
- audit_logs

Future/optional:

- jobs
- job_applications
- mentorship_profiles
- mentorship_requests
- donation_campaigns
- donations
- payments
- receipts

Database requirements:

- Foreign keys
- Unique constraints
- Appropriate indexes
- Timestamps
- Transactions
- Data integrity
- Safe cascades
- Soft deletion where appropriate

---

## 23. API

Use versioned REST APIs:

/api/v1/auth
/api/v1/alumni
/api/v1/batches
/api/v1/events
/api/v1/stories
/api/v1/news
/api/v1/gallery
/api/v1/achievements
/api/v1/jobs
/api/v1/mentorship
/api/v1/notifications
/api/v1/admin

API requirements:

- Consistent response format
- Consistent error format
- Validation
- Pagination
- Filtering
- Sorting
- Authentication
- Authorization
- Appropriate HTTP status codes

OpenAPI/Swagger should be added where practical.

---

## 24. Backend Architecture

Use:

Route
→ Controller
→ Service
→ Repository
→ Database

Suggested structure:

backend/src/

- config/
- controllers/
- routes/
- services/
- repositories/
- middleware/
- validators/
- utils/
- types/
- jobs/
- integrations/
- errors/
- constants/
- app.ts
- server.ts

Prisma schema and migrations should remain under:

backend/prisma/

---

## 25. Security

The platform must include:

- Secure password hashing
- Authentication protection
- Authorization/RBAC
- Rate limiting
- Secure headers
- CORS configuration
- Input validation
- SQL injection protection
- XSS mitigation
- CSRF protection where applicable
- Secure cookies where applicable
- Upload security
- Secret management
- Audit logging
- Dependency security checks

Never commit real secrets.

Production errors must not expose:

- Stack traces
- Database details
- Secrets
- Tokens
- Internal implementation details

---

## 26. Redis

Redis may be used for:

- Rate limiting
- Caching
- Background job queues
- Temporary verification state
- Notification processing
- Event reminders

Redis should only be introduced where it provides a clear benefit.

---

## 27. Background Jobs

Background processing may handle:

- Emails
- Event reminders
- Notifications
- Image processing
- Cleanup tasks
- Scheduled tasks

Jobs should be:

- Retryable
- Observable
- Idempotent where appropriate

---

## 28. Storage

Use object storage for:

- Profile photos
- Gallery images
- Videos
- Story cover images
- News images
- Job posters

Storage implementation must support:

- Upload
- Delete
- Replacement
- Access control
- Metadata
- File size limits
- Image optimization

---

## 29. Donations

Donation/payment functionality must only be enabled after appropriate institutional and legal approval.

Expected architecture:

Campaign
→ Donation
→ Payment
→ Payment Provider
→ Webhook
→ Server-side verification
→ Receipt
→ Reporting

Frontend payment success must never be trusted without server-side verification.

---

## 30. Audit Logging

Important actions should create audit records containing appropriate:

- Actor
- Action
- Resource
- Resource ID
- Timestamp
- Metadata

Do not log:

- Passwords
- Authentication tokens
- API secrets
- Payment secrets
- Unnecessary sensitive information

---

## 31. Frontend

Use:

Next.js
TypeScript
Tailwind CSS

Suggested structure:

frontend/

- app/
- components/
- features/
- hooks/
- lib/
- services/
- types/
- utils/
- public/

Use reusable components and feature-based organization.

---

## 32. UI / UX

The CPSCL platform must have an original design system.

The design should be:

- Professional
- Trustworthy
- Institutional
- Modern
- Welcoming
- Accessible

Define:

- Typography
- Colors
- Spacing
- Buttons
- Forms
- Cards
- Tables
- Modals
- Navigation
- Alerts
- Badges

Do not copy the visual design of RZSAA.

Every major page must handle:

- Loading
- Empty
- Error
- Success

---

## 33. Responsive Design

Support:

- Desktop
- Laptop
- Tablet
- Mobile

Mobile usability is a first-class requirement.

---

## 34. Accessibility

Use:

- Semantic HTML
- Keyboard navigation
- Visible focus states
- Proper labels
- Alternative text
- Accessible contrast
- Accessible dialogs
- Screen-reader-friendly navigation

---

## 35. SEO

Public pages should support:

- Page titles
- Meta descriptions
- Open Graph metadata
- Canonical URLs
- Sitemap
- Robots configuration
- Structured data where appropriate
- Clean URLs

Admin/private pages should not be indexed.

---

## 36. Testing

Required testing layers:

### Unit

Test isolated services/utilities.

### Integration

Test API/database interactions.

### E2E

Test critical user workflows.

Critical workflows include:

Registration
→ Email verification
→ Login
→ Profile
→ Directory

Admin login
→ Verification
→ Alumni login
→ Event registration

Also test:

- Authorization
- Invalid input
- Duplicate registration
- Password reset
- Upload validation
- Moderation
- Notifications
- Event capacity
- Payment webhook if implemented

---

## 37. Environments

Maintain:

- Development
- Staging
- Production

Use:

`.env.example`

Never commit real credentials.

---

## 38. Docker

Production infrastructure may include:

- Frontend
- Backend
- PostgreSQL
- Redis
- Nginx

Use:

- Multi-stage builds
- Health checks
- Environment variables
- Persistent database volumes
- Non-root containers where practical
- Minimal production images

---

## 39. CI/CD

CI/CD should perform:

- Install dependencies
- Lint
- Typecheck
- Unit tests
- Integration tests
- Build
- Security checks
- Docker build
- Staging deployment
- Smoke tests

Production deployment should happen only after required checks pass.

---

## 40. Production

Production deployment documentation must cover:

- Linux server
- Docker
- Environment variables
- PostgreSQL
- Redis
- Object storage
- Email provider
- Domain/DNS
- HTTPS
- Nginx
- Firewall
- Containers
- Monitoring
- Backups
- Migrations
- Rollback

---

## 41. Health & Observability

Backend should expose:

/health

Optionally:

/ready

Use structured logs with appropriate:

- Request ID
- HTTP method
- Path
- Status
- Latency
- Error information

Never log secrets or unnecessary sensitive information.

---

## 42. Backup & Disaster Recovery

PostgreSQL backups must be:

- Automated
- Retained according to policy
- Monitored
- Periodically restored/tested

Disaster recovery must cover:

- Database failure
- Server failure
- Accidental deletion
- Deployment failure
- File corruption
- Credential compromise
- Rollback

A backup is not considered reliable until restore testing has succeeded.

---

## 43. Privacy

Data should be classified as:

- PUBLIC
- ALUMNI_ONLY
- PRIVATE
- ADMIN_ONLY
- SYSTEM_ONLY

Collect only information that is necessary.

Privacy must be the default.

---

## 44. Development Architecture

Version 1 will use a modular monolith.

Primary architecture:

Next.js
+
Node.js/Express
+
PostgreSQL
+
Redis
+
Object Storage

Do not introduce microservices unless there is a demonstrated requirement.

---

## 45. Development Order

1. Requirements and architecture
2. Repository setup
3. Database and Prisma
4. Authentication
5. RBAC
6. Alumni registration
7. Verification
8. Alumni profiles
9. Directory/search
10. Events
11. Gallery
12. Stories
13. News
14. Achievements
15. Community
16. Jobs
17. Mentorship
18. Notifications
19. Admin
20. Audit logs
21. Payments if approved
22. Security hardening
23. Testing
24. Performance
25. Docker
26. CI/CD
27. Staging
28. Production
29. Monitoring
30. Backup/Disaster Recovery
31. Final production audit

---

## 46. Documentation

Maintain:

- PROJECT_SPECIFICATION.md
- ARCHITECTURE.md
- DATABASE_DESIGN.md
- API_SPECIFICATION.md
- SECURITY.md
- DEPLOYMENT.md
- PROJECT_STATUS.md
- CHANGELOG.md
- ADMIN_GUIDE.md
- DEVELOPER_GUIDE.md
- BACKUP_RESTORE.md
- TROUBLESHOOTING.md
- FINAL_PRODUCTION_REPORT.md

---

## 47. Project Status Rules

Each feature must have one of:

- PLANNED
- IN_PROGRESS
- IMPLEMENTED
- TESTED
- VERIFIED
- BLOCKED

A feature must not be marked VERIFIED without evidence.

Blocked tasks must clearly state:

- What is blocked
- Why it is blocked
- What external/manual action is required

Never fake functionality or verification.

---

## 48. Definition of Done

A feature is considered complete only when:

- Implementation exists
- Validation exists
- Authorization is correct
- Database constraints are correct
- Error handling exists
- Tests exist where applicable
- Frontend states are handled
- Security considerations are addressed
- Documentation is updated
- Build succeeds
- Typecheck succeeds
- Lint succeeds
- Relevant tests pass

---

## 49. Final Production Requirement

The final CPSCL Alumni Platform must be:

- Secure
- Maintainable
- Original
- Tested
- Accessible
- Responsive
- Observable
- Backed up
- Recoverable
- Documented
- Production-ready

The project must never be treated as complete merely because the UI works.

Real authentication, database operations, authorization, emails, uploads, event registration, moderation, payments, and deployment must be genuinely implemented and verified before being marked complete.
