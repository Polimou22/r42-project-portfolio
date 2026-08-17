# R42 Agent Infrastructure

Backend infrastructure for a multi-agent small-business setup and compliance assistant, built during my Agentic AI Fellowship at R42 Institute. The assistant is split into five specialized personas — Finance, Product, Funding, Marketing, and HR — each running as an independent agent process, with a lightweight Node backend routing requests to them and a watchdog script keeping the fleet healthy.

## What this covers

This repo documents the infrastructure layer I built and owned: process supervision, backend routing, and persona configuration. It does not include the frontend dashboard or the agent runtime itself (Hermes), which are separate parts of the project.

## Architecture

Client (dashboard) → Node backend (server.js) → Hermes agent runtime → Persona (finance | product | funding | marketing | hr)
                                                          ↑
                                            hermes-watchdog.sh (cron, health checks)

Each persona runs on its own port as a separate Hermes gateway process. A cron-scheduled watchdog script checks each persona's `/health` endpoint and restarts any that stop responding, so the fleet self-heals without manual intervention.

## Contents

| Path | Purpose |
|---|---|
| `watchdog/hermes-watchdog.sh` | Health-checks all five persona ports every 3 minutes (via cron) and restarts any that fail, using Docker exec against the Hermes container. |
| `backend/server.js` | Express backend that receives chat requests and forwards them to the Hermes runtime, keeping the Hermes URL and API key server-side rather than exposed to any client. |
| `backend/package.json` | Backend dependencies (Express, CORS, dotenv, node-fetch). |
| `backend/.env.example` | Template for the environment variables the backend needs — copy to `.env` and fill in real values, never commit `.env` itself. |
| `profiles/*.yaml` | One config file per persona, defining what each agent is responsible for. |

## The five personas

| Persona | Role |
|---|---|
| Finance | Cash visibility and daily/weekly accounting reconciliation |
| Product | Product design |
| Funding | Investor communications — tracks investor emails, decks, meetings, and follow-ups; drafts outreach |
| Marketing | Drafts marketing emails, manages campaigns, reviews CRM outreach |
| HR | Employee, hiring, staffing, scheduling, onboarding, training, and workload questions |

## Why a watchdog

The Hermes agent processes run inside Docker on a single VPS. Any one persona can go down independently (memory pressure, a bad request, a dependency hiccup) without taking down the others. Rather than relying on manual restarts, `hermes-watchdog.sh` runs every 3 minutes via cron, checks each persona's health endpoint, and restarts only the ones that are actually unhealthy — keeping the other four running uninterrupted.

## Why a backend layer instead of calling Hermes directly

Two reasons:
- **Mixed content**: the frontend dashboard is served over HTTPS, but the Hermes runtime speaks plain HTTP. Browsers block HTTPS pages from calling HTTP endpoints directly, so a server-side layer is required regardless of anything else.
- **Credentials**: the Hermes URL and API key can only live server-side. Anything shipped to the browser is visible to any visitor.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your own values
node server.js
```

For the watchdog, add it to cron on the host running the Hermes containers:

```bash
crontab -e
# */3 * * * * /path/to/hermes-watchdog.sh >> /path/to/hermes-watchdog.log 2>&1
```

## Notes

Config and code here have been stripped of real credentials, VPS addresses, and any client-identifying data. `.env.example` shows the shape of what's required without exposing real values.
