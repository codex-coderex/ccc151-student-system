package services

import (
	"errors"

	"student-system/models"
	"student-system/storage"
)

const collegeFilePath = "data/colleges.csv"

func rowToCollege(row []string) (models.College, error) {
	if len(row) < 2 {
		return models.College{}, errors.New("invalid row format") // error checking is done in this function
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
			continue // skip header row
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
	colleges, err := ListColleges()
	if err != nil {
		return err
	}

	// Check for duplicate college code
	for _, existing := range colleges {
		if existing.Code == college.Code {
			return errors.New("college code already exists")
		}
	}

	return storage.AppendCSV(collegeFilePath, collegeToRow(college))
}

func UpdateCollege(code string, updated models.College) error {
	rows, err := storage.ReadCSV(collegeFilePath)
	if err != nil {
		return err
	}

	found := false
	for i, row := range rows {
		if i == 0 {
			continue // skip header
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
	return storage.WriteCSV(collegeFilePath, rows) // write everything back
}

func DeleteCollege(code string) error {
	rows, err := storage.ReadCSV(collegeFilePath)
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
		return errors.New("college not found")
	}
	return storage.WriteCSV(collegeFilePath, newRows) // write updated list back
}
