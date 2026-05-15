# UI/UX Screen Plan

All screens are mobile-first. Web admin panel uses a sidebar layout; student/teacher app uses bottom-tab navigation.

---

## Admin Panel (Web)

### Login
- Email/password form with "Forgot password" link.
- MFA code entry step for admin roles.
- SSO button (if configured).
- Error states: invalid credentials, account suspended, MFA required.

### Dashboard
- Summary cards: total users, active timetables, pending approvals, open reports.
- Recent activity feed (last 10 audit log entries).
- System health indicator.

### User Management
- Searchable, filterable table (role, department, status).
- Actions: create, import CSV, view profile, suspend, assign role.
- Role assignment modal with department scope selector.
- Error state: import validation failures shown per row.

### Department Management
- Department list with head assignment.
- Create/edit department form.
- Academic session selector.

### Academic Setup
- Tabbed interface: Courses, Subjects, Sections, Classrooms, Holidays.
- Each tab: paginated list + create/edit modal.
- Classroom tab shows capacity, type, and resource tags.

### Timetable Builder (Dept Head / Coordinator)
- Week-view grid (days × time slots).
- Drag-and-drop entry creation.
- Subject, teacher, and room selectors with availability indicators.
- Conflict badge appears inline on conflicting slots.
- "Run Validation" button triggers conflict detection; results panel slides in.
- Status bar shows current workflow state.

### Timetable Approval
- Side-by-side: entry list + comment thread.
- "Approve" / "Request Changes" buttons with required comment on changes.
- History timeline showing all workflow actions.

### Moderation Panel
- Tabs: Reported Messages, Reported Posts, Reported Users.
- Each item shows context, reporter reason, and action buttons (dismiss / remove / ban).

### Audit Logs
- Filterable by actor, action type, date range.
- Each row expandable to show full metadata JSON.

---

## Department Head Panel (Web)

### Department Dashboard
- Timetable status summary (draft count, pending approvals, published versions).
- Quick links: create timetable, view department timetable, teacher workload.

### Create / Edit Timetable
- Same grid builder as admin but scoped to department.
- Teacher list shows availability and current weekly hours.
- Conflict panel flags issues with suggested fixes where possible.

### Approval Workflow View
- Shows submitted timetables awaiting decision.
- One-click approve or request-changes flow.

---

## Teacher App (Mobile + Web)

### My Timetable
- Day-view default with week-view toggle.
- Each card shows subject, room, section, time.
- Tap card → class details (students count, notes, substitute info if any).

### Today's Classes
- Chronological list for current day.
- Status indicators: upcoming, in progress, cancelled, substitute.

### Notifications
- Grouped by type: timetable changes, messages, announcements.
- Tap → navigate to relevant context.

### Chat
- Chat list with unread badge.
- In-chat: message bubbles, attachment previews, reply thread, reactions.
- Floating "New Chat" button.

### Groups
- My groups list.
- "Create Group" flow: name, type (class/subject/custom), add members, invite link.

---

## Student App (Mobile + Web)

### My Timetable
- Day-view with week toggle.
- Visual distinction for theory vs. practical vs. lab slots.
- Cancelled/rescheduled entries marked with reason.

### Department Timetable
- Full department view; filterable by section.

### Notifications
- Timetable changes highlighted prominently (red badge).
- In-app toast for real-time updates.

### Chat
- Same as teacher chat UI.
- Can only initiate direct messages after mutual connection or invite acceptance.

### Marketplace
- Feed view with category filter chips and search bar.
- Post card: image, title, category tag, contact button.
- Create post: title, body, category, images, expiry date, contact info.
- My Posts section for managing own listings.

---

## Shared / Community Screens

### Channel View
- Read-only message feed (admin posts only).
- Pin indicator on important messages.
- Subscribe/unsubscribe button.

### Community View
- Member list, about section, rules.
- Open or approval-based join flow.

### Invite Screen
- Pending invites list with accept/reject per item.
- Invite via link: copy or share button.

### Report Content
- Report type selector (spam, harassment, inappropriate, other).
- Optional description field.
- Confirmation screen with "Content Reported" state.

---

## Mobile-First Considerations

- Timetable grid scrolls horizontally on small screens; day-view is the default.
- Chat input stays pinned above keyboard on iOS/Android.
- File attachment picker integrates with device gallery and document picker.
- Offline: timetable cached locally; chat shows "Sending…" until confirmed.
- Push notification tap navigates directly to relevant screen (deep link via `data` payload).
