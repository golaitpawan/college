# Development Roadmap

## Phase 1 — MVP (Timetable Core)

**Goal:** College admins and department heads can build, approve, and publish timetables. Students and teachers can view them.

| Feature | Priority | Complexity |
|---------|----------|-----------|
| Auth (JWT, refresh token, MFA for admins) | P0 | Medium |
| Role & permission management | P0 | Medium |
| Academic setup (departments, courses, subjects, classrooms) | P0 | Low |
| Manual timetable builder with slot management | P0 | High |
| Conflict detection engine | P0 | High |
| Approval workflow (draft → review → approve → publish) | P0 | Medium |
| Student/teacher timetable views | P0 | Low |
| Basic in-app + email notifications on timetable publish | P1 | Medium |
| Timetable PDF/Excel export | P1 | Low |
| Admin dashboard (user, dept, timetable stats) | P1 | Low |
| Audit logs | P1 | Low |

**Dependencies:** None.

---

## Phase 2 — Communication

**Goal:** WhatsApp-style messaging within the college community.

| Feature | Priority | Complexity |
|---------|----------|-----------|
| 1:1 direct messaging | P0 | High |
| Group chat (teacher-created, dept-created) | P0 | High |
| WebSocket real-time delivery + Redis Pub/Sub | P0 | High |
| Offline message delivery via FCM/APNs | P0 | Medium |
| File/image sharing via pre-signed S3 URLs | P0 | Medium |
| Invite system (send, accept, reject) | P0 | Medium |
| Channels (one-way announcements) | P1 | Medium |
| Message reactions, replies, pin, forward | P1 | Medium |
| Message search | P1 | Medium |
| Moderation (delete, block, report) | P1 | Medium |

**Dependencies:** Phase 1 auth, user roles.

---

## Phase 3 — Marketplace & Community

**Goal:** Students and teachers can share, sell, and discover campus resources.

| Feature | Priority | Complexity |
|---------|----------|-----------|
| Marketplace post creation (categories, images) | P0 | Medium |
| Moderation approval workflow for posts | P0 | Low |
| Search and filter listings | P0 | Medium |
| Communities (large group spaces) | P1 | Medium |
| Report / block for posts and users | P1 | Low |
| Post expiry and auto-archiving | P1 | Low |
| Save / bookmark posts | P2 | Low |

**Dependencies:** Phase 2 file upload infrastructure.

---

## Phase 4 — Advanced Timetable Engine

**Goal:** Reduce manual effort and improve scheduling quality.

| Feature | Priority | Complexity |
|---------|----------|-----------|
| Teacher availability / unavailability management | P0 | Medium |
| Teacher workload tracking and breach alerts | P0 | Medium |
| Semi-automatic timetable generation from constraints | P1 | Very High |
| Room utilization optimization suggestions | P1 | High |
| Timetable version rollback (restore previous version) | P1 | Medium |
| Substitute teacher tracking and notifications | P1 | Medium |
| Class cancellation and emergency rescheduling flow | P1 | Medium |
| Advanced reports (workload, room utilization, subject hours) | P1 | Medium |

**Dependencies:** Phase 1 timetable engine.

---

## Phase 5 — Enterprise Scale

**Goal:** Support multiple colleges, high availability, enterprise auth, and observability.

| Feature | Priority | Complexity |
|---------|----------|-----------|
| SSO integration (SAML 2.0 / OIDC) | P0 | High |
| Multi-college / multi-campus support | P0 | High |
| Microservices decomposition | P1 | Very High |
| Kafka/NATS event bus | P1 | High |
| Kubernetes deployment + Helm charts | P1 | High |
| PostgreSQL read replicas | P1 | Medium |
| OpenSearch for full-text search | P1 | Medium |
| Prometheus + Grafana + ELK observability | P1 | Medium |
| End-to-end encryption for chat (feasibility) | P2 | Very High |
| Data retention and GDPR-style controls | P1 | Medium |
| Backup and disaster recovery runbooks | P1 | Medium |

**Dependencies:** Phases 1–4 complete and stable.

---

## Testing Strategy

| Layer | Tool (suggested) | Scope |
|-------|-----------------|-------|
| Unit | Jest | Service methods, conflict detection rules |
| API | Supertest / Postman/Newman | All REST endpoints, auth flows |
| Integration | Jest + test DB | DB queries, approval workflow end-to-end |
| WebSocket | ws client in Jest | Message delivery, sync, typing indicators |
| E2E (web) | Playwright | Critical flows: login, create timetable, publish, chat |
| E2E (mobile) | Detox | Login, timetable view, notification receipt |
| Load | k6 | 1000 concurrent WebSocket connections, bulk notification fan-out |
| Security | OWASP ZAP + manual pen-test | Auth bypass, injection, IDOR, XSS |

### Sample Test Cases

**Timetable Creation**
- Create a draft with valid entries → status is `draft`.
- Add two entries for the same teacher at the same time → conflict detected.
- Submit draft without resolving conflicts → rejected with conflict list.

**Approval Workflow**
- Coordinator submits → status becomes `submitted`.
- Dept Head requests changes → status becomes `changes_requested`.
- Dept Head approves without prior `submitted` status → 403.
- Publish approved timetable → status becomes `published`; notifications dispatched.

**Chat**
- Send message to a chat the user is not a member of → 403.
- Accept an expired invite → 422.
- Upload an attachment; retrieve via CDN URL → 200 with correct MIME type.

**Notifications**
- Publish timetable → all enrolled students receive in-app notification within 5s.
- Preference set to `push: false` → no FCM call made for that user.
