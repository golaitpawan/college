# API Design

Base URL: `/api/v1`

All endpoints require `Authorization: Bearer <access_token>` unless marked **Public**.
All responses follow `{ data, error, meta }` envelope.
Validation errors return HTTP 422 with field-level messages.

---

## Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Email + password login; returns access + refresh tokens |
| POST | `/auth/sso` | Public | Initiate SSO (OIDC/SAML); returns redirect URL |
| POST | `/auth/refresh` | Public | Rotate refresh token; returns new access token |
| POST | `/auth/logout` | Required | Revoke current refresh token |
| POST | `/auth/forgot-password` | Public | Send password reset email |
| POST | `/auth/reset-password` | Public | Validate reset token and set new password |
| POST | `/auth/mfa/enable` | Required | Enroll TOTP; returns QR code |
| POST | `/auth/mfa/verify` | Required | Verify TOTP code |

---

## Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users/me` | Required | Current user profile |
| PATCH | `/users/me` | Required | Update own profile |
| POST | `/users` | Admin | Create a single user |
| POST | `/users/import` | Admin | Bulk import users via CSV |
| GET | `/users/:id` | Admin | Get user by ID |
| PATCH | `/users/:id` | Admin | Update user (status, role, etc.) |
| POST | `/users/:id/roles` | Admin | Assign role (optionally scoped to department) |
| DELETE | `/users/:id/roles/:roleId` | Admin | Remove role |

---

## Academic Setup

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET/POST | `/departments` | Admin | List / create departments |
| GET/PATCH | `/departments/:id` | Admin | Get / update department |
| GET/POST | `/academic-sessions` | Admin | List / create academic sessions |
| GET/POST | `/courses` | Admin | List / create courses |
| GET/POST | `/subjects` | Admin | List / create subjects |
| GET/POST | `/sections` | Admin | List / create sections |
| GET/POST | `/classrooms` | Admin | List / create classrooms/labs |
| GET/POST | `/holidays` | Admin | List / create holidays for a session |

---

## Timetable

### Creation & Editing

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/timetables` | Dept Head / Coordinator | Create draft timetable version |
| GET | `/timetables/:versionId` | All | Get timetable version details |
| PATCH | `/timetables/:versionId` | Dept Head / Coordinator | Update draft entries |
| DELETE | `/timetables/:versionId/entries/:entryId` | Dept Head / Coordinator | Remove an entry |
| POST | `/timetables/:versionId/entries` | Dept Head / Coordinator | Add a new entry |

### Workflow

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/timetables/:versionId/submit` | Coordinator | Submit for review |
| POST | `/timetables/:versionId/approve` | Dept Head | Approve submitted timetable |
| POST | `/timetables/:versionId/request-changes` | Dept Head | Return with comments |
| POST | `/timetables/:versionId/publish` | Dept Head / College Admin | Publish to students and teachers |
| POST | `/timetables/:versionId/archive` | Admin | Archive old version |
| GET | `/timetables/:versionId/history` | Dept Head+ | Full approval history |

### Conflict Detection

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/timetables/:versionId/validate` | Dept Head / Coordinator | Run conflict detection; returns conflict list |

**Response includes:** teacher double-book, room double-book, batch conflict, workload breach, lab compatibility, break/holiday violation.

### Views

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/timetables/student/:userId` | Self / Admin | Student's personal timetable |
| GET | `/timetables/teacher/:userId` | Self / Admin | Teacher's class schedule |
| GET | `/timetables/department/:deptId` | Dept members | Full department timetable |
| GET | `/timetables/room/:roomId` | Admin / Coord | Room-wise view |
| GET | `/timetables/export/:versionId` | Dept Head+ | Export as PDF or XLSX (`?format=pdf\|xlsx`) |

---

## Notifications

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/notifications` | Required | Paginated notification list (`?read=false`) |
| PATCH | `/notifications/:id/read` | Required | Mark one as read |
| POST | `/notifications/read-all` | Required | Mark all as read |
| GET | `/notifications/preferences` | Required | Get delivery preferences |
| PATCH | `/notifications/preferences` | Required | Update preferences |

---

## Chat

### Conversations

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chats` | Required | Create group, channel, or community |
| GET | `/chats` | Required | List chats the user belongs to |
| GET | `/chats/:id` | Member | Chat details |
| PATCH | `/chats/:id` | Admin/Owner | Update name, description, avatar |
| DELETE | `/chats/:id` | Owner / College Admin | Delete chat |

### Direct Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chats/direct` | Required | Start or retrieve existing direct chat with a user |

### Members

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/chats/:id/members` | Member | List members |
| DELETE | `/chats/:id/members/:userId` | Admin/Owner | Remove member |
| PATCH | `/chats/:id/members/:userId` | Admin/Owner | Change member role |

### Invites

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/chats/:id/invites` | Member | Send invite to user |
| GET | `/invites` | Required | My pending invites |
| POST | `/invites/:id/accept` | Required | Accept invite |
| POST | `/invites/:id/reject` | Required | Reject invite |

### Messages

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/chats/:id/messages` | Member | Paginated messages (`?before=<timestamp>`) |
| POST | `/chats/:id/messages` | Member | Send message |
| PATCH | `/chats/:id/messages/:msgId` | Sender | Edit message |
| DELETE | `/chats/:id/messages/:msgId` | Sender / Moderator | Soft-delete message |
| POST | `/chats/:id/messages/:msgId/reactions` | Member | Add reaction |
| DELETE | `/chats/:id/messages/:msgId/reactions/:emoji` | Member | Remove reaction |
| POST | `/uploads/presign` | Required | Get pre-signed upload URL for attachment |

---

## Marketplace

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/marketplace/posts` | Required | Browse posts (`?category=&q=&status=`) |
| POST | `/marketplace/posts` | Required | Create listing |
| GET | `/marketplace/posts/:id` | Required | Post detail |
| PATCH | `/marketplace/posts/:id` | Owner | Edit own post |
| DELETE | `/marketplace/posts/:id` | Owner / Moderator | Delete post |
| POST | `/marketplace/posts/:id/approve` | Moderator | Approve pending post |
| POST | `/marketplace/posts/:id/reject` | Moderator | Reject post with reason |
| GET | `/marketplace/categories` | Public | Category tree |

---

## Reporting & Moderation

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reports` | Required | Report a message, post, or user |
| GET | `/reports` | Moderator+ | List reports (`?status=open`) |
| PATCH | `/reports/:id` | Moderator+ | Resolve / dismiss report |

---

## Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/admin/audit-logs` | Super Admin / College Admin | Paginated audit log |
| GET | `/admin/stats` | Admin | Dashboard counters (users, timetables, messages) |
| GET | `/admin/system-health` | Super Admin | Basic service health |
| GET | `/admin/reports/timetable` | Admin | Timetable utilization report |
| GET | `/admin/reports/teacher-workload` | Admin | Teacher workload report |
| GET | `/admin/reports/room-utilization` | Admin | Room utilization report |

---

## WebSocket Events

Clients connect to `/ws?token=<access_token>`.

| Event (client → server) | Payload | Purpose |
|------------------------|---------|---------|
| `join_chat` | `{ chatId }` | Subscribe to chat room |
| `leave_chat` | `{ chatId }` | Unsubscribe |
| `send_message` | `{ chatId, body, replyToId?, attachmentKeys? }` | Send message |
| `typing` | `{ chatId }` | Typing indicator |
| `sync` | `{ since: ISO timestamp }` | Fetch missed messages |

| Event (server → client) | Payload | Purpose |
|-------------------------|---------|---------|
| `new_message` | full message object | Deliver message |
| `message_updated` | `{ id, body, editedAt }` | Edit notification |
| `message_deleted` | `{ id }` | Delete notification |
| `reaction_added` / `reaction_removed` | `{ messageId, userId, emoji }` | Reaction sync |
| `typing_indicator` | `{ chatId, userId }` | Show typing |
| `notification` | notification object | Real-time notification |
| `timetable_updated` | `{ versionId, deptId }` | Timetable change alert |
