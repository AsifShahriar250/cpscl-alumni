# CPSCL Alumni Platform — System Architecture

## 1. Purpose

This document defines the technical architecture of the CPSCL Alumni Platform.

The platform will be developed as a secure, maintainable, production-ready modular monolith.

The architecture is designed to support:

* Alumni registration
* Alumni verification
* Alumni profiles
* Alumni directory
* Batch management
* Events
* Memories and gallery
* Alumni stories
* News and announcements
* Achievements
* Community initiatives
* Jobs and career opportunities
* Mentorship
* Notifications
* Administration
* Audit logging
* Optional donations and payments
* Future horizontal scaling

---

# 2. Architecture Style

The initial system will use a **modular monolith architecture**.

The application will have clearly separated modules while remaining deployable as a small number of services.

Primary applications:

1. Next.js frontend
2. Node.js + Express backend
3. PostgreSQL database
4. Redis
5. Object storage
6. Background worker
7. Nginx reverse proxy

The architecture should avoid premature microservices.

Microservices may be considered in the future only if actual scale, team size, operational requirements, or module independence justify the additional complexity.

---

# 3. High-Level Architecture

```text
                         Internet
                            |
                            v
                    +----------------+
                    |     Nginx      |
                    | Reverse Proxy  |
                    +-------+--------+
                            |
             +--------------+--------------+
             |                             |
             v                             v
    +------------------+          +------------------+
    |    Next.js       |          |  Node + Express  |
    |    Frontend      |          |     Backend      |
    +------------------+          +--------+---------+
                                           |
                         +-----------------+------------------+
                         |                 |                  |
                         v                 v                  v
                 +---------------+  +-------------+  +---------------+
                 |  PostgreSQL   |  |    Redis    |  | Object Storage|
                 |    Prisma     |  | Cache/Queue |  | Images/Media  |
                 +---------------+  +------+------+  +---------------+
                                           |
                                           v
                                  +------------------+
                                  | Background Jobs  |
                                  | Email/Reminders  |
                                  +------------------+
```

---

# 4. Frontend Architecture

Technology:

* Next.js
* TypeScript
* Tailwind CSS

The frontend is responsible for:

* Rendering pages
* User interaction
* Form handling
* Client-side state
* API communication
* Authentication state
* Accessibility
* Responsive UI
* SEO
* Loading states
* Error states
* Empty states

The frontend must never be considered a security boundary.

Authorization must always be enforced by the backend.

---

# 5. Frontend Structure

```text
frontend/
├── app/
│   ├── (public)/
│   ├── auth/
│   ├── alumni/
│   ├── events/
│   ├── stories/
│   ├── news/
│   ├── gallery/
│   ├── achievements/
│   ├── community/
│   ├── jobs/
│   ├── mentorship/
│   ├── notifications/
│   ├── admin/
│   ├── privacy/
│   ├── terms/
│   └── contact/
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   ├── dialogs/
│   └── feedback/
│
├── features/
│   ├── auth/
│   ├── alumni/
│   ├── batches/
│   ├── events/
│   ├── stories/
│   ├── news/
│   ├── gallery/
│   ├── achievements/
│   ├── community/
│   ├── jobs/
│   ├── mentorship/
│   ├── notifications/
│   └── admin/
│
├── hooks/
├── lib/
├── services/
├── types/
├── utils/
└── public/
```

---

# 6. Backend Architecture

Technology:

* Node.js
* Express
* TypeScript
* Prisma
* PostgreSQL
* Redis

The backend is responsible for:

* Authentication
* Authorization
* Business logic
* Validation
* Database operations
* File upload authorization
* Moderation
* Event registration
* Notifications
* Background jobs
* Audit logging
* API security
* Data integrity

---

# 7. Backend Layering

The backend will follow:

```text
Route
  ↓
Middleware
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Prisma
  ↓
PostgreSQL
```

### Route

Defines the HTTP endpoint.

Example:

```text
POST /api/v1/events/:eventId/register
```

### Middleware

Responsible for cross-cutting concerns such as:

* Authentication
* Authorization
* Rate limiting
* Request ID
* Validation
* Error handling

### Controller

Responsible for:

* Reading request data
* Calling services
* Returning HTTP responses

Controllers should remain thin.

### Service

Contains business logic.

Examples:

* Alumni verification
* Event capacity handling
* Registration workflow
* Mentorship requests
* Moderation

### Repository

Responsible for database access.

Repositories should isolate Prisma/database implementation from business logic where useful.

---

# 8. Backend Structure

```text
backend/
├── src/
│   ├── config/
│   ├── constants/
│   ├── controllers/
│   ├── errors/
│   ├── integrations/
│   ├── jobs/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   ├── services/
│   ├── types/
│   ├── utils/
│   ├── validators/
│   ├── app.ts
│   └── server.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed/
│
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

---

# 9. API Architecture

The API will use versioning.

Base path:

```text
/api/v1
```

Main modules:

```text
/api/v1/auth
/api/v1/alumni
/api/v1/batches
/api/v1/events
/api/v1/stories
/api/v1/news
/api/v1/gallery
/api/v1/achievements
/api/v1/community
/api/v1/jobs
/api/v1/mentorship
/api/v1/notifications
/api/v1/admin
```

Future payment endpoints may be placed under:

```text
/api/v1/payments
/api/v1/donations
```

only when the donation/payment system is institutionally and legally approved.

---

# 10. Authentication Architecture

Authentication will be implemented on the backend.

Required capabilities:

* Registration
* Email verification
* Login
* Logout
* Forgot password
* Password reset
* Password change
* Session/token management
* Account settings

Passwords must never be stored in plaintext.

Passwords will be hashed using a modern password hashing algorithm.

Authentication secrets must be stored in environment variables or an appropriate secret-management system.

---

# 11. Authorization Architecture

The system will use RBAC.

Initial roles:

```text
SUPER_ADMIN
ADMIN
MODERATOR
EVENT_MANAGER
CONTENT_MANAGER
ALUMNI
```

Future roles may include:

```text
MENTOR
STUDENT
VOLUNTEER
```

Authorization must be checked on the backend.

Example:

```text
Authenticated user
        ↓
Role check
        ↓
Permission check
        ↓
Resource ownership check
        ↓
Business rule
        ↓
Operation
```

Frontend-only authorization is not acceptable.

---

# 12. Alumni Registration Architecture

Registration will use a controlled workflow.

```text
DRAFT
  ↓
EMAIL_UNVERIFIED
  ↓
PENDING_VERIFICATION
  ↓
ADMIN_REVIEW
  ↓
APPROVED
```

Alternative states:

```text
REJECTED
CORRECTION_REQUIRED
SUSPENDED
```

Registration sections:

```text
Personal
   ↓
Academic
   ↓
Professional
   ↓
Social
   ↓
Privacy
   ↓
Review
   ↓
Submit
```

The final submission must be validated by the backend.

---

# 13. Verification Architecture

Verification is an administrative workflow.

```text
Alumni submits registration
          ↓
Email verification
          ↓
Pending verification
          ↓
Admin review
          ↓
+-----------------------+
|                       |
v                       v
APPROVED          CORRECTION_REQUIRED
|                       |
v                       v
VERIFIED             Resubmit
```

Administrators may:

* Review profile
* Verify academic information
* Request correction
* Approve
* Reject
* Suspend
* Add internal notes
* Review verification history

Internal admin notes must never be returned to normal alumni users.

---

# 14. Directory Architecture

The alumni directory will use PostgreSQL search and indexed queries initially.

Search/filter fields may include:

* Name
* Batch
* Graduation year
* Profession
* Industry
* Organization
* City
* Country
* Skills

The directory must respect privacy settings.

Sensitive/private profile information must not appear in public search results.

Pagination is mandatory.

Large unbounded database queries must not be allowed.

---

# 15. Event Architecture

Events will use a registration workflow.

Event states:

```text
DRAFT
PUBLISHED
REGISTRATION_OPEN
REGISTRATION_CLOSED
COMPLETED
CANCELLED
```

Event registration must:

* Prevent duplicate registration
* Respect capacity
* Handle cancellation
* Record registration time
* Support attendance
* Support reminders
* Support event gallery

Capacity-related operations must use database transactions and appropriate constraints/locking strategies to prevent race conditions.

---

# 16. Content Architecture

Content modules include:

* Stories
* News
* Achievements
* Community
* Gallery

Content will use moderation workflows where appropriate.

Typical workflow:

```text
DRAFT
  ↓
SUBMITTED
  ↓
UNDER_REVIEW
  ↓
APPROVED
  ↓
PUBLISHED
```

Possible alternatives:

```text
REJECTED
CORRECTION_REQUIRED
HIDDEN
ARCHIVED
```

---

# 17. Gallery Architecture

Images and videos will not be stored directly inside PostgreSQL.

PostgreSQL stores metadata.

Object storage stores actual media.

```text
User
 ↓
Upload
 ↓
Validation
 ↓
Object Storage
 ↓
Moderation
 ↓
Published Gallery
```

Upload security must include:

* File size limits
* Extension validation
* MIME validation
* Server-side content validation where appropriate
* Authorization
* Safe filenames/keys
* Storage permissions
* Malware/security scanning where appropriate

Client-provided MIME information must not be trusted by itself.

---

# 18. Background Job Architecture

Background jobs will be used for operations that do not need to block the HTTP request.

Examples:

* Verification emails
* Password reset emails
* Event reminders
* Notification delivery
* Image processing
* Scheduled content tasks
* Cleanup jobs

Redis may be used as the queue backend.

Jobs should be:

* Retryable
* Observable
* Idempotent where appropriate

Critical business operations must not depend solely on an asynchronous job completing successfully.

---

# 19. Redis Architecture

Redis may be used for:

* Rate limiting
* Caching
* Temporary state
* Background job queues
* Notification processing
* Event reminders
* Short-lived verification/reset state where appropriate

Redis must not become the primary source of truth for permanent business data.

PostgreSQL remains the primary source of truth.

---

# 20. Database Architecture

Primary database:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

Database responsibilities:

* Permanent business data
* Relationships
* Constraints
* Transactions
* Indexes
* Data integrity

Important operations must use database transactions.

---

# 21. Database Integrity

The database will use:

* Primary keys
* Foreign keys
* Unique constraints
* Check constraints where appropriate
* Not-null constraints
* Indexes
* Transactions

Application validation alone is insufficient.

Critical uniqueness rules must also be enforced at database level.

---

# 22. Object Storage

Object storage will be used for:

* Profile images
* Event covers
* Gallery images
* Gallery videos
* Story covers
* News images
* Achievement evidence where appropriate

Potential providers:

* Cloudinary
* Amazon S3
* S3-compatible storage

The storage provider must be abstracted so the application is not unnecessarily coupled to a single provider.

---

# 23. Email Architecture

Email functionality will use a provider abstraction.

Required email types:

```text
Email verification
Password reset
Approval
Rejection
Correction required
Event registration
Event reminder
Mentorship notification
Important announcements
```

Email delivery should normally occur through background jobs.

Provider credentials must come from environment variables.

No fake email-success implementation will be accepted as production functionality.

---

# 24. Notification Architecture

Notifications will support:

```text
In-app notifications
Email notifications
```

Examples:

* Account verification
* Alumni approval
* Correction request
* Event registration
* Event reminder
* Story approval
* News announcements
* Mentorship request

Notification delivery should be observable and retryable where appropriate.

---

# 25. Audit Logging

Important administrative and security actions must generate audit records.

Examples:

```text
Admin login
Role changes
Alumni approval
Alumni rejection
Alumni suspension
Content moderation
Event modification
Settings modification
Payment-related actions
```

Audit record concept:

```text
Actor
Action
Resource
Resource ID
Timestamp
Metadata
Security/request metadata where appropriate
```

Secrets, passwords, tokens and unnecessary sensitive information must never be logged.

---

# 26. Privacy Architecture

Information will be classified into:

```text
PUBLIC
ALUMNI_ONLY
PRIVATE
ADMIN_ONLY
SYSTEM_ONLY
```

Privacy must be enforced by backend authorization and response shaping.

The platform should collect only information necessary for its intended functionality.

Users should have appropriate privacy controls for their profile information.

---

# 27. Security Architecture

Security controls include:

* Password hashing
* Authentication
* RBAC
* Resource authorization
* Input validation
* Rate limiting
* Secure headers
* CORS configuration
* SQL injection protection
* XSS mitigation
* CSRF protection where applicable
* Secure cookies where applicable
* Upload security
* Secret management
* Audit logging
* Dependency security checks
* Request size limits
* Error sanitization

Production error responses must not expose:

* Stack traces
* Database credentials
* SQL statements
* Secrets
* Internal filesystem paths
* Internal implementation details

---

# 28. Error Handling Architecture

The backend will use centralized error handling.

Error categories may include:

```text
ValidationError
AuthenticationError
AuthorizationError
NotFoundError
ConflictError
RateLimitError
DatabaseError
ExternalServiceError
UnexpectedError
```

API responses should use a consistent structure.

Example:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Resource not found"
  }
}
```

Internal error details may be logged securely but should not be exposed to clients.

---

# 29. Validation Architecture

Validation must occur at the API boundary.

Validation targets:

* Request body
* Query parameters
* URL parameters
* Authentication data
* Uploaded files
* Admin operations

A schema validation library such as Zod may be used.

Frontend validation improves user experience but does not replace backend validation.

---

# 30. API Response Architecture

Successful responses should follow a consistent format.

Example:

```json
{
  "success": true,
  "data": {}
}
```

List responses should include pagination information where appropriate.

Example:

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

---

# 31. API Status Codes

The API will use standard HTTP status codes.

Common examples:

```text
200 OK
201 Created
204 No Content

400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Unprocessable Entity
429 Too Many Requests

500 Internal Server Error
502 Bad Gateway
503 Service Unavailable
```

The exact code will depend on the operation and API contract.

---

# 32. Performance Architecture

Initial performance strategy:

1. Correct database design
2. Appropriate indexes
3. Pagination
4. Efficient queries
5. Avoid N+1 queries
6. Image optimization
7. Caching where useful
8. Lazy loading
9. Efficient frontend bundles
10. CDN/object storage where appropriate

No premature optimization.

Performance improvements should be based on real measurements.

---

# 33. Search Architecture

Initial search implementation:

```text
PostgreSQL
```

Search requirements will be evaluated based on real query patterns.

Elasticsearch/OpenSearch will not be added unless PostgreSQL becomes insufficient for the actual workload.

---

# 34. Testing Architecture

Testing layers:

```text
Unit Tests
    ↓
Integration Tests
    ↓
End-to-End Tests
```

Critical workflows include:

```text
Registration
Email verification
Login
Profile
Directory

Admin login
Verification
Alumni login
Event registration
```

Security tests must include:

* Unauthorized requests
* Privilege escalation
* IDOR/resource access
* Invalid tokens
* Expired tokens
* Invalid input
* Rate limits
* Malicious uploads
* Admin endpoint protection

---

# 35. Environment Architecture

The platform will support:

```text
Development
Staging
Production
```

Each environment must have separate configuration and credentials.

Example:

```text
.env
.env.example
```

Real secrets must never be committed to Git.

---

# 36. Docker Architecture

Production deployment may use:

```text
Nginx
Next.js
Node.js Backend
Worker
PostgreSQL
Redis
```

Containers should use:

* Health checks
* Environment variables
* Minimal images
* Multi-stage builds
* Non-root users where practical
* Persistent database volumes
* Appropriate restart policies

---

# 37. Nginx Architecture

Nginx will act as the external reverse proxy.

Responsibilities:

* HTTPS termination
* Reverse proxy
* Routing
* Security headers where appropriate
* Compression
* Request size limits
* Static asset handling where useful

Internal services should not be unnecessarily exposed directly to the public internet.

---

# 38. CI/CD Architecture

CI/CD will run automated checks such as:

```text
Install dependencies
      ↓
Lint
      ↓
Typecheck
      ↓
Unit tests
      ↓
Integration tests
      ↓
Build
      ↓
Security checks
      ↓
Docker build
      ↓
Staging deployment
      ↓
Smoke tests
      ↓
Production deployment
```

Production deployment should require successful required checks.

---

# 39. Health Checks

Backend should provide:

```text
GET /health
```

Optional readiness endpoint:

```text
GET /ready
```

Health responses must not expose sensitive infrastructure information.

---

# 40. Observability

The production system should provide structured logging.

Useful fields include:

```text
Request ID
HTTP method
Path
Status code
Latency
Error code
Timestamp
Job information
```

Sensitive information must not be logged.

Error monitoring may be integrated later.

---

# 41. Backup Architecture

PostgreSQL backups must be automated.

Backup strategy should include:

* Scheduled backups
* Retention policy
* Backup verification
* Restore testing

A backup is not considered reliable until restoration has been tested successfully.

Object storage backup/versioning strategy should also be considered.

---

# 42. Disaster Recovery

Recovery procedures must cover:

* Database failure
* Server failure
* Deployment failure
* Accidental deletion
* Data corruption
* Credential compromise
* File corruption

Documentation must define:

```text
Detection
Containment
Recovery
Verification
Rollback
Post-incident review
```

---

# 43. Deployment Architecture

Production deployment flow:

```text
Developer
   ↓
Git Repository
   ↓
CI
   ↓
Tests
   ↓
Docker Build
   ↓
Staging
   ↓
Smoke Tests
   ↓
Production
   ↓
Monitoring
```

Production migrations must be performed through version-controlled migration files.

Manual production database changes should be avoided.

---

# 44. Scalability Strategy

The first production version will remain a modular monolith.

Future scaling options:

```text
Horizontal backend scaling
        ↓
Load balancer
        ↓
Multiple backend instances
```

Additional scaling options:

* Redis caching
* CDN
* Database query optimization
* Read replicas
* Background workers
* Separate media storage
* Dedicated search service if required

Microservices should only be introduced when justified by actual requirements.

---

# 45. Domain Module Boundaries

The backend modules should be logically separated:

```text
Auth
Alumni
Batch
Events
Stories
News
Gallery
Achievements
Community
Jobs
Mentorship
Notifications
Admin
Audit
```

Each module should own its business logic.

Cross-module dependencies should remain explicit and controlled.

---

# 46. Data Flow Example — Alumni Registration

```text
Browser
  ↓
Next.js Form
  ↓
POST /api/v1/auth/register
  ↓
Validation Middleware
  ↓
Auth Controller
  ↓
Auth Service
  ↓
Transaction
  ↓
PostgreSQL
  ↓
Create User
  ↓
Create Alumni Profile
  ↓
Create Verification State
  ↓
Queue Verification Email
  ↓
Response
```

The email job runs asynchronously.

---

# 47. Data Flow Example — Event Registration

```text
Alumni
  ↓
Next.js
  ↓
POST /api/v1/events/:id/register
  ↓
Authentication
  ↓
Authorization
  ↓
Validation
  ↓
Event Service
  ↓
Database Transaction
  ↓
Check Event
  ↓
Check Capacity
  ↓
Check Duplicate Registration
  ↓
Create Registration
  ↓
Commit
  ↓
Queue Notification
  ↓
Response
```

Capacity and duplicate-registration checks must be race-condition safe.

---

# 48. Data Flow Example — Content Moderation

```text
Alumni
  ↓
Submit Content
  ↓
Validation
  ↓
DRAFT/SUBMITTED
  ↓
Moderator
  ↓
Review
  ↓
+-------------------------+
|                         |
v                         v
APPROVED             CORRECTION_REQUIRED
|                         |
v                         v
PUBLISHED              Resubmit
```

All important moderation actions should be auditable.

---

# 49. Architecture Principles

The project will follow these principles:

1. Security by design
2. Backend authorization
3. Database integrity
4. Explicit module boundaries
5. Small and maintainable controllers
6. Business logic inside services
7. Reusable components
8. API contract consistency
9. No fake functionality
10. No secrets in Git
11. Privacy by default
12. Accessibility
13. Responsive design
14. Observable production systems
15. Tested critical workflows
16. Version-controlled migrations
17. Documented deployment
18. Verified backups
19. Safe rollback
20. Evidence-based completion

---

# 50. Architecture Decision Summary

| Area           | Decision                           |
| -------------- | ---------------------------------- |
| Frontend       | Next.js + TypeScript               |
| UI             | Tailwind CSS                       |
| Backend        | Node.js + Express + TypeScript     |
| API            | Versioned REST                     |
| Database       | PostgreSQL                         |
| ORM            | Prisma                             |
| Cache/Queue    | Redis                              |
| Media          | Object Storage                     |
| Architecture   | Modular Monolith                   |
| Reverse Proxy  | Nginx                              |
| Containers     | Docker                             |
| CI/CD          | GitHub Actions or equivalent       |
| Testing        | Unit + Integration + E2E           |
| Search         | PostgreSQL initially               |
| Authentication | Secure backend authentication      |
| Authorization  | RBAC + resource authorization      |
| Observability  | Structured logs + error monitoring |
| Backups        | Automated PostgreSQL backups       |
| Deployment     | Development → Staging → Production |

---

# 51. Architecture Completion Criteria

This architecture document is considered complete only when:

* System boundaries are defined
* Frontend architecture is defined
* Backend architecture is defined
* Module boundaries are defined
* Database responsibilities are defined
* Authentication architecture is defined
* Authorization architecture is defined
* File storage architecture is defined
* Background jobs are defined
* Deployment architecture is defined
* Security architecture is defined
* Testing strategy is defined
* Backup and recovery strategy is defined
* Scalability strategy is defined


Implementation must follow this architecture unless a documented architecture decision changes it.
