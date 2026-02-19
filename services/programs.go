package services

import (
	"errors"

	"student-system/models"
	"student-system/storage"
)

const programFilePath = "data/programs.csv"

func rowToProgram(row []string) (models.Program, error) {
	if len(row) < 3 {
		return models.Program{}, errors.New("invalid row format")
	}

	return models.Program{
		Code:        row[0],
		Name:        row[1],
		CollegeCode: row[2],
	}, nil
}

func programToRow(program models.Program) []string {
	return []string{program.Code, program.Name, program.CollegeCode}
}

func ListPrograms() ([]models.Program, error) {
	rows, err := storage.ReadCSV(programFilePath)
	if err != nil {
		return nil, err
	}

	var programs []models.Program
	for i, row := range rows {
		if i == 0 {
			continue // skip header row
		}
		program, err := rowToProgram(row)
		if err != nil {
			return nil, err
		}
		programs = append(programs, program)
	}

	return programs, nil
}

func GetProgram(code string) (*models.Program, error) {
	programs, err := ListPrograms()
	if err != nil {
		return nil, err
	}

	for i, program := range programs {
		if program.Code == code {
			return &programs[i], nil
		}
	}

	return nil, errors.New("program not found")
}

// TODO: add college checking
// -------------------------
// check if college code exists in all functions below this comment

func AddProgram(program models.Program) error {
	programs, err := ListPrograms()
	if err != nil {
		return err
	}

	// check for duplicate code
	for _, existing := range programs {
		if existing.Code == program.Code {
			return errors.New("program code already exists")
		}
	}

	return storage.AppendCSV(programFilePath, programToRow(program))
}

func UpdateProgram(code string, updated models.Program) error {
	rows, err := storage.ReadCSV(programFilePath)
	if err != nil {
		return err
	}

	for i, row := range rows {
		if i == 0 {
			continue // skip header row
		}
		program, err := rowToProgram(row)
		if err != nil {
			return err
		}
		if program.Code == code {
			rows[i] = programToRow(updated)
			return storage.WriteCSV(programFilePath, rows)
		}
	}

	return errors.New("program not found")
}

func DeleteProgram(code string) error {
	rows, err := storage.ReadCSV(programFilePath)
	if err != nil {
		return err
	}

	newRows := [][]string{rows[0]} // keep header
	found := false
	for i, row := range rows {
		if i == 0 {
			continue // skip header
		}
		if row[0] == code {
			found = true
			continue // skip this row to delete
		}
		newRows = append(newRows, row)
	}

	if !found {
		return errors.New("program not found")
	}
	return storage.WriteCSV(programFilePath, newRows)
}
