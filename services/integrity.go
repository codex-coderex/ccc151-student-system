package services

import "student-system/storage"

func RunIntegrityCheck() error {
	// clear orphaned college codes
	colleges, err := ListColleges()
	if err != nil {
		return err
	}
	collegeSet := make(map[string]bool, len(colleges))
	for _, c := range colleges {
		collegeSet[c.Code] = true
	}

	programRows, err := storage.ReadCSV(programFilePath)
	if err != nil {
		return err
	}
	programDirty := false
	for i, row := range programRows {
		if i == 0 {
			continue // skip header
		}
		if len(row) >= 3 && row[2] != "" && !collegeSet[row[2]] {
			programRows[i][2] = ""
			programDirty = true
		}
	}
	if programDirty {
		if err := storage.WriteCSV(programFilePath, programRows); err != nil {
			return err
		}
	}

	// clear orphaned program codes
	programs, err := ListPrograms()
	if err != nil {
		return err
	}
	programSet := make(map[string]bool, len(programs))
	for _, p := range programs {
		programSet[p.Code] = true
	}

	studentRows, err := storage.ReadCSV(studentFilePath)
	if err != nil {
		return err
	}
	studentDirty := false
	for i, row := range studentRows {
		if i == 0 {
			continue // skip header
		}
		if len(row) >= 4 && row[3] != "" && !programSet[row[3]] {
			studentRows[i][3] = ""
			studentDirty = true
		}
	}
	if studentDirty {
		if err := storage.WriteCSV(studentFilePath, studentRows); err != nil {
			return err
		}
	}

	return nil
}
