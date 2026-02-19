package models

type Student struct {
	ID          string
	FirstName   string
	LastName    string
	ProgramCode string
	Year        string
	Gender      string
}

type Program struct {
	Code        string
	Name        string
	CollegeCode string
}

type College struct {
	Code string
	Name string
}
