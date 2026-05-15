# Architecture

## System Decomposition

```
┌─────────────────────────────────────────────────────────────┐
│                        Clients                              │
│  Next.js Web App │ React Native / Flutter Mobile App        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS / WSS
┌────────────────────────▼────────────────────────────────────┐
│                    API Gateway / BFF                         │
│  (rate limiting, auth validation, routing)                  │
└──┬──────────────────┬────────────────────┬──────────────────┘
   │                  │                    │
┌──▼──────┐   ┌───────▼────────┐   ┌──────▼──────────┐
│Timetable│   │ Chat / Realtime│   │  Marketplace /  │
│ Service │   │    Service     │   │  Community Svc  │
└──┬──────┘   └───────┬────────┘   └──────┬──────────┘
   │                  │                    │
┌──▼──────────────────▼────────────────────▼──────────┐
│                  PostgreSQL (primary)                 │
│              Redis (cache + pub/sub)                  │
│          Object Storage (S3-compatible)               │
│          FCM / APNs (push notifications)             │
└──────────────────────────────────────────────────────┘
```

For Phase 5, each service becomes an independent microservice communicating via Kafka/NATS.

## Module Boundaries

| Module | Owns | Does NOT own |
|--------|------|-------------|
| Auth | Users, roles, permissions, sessions | Academic entities |
| Academic Setup | Departments, courses, subjects, semesters, sections, classrooms, labs | Scheduling logic |
| Timetable Engine | Slots, entries, versions, approvals, conflict rules | Chat, notifications delivery |
| Notification Service | Notification records, preferences, delivery queue | Timetable business logic |
| Chat Service | Messages, groups, channels, invites, attachments | Timetable data |
| Marketplace | Posts, categories, listings, reports | Chat messages |
| Admin/Moderation | Audit logs, system settings, moderation queue | Domain-specific rules |

## Real-time Architecture

- Clients open a single WebSocket connection authenticated via JWT.
- Chat messages flow: Client → WebSocket Gateway → Redis Pub/Sub → all active recipients' WebSocket connections.
- Clients that are offline receive messages via FCM/APNs push notifications.
- On reconnect, client sends a `sync_from` timestamp; server returns missed messages.
- Timetable update events are published to a Kafka/NATS topic; Notification Service consumes and fans out.

## File Upload Flow

1. Client requests a pre-signed upload URL from the API.
2. Client uploads directly to object storage (S3) — server never proxies the bytes.
3. Client notifies API of completed upload with the object key.
4. API stores the reference and (async) queues a virus-scan job.
5. File is served via CDN; object storage bucket is not publicly readable.

## Caching Strategy

| Data | Cache TTL | Invalidation trigger |
|------|-----------|---------------------|
| Published timetable | 24h | Timetable published / updated |
| User profile | 15 min | Profile mutation |
| Room/lab list | 1h | Room mutation |
| Unread notification count | 5 min | New notification |

## RBAC Permission Matrix (abbreviated)

| Action | Super Admin | College Admin | Dept Head | Coordinator | Teacher | Student |
|--------|:-----------:|:-------------:|:---------:|:-----------:|:-------:|:-------:|
| Create department | ✓ | ✓ | | | | |
| Create timetable | ✓ | ✓ | ✓ | ✓ | | |
| Approve timetable | ✓ | ✓ | ✓ | | | |
| Publish timetable | ✓ | ✓ | ✓ | | | |
| View own timetable | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create chat group | ✓ | ✓ | ✓ | ✓ | ✓ | |
| Moderate marketplace | ✓ | ✓ | | | | |
| Post to marketplace | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| View audit logs | ✓ | ✓ | | | | |

## MVP vs Enterprise Trade-offs

| Concern | MVP | Enterprise |
|---------|-----|-----------|
| Backend | Monolith NestJS | Microservices |
| Messaging | Socket.IO + Redis Pub/Sub | Dedicated WebSocket gateway + Kafka |
| DB | Single PostgreSQL | PostgreSQL + read replicas |
| Auth | JWT + local DB | SSO (SAML/OIDC) |
| Deployment | Single VM / containers | Kubernetes |
| Search | PostgreSQL full-text | OpenSearch |
| Observability | Basic logging | Prometheus + Grafana + ELK |
