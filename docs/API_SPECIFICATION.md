# CPSCL Alumni Platform — API Specification

## 1. Purpose

This document defines the REST API contract for the CPSCL Alumni Platform.

The API will provide secure and consistent access to:

* Authentication
* Alumni
* Batches
* Events
* Stories
* News
* Gallery
* Achievements
* Community
* Jobs
* Mentorship
* Notifications
* Administration
* Audit logs
* Optional donations and payments

Base API:

```text
/api/v1
```

---

# 2. API Principles

The API must follow:

1. RESTful resource design
2. Versioned endpoints
3. Consistent response structures
4. Centralized error handling
5. Backend validation
6. Backend authorization
7. Pagination for large collections
8. Rate limiting where appropriate
9. Explicit ownership checks
10. Secure handling of sensitive information
11. Idempotency for retryable operations where required
12. No secrets in responses
13. No internal database structures exposed directly
14. Stable API contracts
15. Documented breaking changes

---

# 3. Base URL

Development:

```text
http://localhost:4000/api/v1
```

Staging and production URLs will be configured through environment variables.

The frontend must not hardcode environment-specific URLs.

---

# 4. HTTP Methods

The API will primarily use:

```text
GET
POST
PATCH
PUT
DELETE
```

The method should match the operation.

Examples:

```text
GET     /alumni
POST    /events
PATCH   /events/:eventId
DELETE  /events/:eventId
```

---

# 5. Authentication

Protected endpoints require authentication.

Conceptually:

```text
Authorization: Bearer <access-token>
```

The exact token/cookie architecture will be finalized during authentication implementation.

Authentication credentials must:

* Expire appropriately
* Be revocable where required
* Never be logged
* Never be returned unnecessarily
* Be transmitted only over HTTPS in production

---

# 6. Authorization

Authentication answers:

```text
Who are you?
```

Authorization answers:

```text
Are you allowed to perform this action?
```

Every protected endpoint must define:

* Authentication requirement
* Required role/permission
* Ownership rules
* Resource-level authorization
* Validation requirements

---

# 7. Standard Success Response

Single resource:

```json
{
  "success": true,
  "data": {}
}
```

Collection:

```json
{
  "success": true,
  "data": []
}
```

Paginated collection:

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

# 8. Standard Error Response

Example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request"
  }
}
```

Production responses must not expose:

* Stack traces
* SQL queries
* Database credentials
* Internal filesystem paths
* Secrets
* Tokens
* Internal implementation details

---

# 9. Common Error Codes

```text
VALIDATION_ERROR
AUTHENTICATION_REQUIRED
INVALID_CREDENTIALS
ACCOUNT_NOT_VERIFIED
ACCOUNT_SUSPENDED
FORBIDDEN
RESOURCE_NOT_FOUND
RESOURCE_ALREADY_EXISTS
CONFLICT
RATE_LIMIT_EXCEEDED
INVALID_TOKEN
TOKEN_EXPIRED
EMAIL_ALREADY_EXISTS
EVENT_FULL
ALREADY_REGISTERED
REGISTRATION_CLOSED
INVALID_STATE
FILE_TOO_LARGE
UNSUPPORTED_FILE_TYPE
UPLOAD_FAILED
DATABASE_ERROR
EXTERNAL_SERVICE_ERROR
INTERNAL_SERVER_ERROR
```

---

# 10. Pagination

Collection endpoints should support:

```text
?page=1&limit=20
```

Maximum `limit` must be enforced by the backend.

Example:

```text
GET /api/v1/alumni?page=2&limit=20
```

Future high-volume endpoints may use cursor pagination.

---

# 11. Sorting

Where supported:

```text
?sortBy=createdAt&sortOrder=desc
```

The backend must whitelist sortable fields.

Clients must not be able to inject arbitrary SQL/order expressions.

---

# 12. Filtering

Filters must use explicitly supported parameters.

Example:

```text
GET /api/v1/alumni?batchId=123&professionId=5
```

Unknown or invalid filters should be rejected or safely ignored according to the endpoint contract.

---

# 13. Search

Search endpoints must use controlled query parameters.

Example:

```text
GET /api/v1/alumni?search=asif
```

Search input must be validated and safely passed to the database layer.

---

# 14. Authentication Endpoints

Base:

```text
/api/v1/auth
```

---

## 14.1 Register

```text
POST /api/v1/auth/register
```

Authentication:

```text
Public
```

Purpose:

Creates a new alumni account.

Request:

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Response:

```text
201 Created
```

Expected behavior:

1. Validate input
2. Normalize email
3. Check duplicate account
4. Hash password
5. Create user
6. Create alumni profile/state as required
7. Create email verification state
8. Queue verification email
9. Return safe account information

Never return the password or password hash.

---

# 15. Verify Email

```text
POST /api/v1/auth/verify-email
```

Authentication:

```text
Public
```

Request:

```json
{
  "token": "verification-token"
}
```

The token must:

* Expire
* Be single-use where appropriate
* Be securely handled
* Never be logged

---

# 16. Resend Verification Email

```text
POST /api/v1/auth/resend-verification
```

Authentication:

```text
Public
```

Rate limiting:

```text
Required
```

The endpoint must not allow unlimited email sending.

---

# 17. Login

```text
POST /api/v1/auth/login
```

Authentication:

```text
Public
```

Request:

```json
{
  "email": "user@example.com",
  "password": "secure-password"
}
```

Response must contain only the authentication data required by the selected auth architecture.

Rate limiting is required.

---

# 18. Logout

```text
POST /api/v1/auth/logout
```

Authentication:

```text
Required
```

Purpose:

Invalidates the current session/token as appropriate.

---

# 19. Current User

```text
GET /api/v1/auth/me
```

Authentication:

```text
Required
```

Returns the authenticated user's safe account information.

Never return:

```text
password_hash
internal security data
admin-only information
```

---

# 20. Forgot Password

```text
POST /api/v1/auth/forgot-password
```

Authentication:

```text
Public
```

Rate limiting:

```text
Required
```

The response should avoid revealing whether a specific email exists where appropriate.

---

# 21. Reset Password

```text
POST /api/v1/auth/reset-password
```

Authentication:

```text
Public with reset token
```

Request:

```json
{
  "token": "reset-token",
  "newPassword": "new-secure-password"
}
```

Reset tokens must expire and be invalidated after successful use.

---

# 22. Change Password

```text
POST /api/v1/auth/change-password
```

Authentication:

```text
Required
```

Request:

```json
{
  "currentPassword": "current-password",
  "newPassword": "new-password"
}
```

The backend must verify the current password before changing it.

---

# 23. Alumni Endpoints

Base:

```text
/api/v1/alumni
```

---

# 24. Get Alumni Directory

```text
GET /api/v1/alumni
```

Authentication:

```text
Public or Alumni-only depending on privacy policy
```

Supported filters:

```text
search
batchId
professionId
graduationYear
locationId
country
city
industry
organization
skill
page
limit
sortBy
sortOrder
```

Only privacy-approved fields may be returned.

---

# 25. Get Alumni Profile

```text
GET /api/v1/alumni/:alumniId
```

Authentication:

```text
Public/Alumni-only according to profile visibility
```

The response must be privacy-aware.

Private fields must not be returned.

---

# 26. Get My Alumni Profile

```text
GET /api/v1/alumni/me
```

Authentication:

```text
Required
```

Returns the authenticated user's alumni profile.

---

# 27. Update My Alumni Profile

```text
PATCH /api/v1/alumni/me
```

Authentication:

```text
Required
```

Ownership:

```text
Current user only
```

Fields may include:

```text
name
bio
phone
profession
location
social links
privacy settings
```

Sensitive changes may require additional verification.

---

# 28. Academic Records

Get:

```text
GET /api/v1/alumni/me/academic-records
```

Authentication:

```text
Required
```

Create:

```text
POST /api/v1/alumni/me/academic-records
```

Authentication:

```text
Required
```

Update:

```text
PATCH /api/v1/alumni/me/academic-records/:recordId
```

Authentication:

```text
Required
```

Ownership must be verified.

---

# 29. Admin Alumni Verification

Base:

```text
/api/v1/admin/alumni
```

List pending:

```text
GET /api/v1/admin/alumni/pending
```

Required permission:

```text
alumni.verify
```

Get verification details:

```text
GET /api/v1/admin/alumni/:alumniId/verification
```

Approve:

```text
POST /api/v1/admin/alumni/:alumniId/approve
```

Reject:

```text
POST /api/v1/admin/alumni/:alumniId/reject
```

Request correction:

```text
POST /api/v1/admin/alumni/:alumniId/request-correction
```

Suspend:

```text
POST /api/v1/admin/alumni/:alumniId/suspend
```

Every administrative verification action must be audited.

---

# 30. Batch Endpoints

Base:

```text
/api/v1/batches
```

List:

```text
GET /api/v1/batches
```

Get:

```text
GET /api/v1/batches/:batchId
```

Get members:

```text
GET /api/v1/batches/:batchId/members
```

Create:

```text
POST /api/v1/batches
```

Required permission:

```text
admin or batch-management permission
```

Update:

```text
PATCH /api/v1/batches/:batchId
```

Archive:

```text
POST /api/v1/batches/:batchId/archive
```

---

# 31. Event Endpoints

Base:

```text
/api/v1/events
```

Public list:

```text
GET /api/v1/events
```

Event details:

```text
GET /api/v1/events/:eventId
```

Create:

```text
POST /api/v1/events
```

Required permission:

```text
event.create
```

Update:

```text
PATCH /api/v1/events/:eventId
```

Required permission:

```text
event.update
```

Delete/archive:

```text
DELETE /api/v1/events/:eventId
```

Required permission:

```text
event.delete
```

---

# 32. Event Registration

Register:

```text
POST /api/v1/events/:eventId/register
```

Authentication:

```text
Required
```

Rules:

* Event must allow registration
* User must be eligible
* Duplicate registration must be prevented
* Capacity must be enforced transactionally
* Registration deadline must be respected

---

# 33. Event Cancellation

```text
DELETE /api/v1/events/:eventId/registration
```

Authentication:

```text
Required
```

Ownership:

```text
Current user
```

---

# 34. My Event Registrations

```text
GET /api/v1/events/my-registrations
```

Authentication:

```text
Required
```

Returns the current user's event registrations.

---

# 35. Event Participants

```text
GET /api/v1/events/:eventId/participants
```

Authentication:

```text
Required
```

Authorization:

Only authorized event managers/admins should receive the complete participant list.

Participant privacy must be respected.

---

# 36. Event Attendance

Check in:

```text
POST /api/v1/events/:eventId/attendance
```

Required permission:

```text
event attendance management
```

Attendance must verify that the registration is valid.

---

# 37. Story Endpoints

Base:

```text
/api/v1/stories
```

List published stories:

```text
GET /api/v1/stories
```

Get story:

```text
GET /api/v1/stories/:storyId
```

Create:

```text
POST /api/v1/stories
```

Authentication:

```text
Required
```

Update own draft:

```text
PATCH /api/v1/stories/:storyId
```

Ownership:

```text
Author
```

Submit:

```text
POST /api/v1/stories/:storyId/submit
```

Authentication:

```text
Required
```

---

# 38. Story Moderation

Pending stories:

```text
GET /api/v1/admin/stories/pending
```

Approve:

```text
POST /api/v1/admin/stories/:storyId/approve
```

Reject:

```text
POST /api/v1/admin/stories/:storyId/reject
```

Request correction:

```text
POST /api/v1/admin/stories/:storyId/request-correction
```

Publish:

```text
POST /api/v1/admin/stories/:storyId/publish
```

Unpublish:

```text
POST /api/v1/admin/stories/:storyId/unpublish
```

All moderation actions should be auditable.

---

# 39. News Endpoints

Base:

```text
/api/v1/news
```

List:

```text
GET /api/v1/news
```

Details:

```text
GET /api/v1/news/:slug
```

Create:

```text
POST /api/v1/news
```

Required permission:

```text
news.create
```

Update:

```text
PATCH /api/v1/news/:newsId
```

Publish:

```text
POST /api/v1/news/:newsId/publish
```

Archive:

```text
POST /api/v1/news/:newsId/archive
```

---

# 40. Gallery Endpoints

Base:

```text
/api/v1/gallery
```

List galleries:

```text
GET /api/v1/gallery
```

Get gallery:

```text
GET /api/v1/gallery/:galleryId
```

Create gallery:

```text
POST /api/v1/gallery
```

Upload media:

```text
POST /api/v1/gallery/:galleryId/items
```

Authentication:

```text
Required
```

Uploads must pass server-side validation.

---

# 41. Gallery Moderation

Pending:

```text
GET /api/v1/admin/gallery/pending
```

Approve:

```text
POST /api/v1/admin/gallery/items/:itemId/approve
```

Reject:

```text
POST /api/v1/admin/gallery/items/:itemId/reject
```

Hide:

```text
POST /api/v1/admin/gallery/items/:itemId/hide
```

Delete:

```text
DELETE /api/v1/admin/gallery/items/:itemId
```

Storage cleanup must be handled safely when media is deleted.

---

# 42. Achievement Endpoints

Base:

```text
/api/v1/achievements
```

Public list:

```text
GET /api/v1/achievements
```

Details:

```text
GET /api/v1/achievements/:achievementId
```

Submit:

```text
POST /api/v1/achievements
```

Authentication:

```text
Required
```

Update own submission:

```text
PATCH /api/v1/achievements/:achievementId
```

Submit for review:

```text
POST /api/v1/achievements/:achievementId/submit
```

---

# 43. Achievement Moderation

Pending:

```text
GET /api/v1/admin/achievements/pending
```

Approve:

```text
POST /api/v1/admin/achievements/:achievementId/approve
```

Reject:

```text
POST /api/v1/admin/achievements/:achievementId/reject
```

Publish:

```text
POST /api/v1/admin/achievements/:achievementId/publish
```

---

# 44. Community Endpoints

Base:

```text
/api/v1/community
```

List:

```text
GET /api/v1/community
```

Details:

```text
GET /api/v1/community/:projectId
```

Create:

```text
POST /api/v1/community
```

Authentication:

```text
Required
```

Moderation:

```text
GET /api/v1/admin/community/pending
POST /api/v1/admin/community/:projectId/approve
POST /api/v1/admin/community/:projectId/reject
```

Fundraising-related functionality requires appropriate approval before activation.

---

# 45. Job Endpoints

Base:

```text
/api/v1/jobs
```

List:

```text
GET /api/v1/jobs
```

Details:

```text
GET /api/v1/jobs/:jobId
```

Create:

```text
POST /api/v1/jobs
```

Authentication:

```text
Required
```

Update own job:

```text
PATCH /api/v1/jobs/:jobId
```

Submit for moderation:

```text
POST /api/v1/jobs/:jobId/submit
```

---

# 46. Job Moderation

Pending:

```text
GET /api/v1/admin/jobs/pending
```

Approve:

```text
POST /api/v1/admin/jobs/:jobId/approve
```

Reject:

```text
POST /api/v1/admin/jobs/:jobId/reject
```

Archive:

```text
POST /api/v1/admin/jobs/:jobId/archive
```

Expired jobs may be automatically marked expired by a scheduled job.

---

# 47. Job Applications

Apply:

```text
POST /api/v1/jobs/:jobId/applications
```

Authentication:

```text
Required
```

My applications:

```text
GET /api/v1/jobs/my-applications
```

Application details:

```text
GET /api/v1/jobs/:jobId/applications/:applicationId
```

Authorization must verify ownership or employer/admin permission.

---

# 48. Mentorship Endpoints

Base:

```text
/api/v1/mentorship
```

List mentors:

```text
GET /api/v1/mentorship/mentors
```

Mentor details:

```text
GET /api/v1/mentorship/mentors/:mentorId
```

Create mentor profile:

```text
POST /api/v1/mentorship/profile
```

Update mentor profile:

```text
PATCH /api/v1/mentorship/profile
```

Pause mentorship:

```text
POST /api/v1/mentorship/profile/pause
```

---

# 49. Mentorship Requests

Send request:

```text
POST /api/v1/mentorship/requests
```

Authentication:

```text
Required
```

Request:

```json
{
  "mentorProfileId": "mentor-id",
  "topic": "Backend development",
  "message": "I would like guidance..."
}
```

My requests:

```text
GET /api/v1/mentorship/requests
```

Accept:

```text
POST /api/v1/mentorship/requests/:requestId/accept
```

Reject:

```text
POST /api/v1/mentorship/requests/:requestId/reject
```

Cancel:

```text
POST /api/v1/mentorship/requests/:requestId/cancel
```

Ownership and mentor authorization must be checked.

---

# 50. Notification Endpoints

Base:

```text
/api/v1/notifications
```

List:

```text
GET /api/v1/notifications
```

Authentication:

```text
Required
```

Mark read:

```text
POST /api/v1/notifications/:notificationId/read
```

Mark all read:

```text
POST /api/v1/notifications/read-all
```

The user must only be able to access their own notifications.

---

# 51. Admin Dashboard

Endpoint:

```text
GET /api/v1/admin/dashboard
```

Required permission:

```text
admin.dashboard
```

Possible metrics:

```text
Total alumni
Verified alumni
Pending verification
Total batches
Upcoming events
Event registrations
Pending content
Jobs
Mentorship activity
System notifications
```

Dashboard metrics must be calculated from real database data.

No fake statistics are permitted.

---

# 52. Admin User Management

List:

```text
GET /api/v1/admin/users
```

Details:

```text
GET /api/v1/admin/users/:userId
```

Suspend:

```text
POST /api/v1/admin/users/:userId/suspend
```

Activate:

```text
POST /api/v1/admin/users/:userId/activate
```

Role management:

```text
GET /api/v1/admin/users/:userId/roles
POST /api/v1/admin/users/:userId/roles
DELETE /api/v1/admin/users/:userId/roles/:roleId
```

Role changes require strong authorization and must be audited.

---

# 53. Admin Audit Logs

List:

```text
GET /api/v1/admin/audit-logs
```

Authentication:

```text
Required
```

Permission:

```text
audit.read
```

Supported filters may include:

```text
actorUserId
action
resourceType
resourceId
startDate
endDate
page
limit
```

Audit logs must not be editable through normal APIs.

---

# 54. File Upload API

Uploads must be validated server-side.

Potential upload endpoints:

```text
POST /api/v1/alumni/me/profile-photo
POST /api/v1/events/:eventId/cover
POST /api/v1/gallery/:galleryId/items
POST /api/v1/stories/:storyId/cover
POST /api/v1/news/:newsId/cover
```

Security requirements:

* Authentication
* Authorization
* File size limits
* Allowed types
* Extension validation
* MIME verification
* Safe object storage key
* Storage access control
* Content validation where appropriate

The backend must never trust only the filename or client-provided MIME type.

---

# 55. Rate Limiting

Rate limiting is required for sensitive endpoints.

Examples:

```text
Login
Register
Forgot password
Reset password
Resend verification
Upload
Mentorship requests
Public submission endpoints
```

Different endpoints may use different limits.

Rate limiting may use Redis.

---

# 56. CORS

Production CORS configuration must use an explicit allowlist.

Example conceptual configuration:

```text
https://alumni.example.com
```

Wildcard origins should not be used for authenticated production APIs unless there is a documented reason.

---

# 57. Request Validation

Every endpoint must validate:

```text
Body
Query
Params
Headers where relevant
Uploaded files
```

Validation schemas should be centralized or organized by module.

Zod may be used.

---

# 58. Ownership Authorization

Examples:

An alumni may update:

```text
their own profile
their own academic records
their own stories
their own achievements
their own job submissions
their own mentorship requests
their own notifications
```

They must not modify another user's resources by changing an ID in the URL.

This protects against IDOR vulnerabilities.

---

# 59. Role Authorization Matrix

| Module          |   Alumni | Moderator | Event Manager | Content Manager |   Admin | Super Admin |
| --------------- | -------: | --------: | ------------: | --------------: | ------: | ----------: |
| Own profile     |      Yes |       Yes |           Yes |             Yes |     Yes |         Yes |
| Directory       |     Read |      Read |          Read |            Read |    Read |        Read |
| Verification    |       No |       Yes |            No |              No |     Yes |         Yes |
| Events          | Register |  Moderate |        Manage |              No |  Manage |      Manage |
| Stories         |   Submit |  Moderate |            No |          Manage |  Manage |      Manage |
| News            |     Read |  Moderate |            No |          Manage |  Manage |      Manage |
| Gallery         |   Submit |  Moderate |        Manage |          Manage |  Manage |      Manage |
| Achievements    |   Submit |  Moderate |            No |          Manage |  Manage |      Manage |
| Jobs            |   Submit |  Moderate |            No |          Manage |  Manage |      Manage |
| Mentorship      |      Use |  Moderate |            No |              No |  Manage |      Manage |
| Users           | Own only |   Limited |            No |              No |  Manage |      Manage |
| Roles           |       No |        No |            No |              No | Limited |        Full |
| Audit logs      |       No |   Limited |            No |              No |     Yes |         Yes |
| System settings |       No |        No |            No |              No | Limited |        Full |

The exact permission model will be implemented using granular permissions rather than relying only on role names.

---

# 60. API Security Requirements

Every protected endpoint must define:

```text
Authentication
Authorization
Validation
Rate limit
Ownership
Business rules
Error handling
Audit requirement
```

Security must be implemented server-side.

---

# 61. Database Query Safety

API input must never be directly concatenated into SQL.

Prisma parameterization must be used.

Dynamic:

```text
sort fields
filter fields
search fields
```

must use explicit allowlists.

---

# 62. Transactions

The API must use database transactions for critical multi-step operations.

Examples:

```text
Registration
Verification
Role changes
Event capacity
Payment webhook
Related moderation updates
```

---

# 63. Idempotency

Idempotency should be implemented for operations where retries could cause duplicate effects.

Examples:

```text
Payment webhooks
Event registration
Background notification jobs
Email jobs
```

Where appropriate, an idempotency key may be accepted:

```text
Idempotency-Key: <unique-key>
```

---

# 64. API Versioning

Current version:

```text
v1
```

Breaking changes should use a new API version.

Example:

```text
/api/v2
```

Old versions should not be silently broken.

---

# 65. OpenAPI Documentation

The API should eventually have OpenAPI documentation.

Potential endpoint:

```text
/api/docs
```

or:

```text
/api/v1/docs
```

Swagger/OpenAPI should be disabled or protected appropriately in production if it exposes sensitive internal information.

---

# 66. API Logging

The backend should log structured request information:

```text
requestId
method
path
statusCode
latency
timestamp
```

Sensitive information must not be logged.

Never log:

```text
passwords
tokens
API secrets
payment secrets
unnecessary personal data
```

---

# 67. Health Endpoint

```text
GET /health
```

Purpose:

Indicates that the application process is running.

Response:

```json
{
  "success": true,
  "data": {
    "status": "ok"
  }
}
```

No sensitive infrastructure details should be returned.

---

# 68. Readiness Endpoint

Optional:

```text
GET /ready
```

May verify required dependencies such as:

```text
PostgreSQL
Redis
```

Sensitive connection information must never be exposed.

---

# 69. API Testing Requirements

Every important endpoint must have tests.

Authentication:

```text
Register
Login
Logout
Verify email
Forgot password
Reset password
Change password
```

Alumni:

```text
Directory
Profile
Privacy
Academic records
```

Events:

```text
Create
Update
Register
Duplicate registration
Capacity
Cancellation
Attendance
```

Moderation:

```text
Approve
Reject
Correction
Publish
Unpublish
```

Security:

```text
Unauthorized access
Privilege escalation
IDOR
Invalid token
Expired token
Rate limit
Malformed input
```

---

# 70. API Completion Criteria

The API is considered production-ready only when:

* Endpoint contracts are documented
* Validation is implemented
* Authentication is implemented
* Authorization is implemented
* Ownership checks exist
* Error handling is centralized
* Rate limiting is implemented where required
* Pagination is implemented
* Database transactions are implemented where required
* Critical endpoints are tested
* Sensitive data is protected
* API documentation is synchronized with implementation
* No fake endpoints exist

---

# 71. API Development Order

Implementation should follow:

```text
1. Health
2. Auth
3. Users
4. Roles/Permissions
5. Alumni
6. Batches
7. Verification
8. Events
9. Stories
10. Gallery
11. News
12. Achievements
13. Community
14. Jobs
15. Mentorship
16. Notifications
17. Admin
18. Audit
19. Optional Payments
```

---

# 72. API Contract Rule

Whenever an API response/request changes, update all relevant:

```text
API specification
TypeScript types
Frontend services
Validation schemas
Tests
Documentation
```

The API contract and implementation must remain synchronized.

---

# 73. Final API Architecture

```text
Client
  ↓
Nginx
  ↓
Next.js
  ↓
REST API
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

Supporting systems:

```text
Redis
  ↓
Cache / Rate Limit / Queue

Object Storage
  ↓
Images / Videos / Media

Worker
  ↓
Emails / Notifications / Scheduled Jobs
```

---

# 74. Final Rule

No API endpoint should be considered complete merely because it responds successfully.

A production endpoint requires:

```text
Implementation
Validation
Authentication
Authorization
Business rules
Database integrity
Error handling
Security testing
Integration testing
Documentation
```

Only after these are verified may the endpoint be marked as implemented and tested.
