# Zentrion Dashboard

Next.js 16 dashboard for the Zentrion Zero Trust Security Orchestrator. Talks to the NestJS backend (`app/orchestrator-api`) over REST + Socket.IO.

## Prerequisites

The backend must be reachable before the dashboard will show meaningful data. Either:

- **In-cluster** (usual FYP setup): backend running in the minikube `zentrion-system` namespace. Port-forward it locally:
  ```bash
  kubectl port-forward -n zentrion-system svc/zentrion-orchestrator 3001:3001
  ```
- **Local backend dev**: run `orchestrator-api` directly on port 3001.

## Setup

```bash
cp .env.local.example .env.local   # defaults to http://localhost:3001
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seeded Credentials

The backend seeds three accounts on first boot (`DB_SYNC=true`):

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | ADMIN |
| `analyst` | `analyst123` | ANALYST |
| `viewer` | `viewer123` | VIEWER |

Approve/reject policy actions require the ADMIN role.

## Environment Variables

| Var | Default | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | REST + Socket.IO base URL |

## Scripts

- `npm run dev` — dev server on port 3000
- `npm run build` — production build
- `npm run lint` — ESLint
