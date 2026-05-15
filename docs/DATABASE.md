# Database Schema

All tables use UUID primary keys and include `created_at`, `updated_at` timestamps unless noted.

## Auth & Users

### `users`
Core identity record for every person in the system.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| email | VARCHAR UNIQUE | |
| password_hash | VARCHAR | null for SSO-only users |
| full_name | VARCHAR | |
| phone | VARCHAR | |
| avatar_url | VARCHAR | |
| status | ENUM | active, inactive, suspended |
| mfa_enabled | BOOLEAN | |
| mfa_secret | VARCHAR | encrypted |

### `roles`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | VARCHAR UNIQUE | super_admin, college_admin, dept_head, coordinator, teacher, student, moderator |
| description | TEXT | |

### `user_roles`
Many-to-many. A user can have different roles in different departments.

| Column | Type | Notes |
|--------|------|-------|
| user_id | UUID FK → users | |
| role_id | UUID FK → roles | |
| department_id | UUID FK → departments | nullable; null = college-wide |
| granted_by | UUID FK → users | |
| granted_at | TIMESTAMPTZ | |

### `permissions`
| Column | Type |
|--------|------|
| id | UUID PK |
| resource | VARCHAR |
| action | VARCHAR |

### `role_permissions`
| Column | Type |
|--------|------|
| role_id | UUID FK → roles |
| permission_id | UUID FK → permissions |

### `refresh_tokens`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users | |
| token_hash | VARCHAR | |
| expires_at | TIMESTAMPTZ | |
| revoked | BOOLEAN | |

---

## Academic Setup

### `colleges`
| Column | Type |
|--------|------|
| id | UUID PK |
| name | VARCHAR |
| domain | VARCHAR |
| settings | JSONB |

### `departments`
| Column | Type |
|--------|------|
| id | UUID PK |
| college_id | UUID FK → colleges |
| name | VARCHAR |
| code | VARCHAR |
| head_user_id | UUID FK → users |

### `academic_sessions`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| college_id | UUID FK → colleges | |
| name | VARCHAR | e.g. "2024-25 Odd Semester" |
| start_date | DATE | |
| end_date | DATE | |
| is_active | BOOLEAN | |

### `courses`
| Column | Type |
|--------|------|
| id | UUID PK |
| department_id | UUID FK → departments |
| name | VARCHAR |
| code | VARCHAR |
| duration_years | INT |

### `subjects`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| course_id | UUID FK → courses | |
| name | VARCHAR | |
| code | VARCHAR | |
| semester | INT | |
| credits | INT | |
| weekly_hours | INT | |
| type | ENUM | theory, practical, tutorial, seminar, lab |

### `sections`
| Column | Type |
|--------|------|
| id | UUID PK |
| course_id | UUID FK → courses |
| semester | INT |
| name | VARCHAR |
| academic_session_id | UUID FK → academic_sessions |

### `classrooms`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| college_id | UUID FK → colleges | |
| name | VARCHAR | |
| capacity | INT | |
| type | ENUM | classroom, lab, seminar_hall, auditorium |
| resources | JSONB | e.g. projector, computers |

### `teacher_profiles`
Extended profile for users with teacher role.

| Column | Type |
|--------|------|
| user_id | UUID FK → users PK |
| department_id | UUID FK → departments |
| max_weekly_hours | INT |
| specializations | TEXT[] |

### `student_profiles`
| Column | Type |
|--------|------|
| user_id | UUID FK → users PK |
| section_id | UUID FK → sections |
| roll_number | VARCHAR |
| enrollment_number | VARCHAR |

### `holidays`
| Column | Type |
|--------|------|
| id | UUID PK |
| college_id | UUID FK → colleges |
| date | DATE |
| name | VARCHAR |
| academic_session_id | UUID FK → academic_sessions |

---

## Timetable Engine

### `timetable_versions`
Each publish/update creates a new version.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| department_id | UUID FK → departments | |
| academic_session_id | UUID FK → academic_sessions | |
| section_id | UUID FK → sections | |
| version_number | INT | auto-increment per section/session |
| status | ENUM | draft, submitted, changes_requested, approved, published, archived |
| created_by | UUID FK → users | |
| published_at | TIMESTAMPTZ | |
| published_by | UUID FK → users | |

### `timetable_entries`
One row per class slot in a timetable version.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| timetable_version_id | UUID FK → timetable_versions | |
| subject_id | UUID FK → subjects | |
| teacher_id | UUID FK → users | |
| classroom_id | UUID FK → classrooms | |
| day_of_week | SMALLINT | 1=Mon … 7=Sun |
| start_time | TIME | |
| end_time | TIME | |
| entry_type | ENUM | regular, extra, substitute, cancelled |
| substitute_teacher_id | UUID FK → users | nullable |

### `timetable_approvals`
Tracks review workflow history.

| Column | Type |
|--------|------|
| id | UUID PK |
| timetable_version_id | UUID FK → timetable_versions |
| action | ENUM | submitted, approved, changes_requested, published |
| actor_id | UUID FK → users |
| comment | TEXT |
| acted_at | TIMESTAMPTZ |

### `timetable_change_requests`
| Column | Type |
|--------|------|
| id | UUID PK |
| timetable_version_id | UUID FK → timetable_versions |
| requested_by | UUID FK → users |
| description | TEXT |
| status | ENUM | open, resolved |

---

## Notifications

### `notifications`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| user_id | UUID FK → users | recipient |
| type | VARCHAR | timetable_published, class_cancelled, new_message, etc. |
| title | VARCHAR | |
| body | TEXT | |
| data | JSONB | deep link payload |
| read_at | TIMESTAMPTZ | null = unread |
| delivered_at | TIMESTAMPTZ | |

### `notification_preferences`
| Column | Type |
|--------|------|
| user_id | UUID FK → users PK |
| type | VARCHAR PK |
| in_app | BOOLEAN |
| push | BOOLEAN |
| email | BOOLEAN |

---

## Chat & Messaging

### `chats`
Represents a conversation context (1:1, group, channel, community).

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| type | ENUM | direct, group, channel, community |
| name | VARCHAR | null for direct chats |
| description | TEXT | |
| avatar_url | VARCHAR | |
| created_by | UUID FK → users | |
| is_invite_only | BOOLEAN | |
| department_id | UUID FK → departments | null = college-wide |

### `chat_members`
| Column | Type | Notes |
|--------|------|-------|
| chat_id | UUID FK → chats | |
| user_id | UUID FK → users | |
| role | ENUM | owner, admin, member |
| joined_at | TIMESTAMPTZ | |
| muted_until | TIMESTAMPTZ | |

### `chat_invites`
| Column | Type |
|--------|------|
| id | UUID PK |
| chat_id | UUID FK → chats |
| invited_by | UUID FK → users |
| invited_user_id | UUID FK → users |
| status | ENUM: pending, accepted, rejected |
| expires_at | TIMESTAMPTZ |

### `messages`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| chat_id | UUID FK → chats | |
| sender_id | UUID FK → users | |
| body | TEXT | |
| reply_to_id | UUID FK → messages | nullable |
| is_deleted | BOOLEAN | soft delete |
| sent_at | TIMESTAMPTZ | client timestamp |
| server_at | TIMESTAMPTZ | authoritative |

### `message_attachments`
| Column | Type |
|--------|------|
| id | UUID PK |
| message_id | UUID FK → messages |
| storage_key | VARCHAR |
| file_name | VARCHAR |
| mime_type | VARCHAR |
| size_bytes | BIGINT |
| scan_status | ENUM: pending, clean, flagged |

### `message_reactions`
| Column | Type |
|--------|------|
| message_id | UUID FK → messages |
| user_id | UUID FK → users |
| emoji | VARCHAR |
| (PK: message_id, user_id, emoji) | | |

---

## Marketplace

### `marketplace_categories`
| Column | Type |
|--------|------|
| id | UUID PK |
| name | VARCHAR |
| slug | VARCHAR UNIQUE |
| parent_id | UUID FK → marketplace_categories |

### `marketplace_posts`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| author_id | UUID FK → users | |
| category_id | UUID FK → marketplace_categories | |
| college_id | UUID FK → colleges | |
| title | VARCHAR | |
| body | TEXT | |
| contact_info | VARCHAR | |
| status | ENUM | pending, approved, rejected, expired |
| expires_at | DATE | |

### `marketplace_post_images`
| Column | Type |
|--------|------|
| id | UUID PK |
| post_id | UUID FK → marketplace_posts |
| storage_key | VARCHAR |
| display_order | SMALLINT |

---

## Governance

### `reports`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| reporter_id | UUID FK → users | |
| target_type | VARCHAR | message, post, user |
| target_id | UUID | |
| reason | TEXT | |
| status | ENUM | open, reviewed, dismissed, actioned |
| resolved_by | UUID FK → users | |

### `audit_logs`
Append-only. Never delete rows.

| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| actor_id | UUID FK → users | |
| action | VARCHAR | e.g. timetable.publish, user.suspend |
| resource_type | VARCHAR | |
| resource_id | UUID | |
| metadata | JSONB | before/after snapshot |
| ip_address | VARCHAR | |
| occurred_at | TIMESTAMPTZ | |
