# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an **enterprise-level college timetable creator and campus community application**. It serves two main domains:

1. **Timetable Management** — Admins and department heads create, review, approve, and publish department-wise timetables. Students and teachers view real-time schedules and receive notifications on changes.
2. **Campus Communication** — A WhatsApp-style lightweight messaging system with one-to-one chat, groups, channels, communities, and a campus marketplace.

See `docs/` for the full architecture, database schema, API design, and roadmap.

## Project Structure

```
college/
├── backend/          NestJS API (port 3001)
│   ├── prisma/       Prisma schema + seed
│   └── src/
│       ├── auth/         JWT auth + refresh tokens
│       ├── users/        User CRUD + role assignment
│       ├── academic/     Departments, courses, subjects, classrooms, sections, sessions
│       ├── timetable/    Timetable versions, entries, conflict detection, workflow
│       ├── notifications/ In-app notifications + Socket.IO gateway
│       ├── prisma/       PrismaService (global)
│       └── common/       Guards, decorators, interceptors, filters
├── frontend/         Next.js 14 App Router (port 3000)
│   └── src/
│       ├── app/
│       │   ├── (auth)/         Login page
│       │   └── (dashboard)/    All authenticated pages
│       ├── components/   UI components (layout, timetable grid)
│       ├── hooks/        useAuth, useTimetable (React Query)
│       ├── lib/          api.ts (Axios), auth.ts (role helpers)
│       └── types/        Shared TypeScript types
├── docs/             Architecture, DB schema, API, roadmap, UI screens
├── docker-compose.yml PostgreSQL + Redis
└── setup.sh          One-command dev setup
```

## Development Commands

```bash
# One-time setup (requires Docker)
bash setup.sh

# Backend (NestJS)  — cd backend/
npm run start:dev     # watch mode dev server on :3001
npm run build         # compile to dist/
npm test              # Jest unit tests
npm run db:migrate    # run new Prisma migrations
npm run db:seed       # seed demo accounts and data
npm run db:studio     # open Prisma Studio at :5555

# Frontend (Next.js) — cd frontend/
npm run dev           # dev server on :3000
npm run build         # production build
npm run lint          # ESLint

# Infrastructure
docker compose up -d   # start PostgreSQL (5432) + Redis (6379)
docker compose down    # stop
```

## Demo Accounts (after seeding)

| Email | Password | Role |
|-------|----------|------|
| admin@demo.edu | Admin@123 | Super Admin |
| head.cse@demo.edu | Head@123 | Dept Head (CSE) |
| prof.smith@demo.edu | Teacher@123 | Teacher |
| alice@demo.edu | Student@123 | Student |

## Intended Tech Stack

### MVP
- **Frontend**: Next.js (web), React Native or Flutter (mobile)
- **Backend**: Node.js with NestJS
- **Database**: PostgreSQL
- **Cache**: Redis
- **Real-time**: Socket.IO over WebSockets
- **Push notifications**: Firebase Cloud Messaging (FCM)
- **File storage**: S3-compatible object storage + CDN
- **Auth**: JWT with refresh token rotation; SSO-ready (OIDC/SAML)

### Enterprise Scale (Phase 5+)
- **Backend**: NestJS microservices or Java Spring Boot
- **Message broker**: Kafka or NATS
- **Search**: OpenSearch / Elasticsearch
- **Deployment**: Kubernetes
- **Observability**: Prometheus + Grafana + ELK

## User Roles

| Role | Key Capability |
|------|---------------|
| Super Admin | Full system control, multi-college management |
| College Admin | Manage departments, users, classrooms |
| Department Head | Create/approve/publish department timetables |
| Timetable Coordinator | Draft timetables, detect conflicts, submit for review |
| Teacher | View personal schedule, create class/subject groups |
| Student | View timetable, join groups, use marketplace |
| Moderator | Moderate chat, marketplace, and reported content |

## Timetable Domain Rules

- A teacher cannot be double-booked at the same time slot.
- A classroom or lab cannot be assigned to two batches simultaneously.
- A batch cannot have two subjects at the same time.
- Lab subjects must be assigned only to compatible labs.
- Teacher weekly workload must not exceed configured limits.
- Break/lunch slots and holidays are non-assignable.
- Publishing a timetable creates a new version; rollback is supported.
- Every timetable change after publishing triggers student/teacher notifications.

## Timetable Approval Workflow

`Draft → Submitted for Review → Changes Requested → Approved → Published → Archived`

## Development Phases

| Phase | Focus |
|-------|-------|
| 1 – MVP | Auth, roles, academic setup, manual timetable, conflict detection, publish, basic notifications |
| 2 – Communication | 1:1 chat, group chat, channels, invites, file sharing, push notifications |
| 3 – Marketplace | Community posts, moderation, reporting, search |
| 4 – Advanced Timetable | Semi-auto generation, workload balancing, room optimization, rollback |
| 5 – Enterprise | SSO, multi-college, microservices, Kubernetes, observability, HA |

## Key Architectural Constraints

- **Lightweight messaging**: Use WebSockets only for active sessions; deliver offline messages on reconnect. Never poll — use push notifications (FCM/APNs) for background delivery.
- **Media offload**: All file uploads go directly to object storage via pre-signed URLs; the application server never proxies media.
- **Timetable consistency**: Published timetables are cached (Redis). All mutations invalidate cache and emit versioned events.
- **RBAC**: Every API endpoint enforces role + permission checks. Permission matrix is defined in `docs/ARCHITECTURE.md`.
- **Audit trail**: Admin and department-head mutations write to `audit_logs`. Never delete audit entries.

## Security Requirements

- JWT access tokens (short-lived) + refresh token rotation stored in HTTP-only cookies.
- MFA required for Super Admin and College Admin.
- File uploads must be validated (type, size) and scanned before serving.
- Rate limiting on all public and auth endpoints.
- WebSocket connections require authenticated JWT handshake.
- All data encrypted in transit (TLS) and at rest.
- Implement OWASP Top 10 mitigations: parameterized queries, input validation, CSP headers, CSRF protection.
