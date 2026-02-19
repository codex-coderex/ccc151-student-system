# CCC151 Student Information System 🎓

A lightweight, CSV-backed desktop application for managing Students, Programs, and Colleges — built with Go and Wails for a native desktop experience with no external database required.

---


The CCC151 Student Information System is a fully offline desktop app built on the [Wails](https://wails.io/) framework, combining a Go backend with a plain JavaScript frontend. All data is persisted to local CSV files, making it portable and easy to set up with zero configuration. The app supports full CRUD operations across three core entities — Students, Programs, and College.

---

## Highlights ✅

- Three fully managed directories: Students, Programs, and Colleges
- Create, read, update, delete, and list flows with validation
- Local CSV storage — no database, no setup, fully portable
- Fast in-memory search across all fields
- Concurrent-safe file access using `sync.RWMutex`
- Automatic data directory resolution regardless of executable location
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
| ID | string | Unique student identifier e.g. `2024-0001` |
| FirstName | string | Student's first name |
| LastName | string | Student's last name |
| ProgramCode | string | References a Program |
| Year | string | Year level 1–4 |
| Gender | string | Male / Female |

**Programs**
| Field | Type | Description |
|-------|------|-------------|
| Code | string | Unique program code e.g. `BSCS` |
| Name | string | Full program name |
| CollegeCode | string | References a College |

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
│   └── student.csv
├── frontend/
│   ├── app.js
│   ├── index.html
│   └── style.css
├── models/
│   └── models.go          # Student, Program, College structs
├── services/
│   ├── colleges.go        # CRUD logic for colleges
│   ├── programs.go        # CRUD logic for programs
│   └── students.go        # CRUD logic for students
├── storage/
│   └── csv.go             # CSV read/write/append with mutex
├── app.go                 # Wails bindings — exposes Go methods to JS
├── main.go                # Entry point and Wails window config
├── go.mod
├── go.sum
└── wails.json
```

---

## Getting Started 🚀

### Prerequisites

- [Go 1.21+](https://go.dev/dl/)
- [Wails v2](https://wails.io/docs/gettingstarted/installation) (https://wails.io/)
- [Node.js](https://nodejs.org/) — required internally by Wails

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

```bash
wails build
# output: build/bin/student-system.exe
```

---

## Package Documentation 📦

| Package | Responsibility |
|---------|---------------|
| `models` | Defines the `Student`, `Program`, and `College` structs |
| `storage` | Reads, writes, and appends to CSV files — all calls are mutex-protected |
| `services` | Business logic — CRUDL operations with duplicate checking and error handling |
| `app.go` | Wails bindings — exposes service functions to the frontend as `window.go.main.App.MethodName()` |

Each entity in `services` follows the same pattern: `List`, `Get`, `Add`, `Update`, `Delete`. The `storage` package handles the actual file I/O and includes a `resolvePath` helper that walks up from the executable to find the `data/` folder automatically.

---

## TODO 📋

- [ ] CSV import and export for bulk data entry
- [ ] User authentication with role-based access — admins manage colleges and programs, regular users manage student records only
- [ ] Dashboard page with enrollment statistics and graphs by program, college, year level, and gender
- [ ] Cascading deletes — removing a college or program flags or updates dependent records
- [ ] Packaged installer for distribution without manual setup
- [ ] Stricter input validation — ID format, field length limits, duplicate name detection
- [ ] Audit log to track record changes over time

---

## Known Limitations ⚠️

- CSV storage is not suitable for concurrent multi-user access — this is a single-user desktop app
- Deleting a college or program does not update student or program records that reference it
- No authentication or access control in the current version

---

## License

MIT
