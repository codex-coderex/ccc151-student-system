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

func AddProgram(program models.Program) error {
	if program.CollegeCode != "" {
		if _, err := GetCollege(program.CollegeCode); err == nil {
			return errors.New("college code does not exist")
		}
	}

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
	if updated.CollegeCode != "" {
		if _, err := GetCollege(updated.CollegeCode); err != nil {
			return errors.New("college code does not exist")
		}
	}

	rows, err := storage.ReadCSV(programFilePath)
	if err != nil {
		return err
	}

	found := false
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
			found = true
			break
		}
	}

	if !found {
		return errors.New("program not found")
	}

	if err := storage.WriteCSV(programFilePath, rows); err != nil {
		return err
	}

	if code != updated.Code {
		if err := updateStudentProgramCode(code, updated.Code); err != nil {
			return err
		}
	}

	return nil
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

	if err := storage.WriteCSV(programFilePath, newRows); err != nil {
		return nil
	}

	return updateStudentProgramCode(code, "")
}
