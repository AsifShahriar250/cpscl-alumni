# CPSCL Alumni Platform — Database Design

## 1. Purpose

This document defines the database architecture for the CPSCL Alumni Platform.

The database must provide:

* Strong data integrity
* Secure relationships
* Efficient queries
* Privacy-aware data access
* Reliable transactions
* Scalable indexing
* Auditable administrative actions
* Maintainable migrations
* Production-ready backup and recovery

Primary database:

```text
PostgreSQL
```

ORM:

```text
Prisma
```

---

# 2. Database Design Principles

The database will follow these principles:

1. PostgreSQL is the primary source of truth.
2. Business-critical data must be stored persistently.
3. Foreign keys must enforce relationships.
4. Important uniqueness rules must be enforced by database constraints.
5. Transactions must be used for multi-step critical operations.
6. Indexes must be based on actual query patterns.
7. Sensitive data must not be unnecessarily duplicated.
8. Passwords must never be stored in plaintext.
9. Tokens should not be stored in plaintext where avoidable.
10. Internal administrative information must remain protected.
11. Soft deletion will be used only where it provides a clear business benefit.
12. Permanent deletion must be carefully controlled.
13. Database migrations must be version controlled.
14. Production schema changes must use migrations.
15. PostgreSQL should remain the source of truth even when Redis is used.

---

# 3. Core Entity Overview

The initial database will contain these major entities:

```text
users
roles
permissions
user_roles

alumni_profiles
academic_records

batches
professions
locations

events
event_registrations
event_attendance

stories
news

galleries
gallery_items

achievements
community_projects

jobs
job_applications

mentorship_profiles
mentorship_requests

notifications

audit_logs
```

Optional/future modules:

```text
donation_campaigns
donations
payments
payment_webhooks
receipts
```

---

# 4. Entity Relationship Overview

High-level relationships:

```text
Users
 |
 +---- User Roles
 |
 +---- Alumni Profile
          |
          +---- Academic Records
          |
          +---- Batch
          |
          +---- Profession
          |
          +---- Location
          |
          +---- Stories
          |
          +---- Achievements
          |
          +---- Gallery Submissions
          |
          +---- Event Registrations
          |
          +---- Mentorship Profile
          |
          +---- Notifications

Batches
 |
 +---- Alumni
 |
 +---- Events
 |
 +---- Stories
 |
 +---- Gallery Items

Events
 |
 +---- Registrations
 |
 +---- Attendance
 |
 +---- Gallery

Stories
 |
 +---- Author
 |
 +---- Batch

News
 |
 +---- Author/Publisher

Gallery
 |
 +---- Gallery Items

Jobs
 |
 +---- Applications

Mentorship Profile
 |
 +---- Mentorship Requests

Users
 |
 +---- Audit Logs
```

---

# 5. Users Table

Table:

```text
users
```

Purpose:

Stores authentication and account-level information.

Suggested fields:

```text
id
email
password_hash
status
email_verified_at
last_login_at
created_at
updated_at
deleted_at
```

Possible account statuses:

```text
ACTIVE
INACTIVE
SUSPENDED
PENDING
```

Rules:

* Email must be unique.
* Email comparison should be normalized.
* Password hash must never be exposed through API responses.
* `password_hash` must never be returned to the frontend.
* Deleted accounts must follow documented retention rules.
* Authentication data must remain separate from public alumni profile data.

---

# 6. Roles Table

Table:

```text
roles
```

Purpose:

Stores application roles.

Initial roles:

```text
SUPER_ADMIN
ADMIN
MODERATOR
EVENT_MANAGER
CONTENT_MANAGER
ALUMNI
```

Future roles:

```text
MENTOR
STUDENT
VOLUNTEER
```

Suggested fields:

```text
id
name
description
created_at
updated_at
```

Role names must be unique.

---

# 7. Permissions Table

Table:

```text
permissions
```

Purpose:

Provides granular authorization capabilities.

Examples:

```text
alumni.read
alumni.verify
alumni.suspend
alumni.update

event.create
event.update
event.delete
event.manage_registration

story.review
story.publish

news.create
news.publish

gallery.review

achievement.review

job.review

mentorship.manage

admin.users
admin.roles
admin.settings
audit.read
```

Suggested fields:

```text
id
name
description
created_at
updated_at
```

Permission names must be unique.

---

# 8. User Roles Table

Table:

```text
user_roles
```

Purpose:

Many-to-many relationship between users and roles.

Suggested fields:

```text
id
user_id
role_id
created_at
```

Constraints:

```text
UNIQUE(user_id, role_id)
```

Foreign keys:

```text
user_id → users.id
role_id → roles.id
```

---

# 9. Alumni Profiles Table

Table:

```text
alumni_profiles
```

Purpose:

Stores alumni-specific information.

Suggested fields:

```text
id
user_id
first_name
last_name
display_name
profile_photo_url
date_of_birth
gender
phone
bio

batch_id
profession_id
location_id

graduation_year

verification_status
verified_at
verified_by

privacy_settings

created_at
updated_at
deleted_at
```

Important:

Not every personal field should be publicly visible.

Privacy settings must control which information is exposed.

---

# 10. Alumni Verification Status

The alumni profile may use:

```text
DRAFT
EMAIL_UNVERIFIED
PENDING_VERIFICATION
APPROVED
REJECTED
CORRECTION_REQUIRED
SUSPENDED
```

The exact implementation may separate account status from alumni verification status.

This is preferable because:

```text
Account status
```

and:

```text
Alumni verification status
```

represent different concepts.

---

# 11. Academic Records Table

Table:

```text
academic_records
```

Purpose:

Stores academic information associated with an alumni profile.

Suggested fields:

```text
id
alumni_profile_id
institution_name
program
group_or_department
admission_year
graduation_year
roll_number
registration_number
additional_information
verification_status
created_at
updated_at
```

Potential academic verification status:

```text
UNVERIFIED
PENDING
VERIFIED
REJECTED
```

Sensitive academic identifiers should not be publicly displayed unless explicitly allowed.

---

# 12. Batches Table

Table:

```text
batches
```

Purpose:

Represents alumni batches/cohorts.

Suggested fields:

```text
id
name
graduation_year
description
cover_image_url
status
created_at
updated_at
deleted_at
```

Possible status:

```text
ACTIVE
ARCHIVED
```

Potential uniqueness:

```text
UNIQUE(name)
```

Additional uniqueness constraints should be decided based on actual CPSCL batch policy.

---

# 13. Professions Table

Table:

```text
professions
```

Purpose:

Stores normalized profession categories.

Suggested fields:

```text
id
name
slug
description
created_at
updated_at
```

Examples:

```text
Software Engineer
Doctor
Teacher
Researcher
Business Owner
Government Service
Student
Lawyer
Engineer
Consultant
```

The actual list should be managed by authorized administrators.

---

# 14. Locations Table

Table:

```text
locations
```

Purpose:

Stores normalized geographic information.

Suggested fields:

```text
id
country
state_or_division
city
area
created_at
updated_at
```

Privacy rules must determine whether exact location information is publicly exposed.

Exact residential addresses should not be required for the alumni directory unless there is a documented institutional requirement.

---

# 15. Events Table

Table:

```text
events
```

Purpose:

Stores alumni events.

Suggested fields:

```text
id
title
slug
description
cover_image_url

category

start_at
end_at

venue_name
venue_address

is_online
online_meeting_url

capacity
registration_deadline

status

created_by
updated_by

created_at
updated_at
deleted_at
```

Statuses:

```text
DRAFT
PUBLISHED
REGISTRATION_OPEN
REGISTRATION_CLOSED
COMPLETED
CANCELLED
```

Meeting credentials must never be exposed publicly.

---

# 16. Event Registrations Table

Table:

```text
event_registrations
```

Purpose:

Stores alumni registrations for events.

Suggested fields:

```text
id
event_id
user_id
status
registered_at
cancelled_at
created_at
updated_at
```

Possible status:

```text
REGISTERED
CANCELLED
WAITLISTED
ATTENDED
```

Critical constraint:

```text
UNIQUE(event_id, user_id)
```

This prevents duplicate registration.

---

# 17. Event Capacity Integrity

Event registration must be transaction-safe.

The system must prevent:

```text
capacity = 100
```

from becoming:

```text
101 registered users
```

because of simultaneous requests.

The implementation must use appropriate PostgreSQL transactions and concurrency-safe logic.

---

# 18. Event Attendance Table

Table:

```text
event_attendance
```

Purpose:

Records attendance.

Suggested fields:

```text
id
event_registration_id
checked_in_at
checked_in_by
method
notes
created_at
```

Possible methods:

```text
MANUAL
QR
ADMIN
```

Attendance data must be accessible only to authorized users.

---

# 19. Stories Table

Table:

```text
stories
```

Purpose:

Stores alumni stories.

Suggested fields:

```text
id
author_user_id
batch_id

title
slug
content
cover_image_url

status

submitted_at
published_at

reviewed_by
reviewed_at

created_at
updated_at
deleted_at
```

Statuses:

```text
DRAFT
SUBMITTED
UNDER_REVIEW
APPROVED
CORRECTION_REQUIRED
REJECTED
PUBLISHED
UNPUBLISHED
ARCHIVED
```

---

# 20. News Table

Table:

```text
news
```

Purpose:

Stores official news and announcements.

Suggested fields:

```text
id
title
slug
summary
content
cover_image_url

category
status

author_user_id
published_by

scheduled_at
published_at

created_at
updated_at
deleted_at
```

Statuses:

```text
DRAFT
REVIEW
PUBLISHED
ARCHIVED
```

Slug must be unique among active records.

---

# 21. Galleries Table

Table:

```text
galleries
```

Purpose:

Represents albums.

Suggested fields:

```text
id
title
slug
description
cover_image_url

batch_id
event_id

status

created_by
created_at
updated_at
deleted_at
```

Possible status:

```text
DRAFT
PUBLISHED
HIDDEN
ARCHIVED
```

---

# 22. Gallery Items Table

Table:

```text
gallery_items
```

Purpose:

Stores metadata for individual images/videos.

Suggested fields:

```text
id
gallery_id
uploaded_by

media_type
storage_key
public_url

original_filename
mime_type
file_size

width
height
duration

caption
sort_order

moderation_status
reviewed_by
reviewed_at

created_at
updated_at
deleted_at
```

Possible media types:

```text
IMAGE
VIDEO
```

Moderation states:

```text
PENDING
APPROVED
REJECTED
HIDDEN
```

Actual media files should live in object storage.

PostgreSQL stores metadata and references.

---

# 23. Achievements Table

Table:

```text
achievements
```

Purpose:

Stores alumni achievements.

Suggested fields:

```text
id
submitted_by
title
description
category

evidence_url

status
reviewed_by
reviewed_at
published_at

created_at
updated_at
deleted_at
```

Categories may include:

```text
ACADEMIC
RESEARCH
CAREER
ENTREPRENEURSHIP
PUBLIC_SERVICE
SPORTS
ARTS
AWARD
COMMUNITY_SERVICE
```

Public claims should be moderated and, where appropriate, supported by evidence.

---

# 24. Community Projects Table

Table:

```text
community_projects
```

Purpose:

Stores alumni/community initiatives.

Suggested fields:

```text
id
title
slug
description
cover_image_url

category

organizer_user_id

start_at
end_at

location

status

created_at
updated_at
deleted_at
```

Possible categories:

```text
VOLUNTEERING
EDUCATIONAL_SUPPORT
BLOOD_DONATION
SOCIAL_INITIATIVE
COMMUNITY_PROJECT
FUNDRAISING
```

Fundraising functionality must only be enabled after appropriate institutional and legal approval.

---

# 25. Jobs Table

Table:

```text
jobs
```

Purpose:

Stores moderated job opportunities.

Suggested fields:

```text
id
posted_by
company_name
title

description
requirements

location
employment_type
work_mode

salary_min
salary_max
currency

application_url
application_email

deadline

status

created_at
updated_at
published_at
deleted_at
```

Employment types:

```text
FULL_TIME
PART_TIME
CONTRACT
INTERNSHIP
FREELANCE
```

Work modes:

```text
ONSITE
REMOTE
HYBRID
```

Possible status:

```text
DRAFT
PENDING_REVIEW
PUBLISHED
EXPIRED
REJECTED
ARCHIVED
```

---

# 26. Job Applications Table

Table:

```text
job_applications
```

Purpose:

Stores applications where the platform directly supports applications.

Suggested fields:

```text
id
job_id
applicant_user_id

resume_url
cover_letter

status

created_at
updated_at
```

Possible status:

```text
SUBMITTED
REVIEWING
SHORTLISTED
REJECTED
WITHDRAWN
```

If applications occur on an external company website, only the external application URL needs to be stored.

---

# 27. Mentorship Profiles Table

Table:

```text
mentorship_profiles
```

Purpose:

Stores mentor-specific information.

Suggested fields:

```text
id
user_id

headline
bio

industry
expertise
skills

experience_years

availability
preferred_topics

is_available

status

created_at
updated_at
```

Possible status:

```text
ACTIVE
PAUSED
INACTIVE
```

Mentor privacy must be respected.

---

# 28. Mentorship Requests Table

Table:

```text
mentorship_requests
```

Purpose:

Stores mentorship relationship requests.

Suggested fields:

```text
id
mentor_profile_id
requester_user_id

message
topic

status

responded_at

created_at
updated_at
```

Possible statuses:

```text
PENDING
ACCEPTED
REJECTED
CANCELLED
COMPLETED
```

A suitable uniqueness rule should prevent duplicate active requests between the same users for the same mentorship context.

---

# 29. Notifications Table

Table:

```text
notifications
```

Purpose:

Stores in-app notifications.

Suggested fields:

```text
id
user_id

type
title
message

data

read_at

created_at
```

Possible notification types:

```text
EMAIL_VERIFICATION
PASSWORD_RESET
ALUMNI_APPROVED
ALUMNI_REJECTED
CORRECTION_REQUIRED

EVENT_REGISTERED
EVENT_REMINDER
EVENT_CANCELLED

STORY_APPROVED
STORY_REJECTED

MENTORSHIP_REQUEST
MENTORSHIP_ACCEPTED

SYSTEM_ANNOUNCEMENT
```

The `data` field may use PostgreSQL JSONB for structured notification metadata.

Secrets must never be stored in notification data.

---

# 30. Audit Logs Table

Table:

```text
audit_logs
```

Purpose:

Records important administrative and security events.

Suggested fields:

```text
id

actor_user_id

action
resource_type
resource_id

metadata

ip_address
user_agent

created_at
```

Examples:

```text
USER_CREATED
USER_ROLE_CHANGED
ALUMNI_APPROVED
ALUMNI_REJECTED
ALUMNI_SUSPENDED

EVENT_CREATED
EVENT_UPDATED
EVENT_CANCELLED

STORY_APPROVED
STORY_REJECTED

GALLERY_APPROVED

JOB_APPROVED

SETTINGS_CHANGED
```

Do not store:

* Passwords
* Access tokens
* Refresh tokens
* API secrets
* Payment secrets
* Unnecessary sensitive information

---

# 31. Authentication Token Storage

Authentication implementation must be designed separately from normal business entities.

Temporary authentication data may include:

```text
Email verification
Password reset
Session information
Refresh-token state
```

Depending on the selected authentication architecture, short-lived state may be stored in Redis or a secure database structure.

Tokens must:

* Have expiration
* Be revocable where required
* Be scoped appropriately
* Never appear in normal API responses unnecessarily
* Never be logged

---

# 32. Privacy Settings

Privacy settings may be represented using structured JSON or normalized tables depending on complexity.

Example conceptual settings:

```text
profile_visibility
show_email
show_phone
show_location
show_profession
show_organization
show_social_links
directory_visibility
```

Possible visibility:

```text
PUBLIC
ALUMNI_ONLY
PRIVATE
```

The final implementation must ensure privacy settings are enforced server-side.

---

# 33. Relationships

Important relationships:

```text
users 1 ─── 1 alumni_profiles

users 1 ─── N user_roles
roles 1 ─── N user_roles

alumni_profiles 1 ─── N academic_records

batches 1 ─── N alumni_profiles
professions 1 ─── N alumni_profiles
locations 1 ─── N alumni_profiles

users 1 ─── N event_registrations
events 1 ─── N event_registrations

event_registrations 1 ─── 1 event_attendance

users 1 ─── N stories
batches 1 ─── N stories

galleries 1 ─── N gallery_items

events 1 ─── N galleries
batches 1 ─── N galleries

users 1 ─── N achievements

users 1 ─── N jobs
jobs 1 ─── N job_applications

users 1 ─── 1 mentorship_profiles
mentorship_profiles 1 ─── N mentorship_requests

users 1 ─── N notifications

users 1 ─── N audit_logs
```

---

# 34. Foreign Key Strategy

Foreign keys must be explicitly defined.

Examples:

```text
alumni_profiles.user_id
    → users.id

alumni_profiles.batch_id
    → batches.id

academic_records.alumni_profile_id
    → alumni_profiles.id

event_registrations.event_id
    → events.id

event_registrations.user_id
    → users.id

gallery_items.gallery_id
    → galleries.id

job_applications.job_id
    → jobs.id
```

Foreign key actions must be selected deliberately.

Do not use cascading deletes blindly.

---

# 35. Delete Strategy

Different entities require different deletion strategies.

Recommended:

### Users

Prefer controlled deactivation/anonymization rather than immediate physical deletion where legal/business retention requires it.

### Alumni Profiles

Use soft deletion where historical relationships must remain.

### Events

Usually soft deletion or archival.

### Stories

Soft deletion or archival.

### News

Archival is preferred over physical deletion after publication.

### Gallery Items

Soft deletion may be appropriate while the object storage lifecycle is handled separately.

### Audit Logs

Normally immutable.

Audit records should not be casually deleted.

---

# 36. Timestamp Strategy

Most tables should contain:

```text
created_at
updated_at
```

Relevant tables may also contain:

```text
published_at
deleted_at
verified_at
reviewed_at
registered_at
cancelled_at
completed_at
```

Timestamps should be stored in UTC.

Application-level formatting can convert timestamps to the user's local timezone.

---

# 37. Primary Key Strategy

Primary keys should use a consistent strategy.

The project may use:

```text
UUID
```

or PostgreSQL-supported UUID-compatible identifiers.

The final choice must be made before Prisma schema implementation.

The same strategy should be used consistently across major entities.

---

# 38. Index Strategy

Indexes should support actual query patterns.

Initial important indexes may include:

```text
users(email)

alumni_profiles(user_id)
alumni_profiles(batch_id)
alumni_profiles(profession_id)
alumni_profiles(location_id)
alumni_profiles(verification_status)
alumni_profiles(graduation_year)

batches(graduation_year)
batches(status)

events(status)
events(start_at)
events(registration_deadline)

event_registrations(event_id)
event_registrations(user_id)

stories(status)
stories(batch_id)
stories(author_user_id)
stories(published_at)

news(status)
news(published_at)
news(slug)

galleries(status)
galleries(batch_id)
galleries(event_id)

gallery_items(gallery_id)
gallery_items(moderation_status)

achievements(status)
achievements(submitted_by)

jobs(status)
jobs(deadline)

job_applications(job_id)
job_applications(applicant_user_id)

notifications(user_id)
notifications(read_at)

audit_logs(actor_user_id)
audit_logs(resource_type, resource_id)
audit_logs(created_at)
```

Indexes should be verified against query plans and real workload.

Do not create unnecessary indexes on every column.

---

# 39. Composite Indexes

Composite indexes may be added where common filters require them.

Potential examples:

```text
alumni_profiles(batch_id, verification_status)

alumni_profiles(profession_id, verification_status)

events(status, start_at)

stories(status, published_at)

news(status, published_at)

jobs(status, deadline)

notifications(user_id, read_at, created_at)
```

Final indexes should be confirmed after API/query implementation.

---

# 40. Search Strategy

Initial directory search will use PostgreSQL.

Potential searchable fields:

```text
first_name
last_name
display_name
profession
organization
city
country
skills
graduation_year
```

Depending on workload, PostgreSQL features may include:

* `ILIKE`
* Full-text search
* `tsvector`
* Trigram indexes

External search infrastructure will not be added unless actual requirements justify it.

---

# 41. Pagination Strategy

Large datasets must never be returned without limits.

Default example:

```text
page = 1
limit = 20
```

Maximum limit should be enforced by the backend.

For very large datasets, cursor-based pagination may be introduced.

---

# 42. Transaction Requirements

Transactions are required for operations such as:

### Alumni Registration

```text
Create User
Create Alumni Profile
Create related records
Create verification state
```

### Event Registration

```text
Check capacity
Check duplicate
Create registration
```

### Role Change

```text
Update role
Record audit event
```

### Verification

```text
Update verification state
Record verifier
Create notification
Record audit log
```

### Payment

If implemented:

```text
Payment state
Donation state
Webhook verification
Receipt
Audit log
```

---

# 43. Concurrency Requirements

The database design must account for concurrent requests.

Critical examples:

```text
Two users registering for the final event slot
Two admins approving the same alumni
Two admins modifying the same content
Two simultaneous role changes
Duplicate webhook delivery
```

The implementation must use appropriate:

* Unique constraints
* Transactions
* Row locking where necessary
* Idempotency
* State validation

---

# 44. Idempotency

Operations that may be retried should support idempotent behavior where appropriate.

Important examples:

```text
Payment webhooks
Background jobs
Notification delivery
Event registration requests
Email processing
```

Repeated requests must not create duplicate business records.

---

# 45. JSONB Usage

PostgreSQL JSONB may be used for flexible metadata where appropriate.

Good candidates:

```text
notification.data
audit_logs.metadata
privacy_settings
```

JSONB should not replace normalized relational tables when the data has:

* Frequent joins
* Strong relationships
* Important constraints
* Frequent filtering
* Core business meaning

---

# 46. Sensitive Data Classification

Database information should be classified as:

```text
PUBLIC
ALUMNI_ONLY
PRIVATE
ADMIN_ONLY
SYSTEM_ONLY
```

Examples:

### Public

```text
Display name
Batch
Profession
Public achievements
Approved stories
```

### Alumni-only

```text
Selected contact information
Mentorship information
```

### Private

```text
Private phone
Private email
Personal settings
```

### Admin-only

```text
Verification notes
Moderation notes
Administrative information
```

### System-only

```text
Password hashes
Authentication secrets
Internal tokens
Security metadata
```

---

# 47. Data Exposure Rules

Database models must never be returned directly from API endpoints.

The service/controller layer should construct explicit response objects.

Example:

```text
Database User
    ↓
Service
    ↓
PublicUserResponse
```

This prevents accidental exposure of:

```text
password_hash
internal_notes
security metadata
private fields
```

---

# 48. Migration Strategy

Prisma migrations will be used.

Development:

```text
Create migration
Test migration
Review schema
```

Staging:

```text
Apply migration
Run tests
Verify database
```

Production:

```text
Backup
Apply migration
Verify application
Monitor
```

Production database changes must not be made manually unless there is a documented emergency procedure.

---

# 49. Seed Data Strategy

Development seed data may include:

```text
Roles
Permissions
Development admin
Sample batches
Sample professions
Sample locations
Development events
Development content
```

Seed data must be clearly identified as development data.

Real alumni information must never be fabricated and presented as real institutional data.

Production seed scripts must be carefully controlled.

---

# 50. Database Environment Separation

Separate databases should be used for:

```text
Development
Staging
Production
```

Example conceptual configuration:

```text
DATABASE_URL=postgresql://...
```

Each environment must use separate credentials.

Production credentials must never be committed to Git.

---

# 51. Database Backup

PostgreSQL must have automated backups.

Backup requirements:

* Scheduled backups
* Retention
* Off-server storage
* Backup verification
* Restore testing

Backups must not contain publicly accessible credentials or secrets.

---

# 52. Restore Testing

A backup is not considered verified until restoration has been tested.

Restore testing should verify:

```text
Database starts
Migrations are compatible
Application connects
Critical queries work
Authentication works
Alumni data exists
Event data exists
Admin functions work
```

Restore tests should be documented.

---

# 53. Database Security

Database security requirements:

* Strong credentials
* Restricted network access
* TLS where appropriate
* Least-privilege database users
* No public database exposure
* Regular backups
* Monitoring
* Migration control
* Secret management

Application users must not receive unrestricted database access.

---

# 54. Database Connection Management

The backend should use a managed Prisma/database connection strategy.

Requirements:

* Avoid creating a new database connection per request
* Configure connection pooling appropriately
* Monitor connection usage
* Handle database outages gracefully
* Close connections during controlled shutdown

---

# 55. Data Integrity Rules

The database must enforce important invariants.

Examples:

```text
User email must be unique.

User role combination must be unique.

Event + user registration must be unique.

Required foreign keys must exist.

Published content must have required publishing metadata.

Dates must be logically valid where possible.

Capacity must not be negative.

File size must not be negative.

```

Business rules that cannot be represented easily by constraints must be enforced in services and transactions.

---

# 56. Audit Data Integrity

Audit logs should be append-oriented.

Normal application users must not be able to modify audit records.

Administrative access to audit logs must itself be auditable where appropriate.

Audit logs should preserve enough information to answer:

```text
Who?
What?
Which resource?
When?
What changed?
From where?
```

without storing unnecessary sensitive information.

---

# 57. Payment Database Design

Payments are optional and must not be implemented as production functionality until appropriate approval and provider configuration exist.

Potential entities:

```text
donation_campaigns
donations
payments
payment_webhooks
receipts
```

Conceptual relationship:

```text
Campaign
   ↓
Donation
   ↓
Payment
   ↓
Provider
   ↓
Webhook
   ↓
Verified Payment
   ↓
Receipt
```

Frontend payment success must never be treated as authoritative.

Server-side provider verification/webhooks must determine final payment status.

---

# 58. Payment Idempotency

Payment webhook processing must handle repeated delivery.

Potential strategy:

```text
provider_event_id UNIQUE
```

A webhook with the same provider event ID must not create duplicate payment effects.

Payment state transitions must be validated.

---

# 59. ERD Conceptual Diagram

```text
                         +-------------+
                         |    USERS    |
                         +------+------+
                                |
               +----------------+----------------+
               |                                 |
               v                                 v
       +---------------+                  +-------------+
       | USER_ROLES    |                  | AUDIT_LOGS  |
       +-------+-------+                  +-------------+
               |
               v
          +---------+
          |  ROLES  |
          +---------+

                                |
                                v
                      +-------------------+
                      | ALUMNI_PROFILES    |
                      +---------+---------+
                                |
          +---------------------+----------------------+
          |                     |                      |
          v                     v                      v
+------------------+    +---------------+      +-------------+
| ACADEMIC_RECORDS |    |    BATCHES    |      | LOCATIONS   |
+------------------+    +---------------+      +-------------+
                                |
                                v
                           +---------+
                           | EVENTS  |
                           +----+----+
                                |
                    +-----------+-----------+
                    |                       |
                    v                       v
          +--------------------+    +----------------+
          | EVENT_REGISTRATIONS|    |    GALLERIES   |
          +---------+----------+    +-------+--------+
                    |                       |
                    v                       v
          +------------------+      +---------------+
          | EVENT_ATTENDANCE |      | GALLERY_ITEMS |
          +------------------+      +---------------+

Users ────────────────> Stories
Users ────────────────> Achievements
Users ────────────────> Jobs ───────> Job Applications
Users ────────────────> Mentorship Profiles
Mentorship Profiles ──> Mentorship Requests
Users ────────────────> Notifications
```

---

# 60. Database Implementation Order

The Prisma implementation should follow this order:

```text
1. Users
2. Roles
3. Permissions
4. User Roles
5. Batches
6. Professions
7. Locations
8. Alumni Profiles
9. Academic Records
10. Events
11. Event Registrations
12. Event Attendance
13. Stories
14. News
15. Galleries
16. Gallery Items
17. Achievements
18. Community Projects
19. Jobs
20. Job Applications
21. Mentorship Profiles
22. Mentorship Requests
23. Notifications
24. Audit Logs
25. Optional Donation/Payment entities
```

The exact implementation order may change if dependency analysis requires it.

---

# 61. Prisma Schema Requirements

The final Prisma schema must include:

* Explicit relations
* Appropriate indexes
* Unique constraints
* Enum definitions where useful
* Timestamp fields
* Referential actions
* Appropriate nullable fields
* Consistent naming
* Database-compatible types

The schema must be reviewed before the first migration.

---

# 62. Database Testing Requirements

Before database implementation is considered complete:

```text
Prisma validation
Migration creation
Migration application
Migration rollback/recovery strategy
Seed verification
Foreign key verification
Unique constraint verification
Index verification
Transaction tests
Concurrency tests
```

Critical scenarios:

```text
Duplicate email
Duplicate event registration
Invalid foreign key
Unauthorized role relationship
Event capacity race
Repeated payment webhook
```

---

# 63. Production Database Completion Criteria

The database is production-ready only when:

* Schema is version controlled
* Migrations work
* Relationships are validated
* Constraints are implemented
* Indexes are reviewed
* Transactions are tested
* Backups are configured
* Restore has been tested
* Credentials are secured
* Database is not publicly exposed
* Application authorization is enforced
* Sensitive fields are protected
* Audit requirements are implemented
* Monitoring is configured
* Disaster recovery is documented

---

# 64. Final Database Decision Summary

| Area                    | Decision                            |
| ----------------------- | ----------------------------------- |
| Database                | PostgreSQL                          |
| ORM                     | Prisma                              |
| Primary source of truth | PostgreSQL                          |
| Authentication data     | Users + secure auth state           |
| Authorization           | Roles + permissions                 |
| Alumni                  | Alumni profiles                     |
| Academic data           | Academic records                    |
| Cohorts                 | Batches                             |
| Events                  | Events + registrations + attendance |
| Stories                 | Stories                             |
| News                    | News                                |
| Gallery                 | Galleries + gallery items           |
| Achievements            | Achievements                        |
| Community               | Community projects                  |
| Jobs                    | Jobs + applications                 |
| Mentorship              | Profiles + requests                 |
| Notifications           | Notifications                       |
| Auditing                | Audit logs                          |
| Media                   | Object storage                      |
| Cache/queue             | Redis                               |
| Search                  | PostgreSQL initially                |
| IDs                     | Consistent UUID-compatible strategy |
| Timestamps              | UTC                                 |
| Schema changes          | Prisma migrations                   |
| Backups                 | Automated PostgreSQL backups        |
| Architecture            | Relational + modular                |

---

# 65. Final Rule

The database schema must be implemented from this design.

If implementation reveals a necessary change, the database design document must be updated before or together with the schema change.

No undocumented production database structure should exist.

Database changes must remain synchronized with:

```text
PROJECT_SPECIFICATION.md
ARCHITECTURE.md
API_SPECIFICATION.md
Prisma schema
Migrations
Tests
```
