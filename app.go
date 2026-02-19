package main

import (
	"context"
	"student-system/models"
	"student-system/services"
)

// App is the main struct that Wails binds to the frontend
// every public method on App becomes callable from JavaScript
type App struct {
	ctx context.Context
}

func NewApp() *App {
	return &App{}
}

// startup is called when the app launches
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

// ── COLLEGES ──────────────────────────────────────────
// these get called from JS like:
// window.go.main.App.ListColleges()

func (a *App) ListColleges() ([]models.College, error) {
	return services.ListColleges()
}

func (a *App) AddCollege(code string, name string) error {
	return services.AddCollege(models.College{Code: code, Name: name})
}

func (a *App) UpdateCollege(code string, newCode string, name string) error {
	return services.UpdateCollege(code, models.College{Code: newCode, Name: name})
}

func (a *App) DeleteCollege(code string) error {
	return services.DeleteCollege(code)
}

// ── PROGRAMS ──────────────────────────────────────────

func (a *App) ListPrograms() ([]models.Program, error) {
	return services.ListPrograms()
}

func (a *App) AddProgram(code string, name string, collegeCode string) error {
	return services.AddProgram(models.Program{Code: code, Name: name, CollegeCode: collegeCode})
}

func (a *App) UpdateProgram(code string, newCode string, name string, collegeCode string) error {
	return services.UpdateProgram(code, models.Program{Code: newCode, Name: name, CollegeCode: collegeCode})
}

func (a *App) DeleteProgram(code string) error {
	return services.DeleteProgram(code)
}

// ── STUDENTS ──────────────────────────────────────────

func (a *App) ListStudents() ([]models.Student, error) {
	return services.ListStudents()
}

func (a *App) AddStudent(id string, firstName string, lastName string, programCode string, year string, gender string) error {
	return services.AddStudent(models.Student{
		ID: id, FirstName: firstName, LastName: lastName,
		ProgramCode: programCode, Year: year, Gender: gender,
	})
}

func (a *App) UpdateStudent(id string, newId string, firstName string, lastName string, programCode string, year string, gender string) error {
	return services.UpdateStudent(id, models.Student{
		ID: newId, FirstName: firstName, LastName: lastName,
		ProgramCode: programCode, Year: year, Gender: gender,
	})
}

func (a *App) DeleteStudent(id string) error {
	return services.DeleteStudent(id)
}
