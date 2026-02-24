package services

import (
	"errors"
	"regexp"
	"unicode/utf8"

	"student-system/models"
	"student-system/storage"
)

const collegeFilePath = "data/colleges.csv"

var codePattern = regexp.MustCompile(`^[A-Za-z0-9\-]+$`)

func validateCode(code, field string) error {
	if code == "" {
		return errors.New(field + " is required")
	}
	if utf8.RuneCountInString(code) > 16 {
		return errors.New(field + " must be 16 characters or fewer")
	}
	if !codePattern.MatchString(code) {
		return errors.New(field + " must be letters, numbers, or hyphens only")
	}
	return nil
}

func validateCollegeName(name string) error {
	if name == "" {
		return errors.New("college name is required")
	}
	if utf8.RuneCountInString(name) > 128 {
		return errors.New("college name must be 128 characters or fewer")
	}
	return nil
}

func rowToCollege(row []string) (models.College, error) {
	if len(row) < 2 {
		return models.College{}, errors.New("invalid row format")
	}

	return models.College{
		Code: row[0],
		Name: row[1],
	}, nil
}

func collegeToRow(college models.College) []string {
	return []string{college.Code, college.Name}
}

func ListColleges() ([]models.College, error) {
	rows, err := storage.ReadCSV(collegeFilePath)
	if err != nil {
		return nil, err
	}

	var colleges []models.College
	for i, row := range rows {
		if i == 0 {
			continue
		}
		college, err := rowToCollege(row)
		if err != nil {
			return nil, err
		}
		colleges = append(colleges, college)
	}

	return colleges, nil
}

func GetCollege(code string) (*models.College, error) {
	colleges, err := ListColleges()
	if err != nil {
		return nil, err
	}

	for i, college := range colleges {
		if college.Code == code {
			return &colleges[i], nil
		}
	}

	return nil, errors.New("college not found")
}

func AddCollege(college models.College) error {
	if err := validateCode(college.Code, "College code"); err != nil {
		return err
	}
	if err := validateCollegeName(college.Name); err != nil {
		return err
	}

	colleges, err := ListColleges()
	if err != nil {
		return err
	}

	for _, existing := range colleges {
		if existing.Code == college.Code {
			return errors.New("college code already exists")
		}
		if existing.Name == college.Name {
			return errors.New("college name already exists")
		}
	}

	return storage.AppendCSV(collegeFilePath, collegeToRow(college))
}

func UpdateCollege(code string, updated models.College) error {
	if err := validateCode(updated.Code, "College code"); err != nil {
		return err
	}
	if err := validateCollegeName(updated.Name); err != nil {
		return err
	}

	rows, err := storage.ReadCSV(collegeFilePath)
	if err != nil {
		return err
	}

	// check for duplicate name (excluding self)
	for i, row := range rows {
		if i == 0 {
			continue
		}
		if row[0] != code && row[1] == updated.Name {
			return errors.New("college name already exists")
		}
	}

	found := false
	for i, row := range rows {
		if i == 0 {
			continue
		}
		if row[0] == code {
			rows[i] = collegeToRow(updated)
			found = true
			break
		}
	}

	if !found {
		return errors.New("college not found")
	}

	if err := storage.WriteCSV(collegeFilePath, rows); err != nil {
		return err
	}

	if code != updated.Code {
		if err := updateProgramCollegeCode(code, updated.Code); err != nil {
			return err
		}
	}

	return nil
}

func DeleteCollege(code string) error {
	rows, err := storage.ReadCSV(collegeFilePath)
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
		return errors.New("college not found")
	}

	if err := storage.WriteCSV(collegeFilePath, newRows); err != nil {
		return err
	}

	return updateProgramCollegeCode(code, "")
}
