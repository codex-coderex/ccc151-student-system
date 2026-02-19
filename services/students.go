package services

import (
	"errors"

	"student-system/models"
	"student-system/storage"
)

const studentFilePath = "data/students.csv"

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
		student.Year, student.Gender}
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
	students, err := ListStudents()
	if err != nil {
		return err
	}

	// check for duplicate id
	for _, existing := range students {
		if existing.ID == student.ID {
			return errors.New("student ID already exists")
		}
	}

	return storage.AppendCSV(studentFilePath, studentToRow(student))
}

func UpdateStudent(id string, updated models.Student) error {
	rows, err := storage.ReadCSV(studentFilePath)
	if err != nil {
		return err
	}

	found := false
	for i, row := range rows {
		if i == 0 {
			continue // skip header row
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

	newRows := [][]string{rows[0]} // keep header
	found := false
	for i, row := range rows {
		if i == 0 {
			continue // skip header row
		}
		if row[0] == id {
			found = true
			continue // skip this row to delete
		}
		newRows = append(newRows, row)
	}

	if !found {
		return errors.New("student not found")
	}
	return storage.WriteCSV(studentFilePath, newRows)
}
