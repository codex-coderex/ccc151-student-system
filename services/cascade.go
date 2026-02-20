package services

import "student-system/storage"

func updateProgramCollegeCode(oldCode, newCode string) error {
	rows, err := storage.ReadCSV(programFilePath)
	if err != nil {
		return err
	}

	changed := false
	for i, row := range rows {
		if i == 0 {
			continue
		}
		if len(row) >= 3 && row[2] == oldCode {
			rows[i][2] = newCode
			changed = true
		}
	}

	if !changed {
		return nil
	}

	return storage.WriteCSV(programFilePath, rows)
}

func updateStudentProgramCode(oldCode, newCode string) error {
	rows, err := storage.ReadCSV(studentFilePath)
	if err != nil {
		return err
	}

	changed := false
	for i, row := range rows {
		if i == 0 {
			continue
		}
		if len(row) >= 4 && row[3] == oldCode {
			rows[i][3] = newCode
			changed = true
		}
	}

	if !changed {
		return nil
	}

	return storage.WriteCSV(studentFilePath, rows)
}
