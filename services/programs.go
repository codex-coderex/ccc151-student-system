package services

import (
	"errors"
	"unicode/utf8"

	"student-system/models"
	"student-system/storage"
)

const programFilePath = "data/programs.csv"

func validateProgramName(name string) error {
	if name == "" {
		return errors.New("program name is required")
	}
	if utf8.RuneCountInString(name) > 128 {
		return errors.New("program name must be 128 characters or fewer")
	}
	return nil
}

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
			continue
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
	if err := validateCode(program.Code, "Program code"); err != nil {
		return err
	}
	if err := validateProgramName(program.Name); err != nil {
		return err
	}

	if program.CollegeCode != "" {
		if _, err := GetCollege(program.CollegeCode); err != nil {
			return errors.New("college code does not exist")
		}
	}

	programs, err := ListPrograms()
	if err != nil {
		return err
	}

	for _, existing := range programs {
		if existing.Code == program.Code {
			return errors.New("program code already exists")
		}
		if existing.Name == program.Name {
			return errors.New("program name already exists")
		}
	}

	return storage.AppendCSV(programFilePath, programToRow(program))
}

func UpdateProgram(code string, updated models.Program) error {
	if err := validateCode(updated.Code, "Program code"); err != nil {
		return err
	}
	if err := validateProgramName(updated.Name); err != nil {
		return err
	}

	if updated.CollegeCode != "" {
		if _, err := GetCollege(updated.CollegeCode); err != nil {
			return errors.New("college code does not exist")
		}
	}

	rows, err := storage.ReadCSV(programFilePath)
	if err != nil {
		return err
	}

	// Check for duplicate name (excluding self)
	for i, row := range rows {
		if i == 0 {
			continue
		}
		if row[0] != code && row[1] == updated.Name {
			return errors.New("program name already exists")
		}
	}

	found := false
	for i, row := range rows {
		if i == 0 {
			continue
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

	newRows := [][]string{rows[0]}
	found := false
	for i, row := range rows {
		if i == 0 {
			continue
		}
		if row[0] == code {
			found = true
			continue
		}
		newRows = append(newRows, row)
	}

	if !found {
		return errors.New("program not found")
	}

	if err := storage.WriteCSV(programFilePath, newRows); err != nil {
		return err
	}

	return updateStudentProgramCode(code, "")
}
