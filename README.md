<div align="center">

# QontakSales

**Sales CRM Platform** — Kelola leads, pipeline, broadcast WhatsApp, dan tim sales Anda dalam satu platform.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=white)](https://reactjs.org/)
[![Django](https://img.shields.io/badge/Django-5.1-092E20?style=flat&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Chakra UI](https://img.shields.io/badge/Chakra_UI-v3-319795?style=flat&logo=chakraui&logoColor=white)](https://chakra-ui.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

</div>

---

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard** | Statistik real-time: revenue, win rate, stage distribution, leaderboard agent |
| **Leads Management** | CRUD leads lengkap dengan search, filter, sort, pagination |
| **Pipeline (Kanban)** | Visualisasi pipeline 5 stage: Prospek Baru → Hubungi → Negosiasi → Won/Lost |
| **WhatsApp Broadcast** | Kirim pesan massal ke leads dengan template personal (`{name}`, `{phone}`, `{company}`, `{value}`) |
| **Broadcast History** | Riwayat pengiriman broadcast lengkap dengan status & detail |
| **Archive Leads** | Soft-delete leads tanpa menghapus data, tidak terhitung di dashboard |
| **Agent Management** | Kelola tim sales agent (Manager only) |
| **Role-Based Access** | 2 role: Manager (full access) & Agent (limited access) |
| **Switch Account** | Manager bisa impersonate agent untuk review |
| **Profile & Avatar** | Upload avatar, edit profil |

---

## Tech Stack

### Backend
- **Framework:** Django 5.1 + Django REST Framework
- **Database:** PostgreSQL
- **Authentication:** JWT (SimpleJWT)
- **WhatsApp API:** Fonnte (via sendFast microservice)

### Frontend
- **Framework:** React 19 + Vite 6
- **UI Library:** Chakra UI v3
- **Icons:** Phosphor Icons
- **Charts:** Chart.js (react-chartjs-2)
- **HTTP Client:** Axios
- **Router:** React Router DOM v7

---

## Arsitektur

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│                      http://localhost:5173                   │
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API (Axios)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                 Backend (Django REST Framework)              │
│                      http://localhost:8000                   │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌─────────┐ │
│  │ accounts │  │  leads   │  │  broadcasts  │  │  (...)  │ │
│  └──────────┘  └──────────┘  └──────┬───────┘  └─────────┘ │
└──────────────────────────────────────┼──────────────────────┘
                                       │ HTTP POST
                                       ▼
┌─────────────────────────────────────────────────────────────┐
│              sendFast (Laravel) — WhatsApp API               │
│                    http://localhost:8001                     │
│                    Driver: Fonnte API                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Struktur Project

```
QontakSales/
├── backend/                        # Django REST API
│   ├── qontak_sales/
│   │   ├── apps/
│   │   │   ├── accounts/           # User, Company, Auth, Permissions
│   │   │   ├── leads/              # Lead CRUD, Pipeline, Dashboard Stats
│   │   │   ├── broadcasts/         # WhatsApp Broadcast + History
│   │   │   ├── activities/         # Activity logging
│   │   │   └── notifications/      # In-app notifications
│   │   ├── settings.py
│   │   └── urls.py
│   ├── manage.py
│   └── .env
├── frontend/                       # React SPA
│   ├── src/
│   │   ├── pages/                  # Page components
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── LeadsPage.jsx
│   │   │   ├── PipelinePage.jsx
│   │   │   ├── LeadDetailPage.jsx
│   │   │   ├── BroadcastPage.jsx
│   │   │   ├── BroadcastHistoryPage.jsx
│   │   │   ├── ArchivedLeadsPage.jsx
│   │   │   ├── AgentsPage.jsx
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── LandingPage.jsx
│   │   ├── components/layout/      # Layout components
│   │   │   ├── Sidebar.jsx
│   │   │   ├── TopBar.jsx
│   │   │   ├── MainLayout.jsx
│   │   │   └── AuthGuard.jsx
│   │   ├── services/api.js         # Axios instance + JWT interceptors
│   │   ├── assets/                 # Images (brand.png, heroImg.png)
│   │   └── theme/index.js          # Chakra UI theme tokens
│   ├── package.json
│   └── vite.config.js
└── PROJECT.md                      # Product Requirements Document
```

---

## Role-Based Permissions

| Fitur | Manager | Agent |
|-------|---------|-------|
| Dashboard | Full (semua data) | Own data only |
| Leads | Semua leads | Hanya leads sendiri |
| Pipeline | Semua leads | Hanya leads sendiri |
| Broadcast | Semua leads | Hanya leads sendiri |
| Archive/Restore | Semua leads | Hanya leads sendiri |
| Agent Management | Full CRUD | Tidak ada akses |
| Delete Leads | Ya | Tidak |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.13+
- PostgreSQL 16+
- PHP 8.2+ (untuk sendFast)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate     # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure database
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start server
python manage.py runserver 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Start dev server
pnpm run dev
```

### sendFast Setup (WhatsApp API)

```bash
cd ../sendFast/backend

# Install dependencies
composer install

# Configure .env
# Set WA_DRIVER=fonnte
# Set FONNTE_TOKEN=your_token

# Start server
php artisan serve --port=8001
```

### Login

| Role | Email | Password |
|------|-------|----------|
| Manager | admin@qontak.com | admin123 |

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/token/` | Login (email + password) |
| POST | `/api/token/refresh/` | Refresh JWT token |
| POST | `/api/auth/register/` | Register new user |

### Leads
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/leads/` | List leads (filter: `?archived=true`) |
| POST | `/api/leads/` | Create lead |
| GET | `/api/leads/{id}/` | Lead detail |
| PUT | `/api/leads/{id}/` | Update lead |
| DELETE | `/api/leads/{id}/` | Delete lead (Manager only) |
| POST | `/api/leads/{id}/archive/` | Archive lead |
| POST | `/api/leads/{id}/restore/` | Restore lead |
| POST | `/api/leads/{id}/move_stage/` | Move lead to next stage |

### Broadcast
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/broadcasts/` | List broadcast history |
| POST | `/api/broadcasts/` | Create & send broadcast |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats/` | Dashboard statistics |

---

## WhatsApp Broadcast

### Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{name}` | Contact name | John Doe |
| `{phone}` | Phone number | 6281234567890 |
| `{company}` | Company source | PT Maju Jaya |
| `{value}` | Deal value | Rp 75.000.000 |

### Contoh Pesan

```
Halo {name} dari {company}!

Kami ingin menginformasikan bahwa deal senilai Rp {value} sedang dalam tahap negosiasi.

Terima kasih!
QontakSales Team
```

---

## Screenshots

> Coming soon...

---

## License

MIT License

---

<div align="center">

**Built with ❤️ by Fitra Riadi**

</div>
