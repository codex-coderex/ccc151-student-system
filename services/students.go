package services

import (
	"errors"
	"regexp"
	"strings"
	"unicode/utf8"

	"student-system/models"
	"student-system/storage"
)

const studentFilePath = "data/students.csv"

var studentIDPattern = regexp.MustCompile(`^\d{4}-\d{4}$`)
var namePattern = regexp.MustCompile(`^[a-zA-ZÀ-ÖØ-öø-ÿñÑ\s\-'.]+$`)

func validateStudentID(id string) error {
	if id == "" {
		return errors.New("student ID is required")
	}
	if !studentIDPattern.MatchString(id) {
		return errors.New("student ID must be in YYYY-NNNN format (e.g. 2024-0001)")
	}
	return nil
}

func validateStudentName(name, field string) error {
	if name == "" {
		return errors.New(field + " is required")
	}
	if utf8.RuneCountInString(name) > 64 {
		return errors.New(field + " must be 64 characters or fewer")
	}
	if !namePattern.MatchString(name) {
		return errors.New(field + " must contain letters only")
	}
	return nil
}

func validateStudentFields(s models.Student) error {
	if err := validateStudentID(s.ID); err != nil {
		return err
	}
	if err := validateStudentName(strings.TrimSpace(s.FirstName), "First name"); err != nil {
		return err
	}
	if err := validateStudentName(strings.TrimSpace(s.LastName), "Last name"); err != nil {
		return err
	}
	if s.Year == "" {
		return errors.New("year is required")
	}
	if s.Gender == "" {
		return errors.New("gender is required")
	}
	return nil
}

func rowToStudent(row []string) (models.Student, error) {
	if len(row) < 6 {
		return models.Student{}, errors.New("invalid row format")
	}

	return models.Student{
		ID:          row[0],
		FirstName:   row[1],
		LastName:    row[2],
		ProgramCode: row[3],
		Year:        row[4],
		Gender:      row[5],
	}, nil
}

func studentToRow(student models.Student) []string {
	return []string{
		student.ID, student.FirstName,
		student.LastName, student.ProgramCode,
		student.Year, student.Gender,
	}
}

func ListStudents() ([]models.Student, error) {
	rows, err := storage.ReadCSV(studentFilePath)
	if err != nil {
		return nil, err
	}

	var students []models.Student
	for i, row := range rows {
		if i == 0 {
			continue // skip header row
		}
		student, err := rowToStudent(row)
		if err != nil {
			return nil, err
		}
		students = append(students, student)
	}
	return students, nil
}

func GetStudent(id string) (*models.Student, error) {
	students, err := ListStudents()
	if err != nil {
		return nil, err
	}

	for i, student := range students {
		if student.ID == id {
			return &students[i], nil
		}
	}

	return nil, errors.New("student not found")
}

func AddStudent(student models.Student) error {
	if err := validateStudentFields(student); err != nil {
		return err
	}

	if student.ProgramCode != "" {
		if _, err := GetProgram(student.ProgramCode); err != nil {
			return errors.New("program code does not exist")
		}
	}

	students, err := ListStudents()
	if err != nil {
		return err
	}

	for _, existing := range students {
		if existing.ID == student.ID {
			return errors.New("student ID already exists")
		}
	}

	return storage.AppendCSV(studentFilePath, studentToRow(student))
}

func UpdateStudent(id string, updated models.Student) error {
	if err := validateStudentFields(updated); err != nil {
		return err
	}

	if updated.ProgramCode != "" {
		if _, err := GetProgram(updated.ProgramCode); err != nil {
			return errors.New("program code does not exist")
		}
	}

	rows, err := storage.ReadCSV(studentFilePath)
	if err != nil {
		return err
	}

	found := false
	for i, row := range rows {
		if i == 0 {
			continue
		}
		student, err := rowToStudent(row)
		if err != nil {
			return err
		}
		if student.ID == id {
			rows[i] = studentToRow(updated)
			found = true
			break
		}
	}

	if !found {
		return errors.New("student not found")
	}

	return storage.WriteCSV(studentFilePath, rows)
}

func DeleteStudent(id string) error {
	rows, err := storage.ReadCSV(studentFilePath)
	if err != nil {
		return err
	}

	newRows := [][]string{rows[0]}
	found := false
	for i, row := range rows {
		if i == 0 {
			continue
		}
		if row[0] == id {
			found = true
			continue
		}
		newRows = append(newRows, row)
	}

	if !found {
		return errors.New("student not found")
	}

	return storage.WriteCSV(studentFilePath, newRows)
}
