<p align="center">
  <img src="assets/scholarislogo.png" alt="Scholaris Logo" width="120">
</p>

# Scholaris — Student Information System 🎓

A lightweight, fully offline desktop app for managing Students, Programs, and Colleges — built with Go and Wails for a native experience without any external database.

Scholaris uses a Go backend and plain JavaScript frontend, with all data stored in local CSV files. It supports full CRUD operations, bulk CSV import/export, cascading integrity checks, and a responsive UI with light/dark mode.

---

## Highlights ✅

- Three fully managed entities: Students, Programs, and Colleges
- Full CRUD with field-level validation and duplicate detection
- Local CSV storage — no database, no setup, fully portable
- Bulk CSV import with duplicate detection (merge or skip), and export
- Startup integrity check — orphaned program/college references are auto-cleared
- Cascading updates — renaming or deleting a college/program propagates to dependents
- Fast in-memory search and sortable columns across all tables
- College-based grouping and filtering on the Programs table
- Paginated tables that adapt to window height
- Concurrent-safe file access using `sync.RWMutex`
- Native desktop window via Wails — ships as a single `.exe`

---

## Tech Stack 🧰

| Layer | Technology |
|-------|------------|
| Desktop Runtime | [Wails v2](https://wails.io/) |
| Backend | Go |
| Frontend | Vanilla JavaScript, HTML, CSS |
| Storage | CSV via `encoding/csv` |
| Concurrency | `sync.RWMutex` |

---

## Data Model 🧾

**Students**
| Field | Type | Description |
|-------|------|-------------|
| ID | string | Unique identifier in `YYYY-NNNN` format e.g. `2024-0001` |
| FirstName | string | Student's first name |
| LastName | string | Student's last name |
| ProgramCode | string | References a Program (blank = unenrolled) |
| Year | string | Year level 1–4 |
| Gender | string | Male / Female |

**Programs**
| Field | Type | Description |
|-------|------|-------------|
| Code | string | Unique program code e.g. `BSCS` |
| Name | string | Full program name |
| CollegeCode | string | References a College (blank = unassigned) |

**Colleges**
| Field | Type | Description |
|-------|------|-------------|
| Code | string | Unique college code e.g. `CCS` |
| Name | string | Full college name |

---

## Project Structure 🗂️

```
ccc151-student-system/
├── data/
│   ├── colleges.csv
│   ├── programs.csv
│   └── students.csv
├── frontend/
│   ├── css/
│   │   ├── variables.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   └── combobox.css
│   ├── js/
│   │   ├── state.js           # Shared in-memory state
│   │   ├── utils.js           # DOM helpers, validation, toast
│   │   ├── tables.js          # Table rendering, sorting, pagination, filtering
│   │   ├── combobox.js        # Reusable combobox factory
│   │   ├── modals.js          # Modal open/close and form handling
│   │   ├── crud.js            # CRUD submit/delete handlers
│   │   ├── importexport.js    # CSV import/export UI logic
│   │   ├── theme.js           # Light/dark theme toggle
│   │   └── main.js            # Entry point and event wiring
│   └── index.html
├── models/
│   └── models.go              # Student, Program, College structs
├── services/
│   ├── cascade.go             # Cascading updates on rename/delete
│   ├── colleges.go            # CRUD logic for colleges
│   ├── export.go              # CSV export for all entities
│   ├── import.go              # CSV import with preview and merge/skip
│   ├── integrity.go           # Startup orphan cleanup
│   ├── programs.go            # CRUD logic for programs
│   └── students.go            # CRUD logic for students
├── storage/
│   └── csv.go                 # CSV read/write/append with mutex
├── app.go                     # Wails bindings — exposes Go methods to JS
├── main.go                    # Entry point and Wails window config
├── go.mod
├── go.sum
└── wails.json
```

---

## Getting Started 🚀

### Prerequisites

- [Go 1.21+](https://go.dev/dl/)
- [Wails v2](https://wails.io/docs/gettingstarted/installation)
- [Node.js](https://nodejs.org/) — required internally by Wails

**Linux only** — Wails requires the following system packages:

```bash
# Debian/Ubuntu
sudo apt install libgtk-3-dev libwebkit2gtk-4.0-dev

# Fedora
sudo dnf install gtk3-devel webkit2gtk3-devel

# Arch
sudo pacman -S gtk3 webkit2gtk
```

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

### Development

```bash
git clone https://github.com/codex-coderex/ccc151-student-system.git
cd ccc151-student-system
wails dev
```

### Production Build

**Windows**
```bash
wails build -o Scholaris
# output: build/bin/Scholaris.exe
```

**Linux**
```bash
wails build -o Scholaris
# output: build/bin/Scholaris
chmod +x build/bin/Scholaris
```

> **Note:** The executable resolves the `data/` folder relative to its own location.
> **Note:** Due to this, when the executable builds in `/bin`, you must move it outside to the root `student-system` folder.

## Package Documentation 📦

| Package | Responsibility |
|---------|---------------|
| `models` | Defines the `Student`, `Program`, and `College` structs |
| `storage` | Reads, writes, and appends to CSV files — all calls are mutex-protected |
| `services` | Business logic — CRUD, import/export, cascading updates, and startup integrity check |
| `app.go` | Wails bindings — exposes service functions to the frontend as `window.go.main.App.MethodName()` |

Each entity in `services` follows the same pattern: `List`, `Get`, `Add`, `Update`, `Delete`. The `storage` package includes a `resolvePath` helper that locates the `data/` folder relative to the executable in production and falls back to the working directory in `wails dev`.

---

## Known Limitations ⚠️

- CSV storage is not suitable for concurrent multi-user access — this is a single-user desktop app
- No authentication or access control
- No dashboard or analytics view

---

## License

MIT
