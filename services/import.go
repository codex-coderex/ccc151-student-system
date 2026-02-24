package services

import (
	"encoding/csv"
	"fmt"
	"strings"

	"student-system/models"
)

// struct to hold import result
// it is held in here for readability
type ImportResult struct {
	Imported   int
	Merged     int
	Skipped    int
	Warnings   []string
	Errors     []string
	Duplicates []string
	HasDupes   bool
}

// parseCSV parses raw CSV text and returns rows (excluding header)
// returns an error if headers don't match expected
func parseCSV(text string, expected []string) ([][]string, error) {
	r := csv.NewReader(strings.NewReader(strings.TrimSpace(text)))
	all, err := r.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("could not parse CSV: %s", err)
	}
	if len(all) == 0 {
		return nil, fmt.Errorf("file is empty")
	}

	// normalize and compare headers
	got := make([]string, len(all[0]))
	for i, h := range all[0] {
		got[i] = strings.ToLower(strings.TrimSpace(h))
	}
	if len(got) != len(expected) {
		return nil, fmt.Errorf("invalid headers — expected: %s, got: %s",
			strings.Join(expected, ", "), strings.Join(got, ", "))
	}
	for i, h := range expected {
		if got[i] != h {
			return nil, fmt.Errorf("invalid headers — expected: %s, got: %s",
				strings.Join(expected, ", "), strings.Join(got, ", "))
		}
	}

	return all[1:], nil // skip header row
}

// colleges
func PreviewImportColleges(csvText string) ImportResult {
	rows, err := parseCSV(csvText, []string{"code", "name"})
	if err != nil {
		return ImportResult{Errors: []string{err.Error()}}
	}

	existing, _ := ListColleges()
	existingMap := make(map[string]bool)
	for _, c := range existing {
		existingMap[c.Code] = true
	}

	var result ImportResult
	for i, row := range rows {
		rowNum := i + 2
		if len(row) < 2 {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: expected 2 fields, got %d", rowNum, len(row)))
			continue
		}
		c := models.College{Code: strings.TrimSpace(row[0]), Name: strings.TrimSpace(row[1])}
		if err := validateCode(c.Code, "College code"); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			continue
		}
		if err := validateCollegeName(c.Name); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			continue
		}
		if existingMap[c.Code] {
			result.Duplicates = append(result.Duplicates, c.Code+" — "+c.Name)
			result.HasDupes = true
		} else {
			result.Imported++
		}
	}
	return result
}

func CommitImportColleges(csvText string, merge bool) ImportResult {
	rows, err := parseCSV(csvText, []string{"code", "name"})
	if err != nil {
		return ImportResult{Errors: []string{err.Error()}}
	}

	existing, _ := ListColleges()
	existingMap := make(map[string]bool)
	for _, c := range existing {
		existingMap[c.Code] = true
	}

	var result ImportResult
	for i, row := range rows {
		rowNum := i + 2
		if len(row) < 2 {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: expected 2 fields, got %d", rowNum, len(row)))
			continue
		}
		c := models.College{Code: strings.TrimSpace(row[0]), Name: strings.TrimSpace(row[1])}
		if err := validateCode(c.Code, "College code"); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			continue
		}
		if err := validateCollegeName(c.Name); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			continue
		}

		if existingMap[c.Code] {
			if merge {
				if err := UpdateCollege(c.Code, c); err != nil {
					result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
				} else {
					result.Merged++
				}
			} else {
				result.Skipped++
			}
		} else {
			if err := AddCollege(c); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			} else {
				result.Imported++
				existingMap[c.Code] = true // prevent duplicates within the same file
			}
		}
	}
	return result
}

// programs

func PreviewImportPrograms(csvText string) ImportResult {
	rows, err := parseCSV(csvText, []string{"code", "name", "college"})
	if err != nil {
		return ImportResult{Errors: []string{err.Error()}}
	}

	existing, _ := ListPrograms()
	existingMap := make(map[string]bool)
	for _, p := range existing {
		existingMap[p.Code] = true
	}

	colleges, _ := ListColleges()
	collegeMap := make(map[string]bool)
	for _, c := range colleges {
		collegeMap[c.Code] = true
	}

	var result ImportResult
	for i, row := range rows {
		rowNum := i + 2
		if len(row) < 3 {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: expected 3 fields, got %d", rowNum, len(row)))
			continue
		}
		p := models.Program{
			Code:        strings.TrimSpace(row[0]),
			Name:        strings.TrimSpace(row[1]),
			CollegeCode: strings.TrimSpace(row[2]),
		}
		if err := validateCode(p.Code, "Program code"); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			continue
		}
		if err := validateProgramName(p.Name); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			continue
		}
		if p.CollegeCode != "" && !collegeMap[p.CollegeCode] {
			result.Warnings = append(result.Warnings, fmt.Sprintf("row %d: college \"%s\" not found — will be imported as unenrolled", rowNum, p.CollegeCode))
		}
		if existingMap[p.Code] {
			result.Duplicates = append(result.Duplicates, p.Code+" — "+p.Name)
			result.HasDupes = true
		} else {
			result.Imported++
		}
	}
	return result
}

func CommitImportPrograms(csvText string, merge bool) ImportResult {
	rows, err := parseCSV(csvText, []string{"code", "name", "college"})
	if err != nil {
		return ImportResult{Errors: []string{err.Error()}}
	}

	existing, _ := ListPrograms()
	existingMap := make(map[string]bool)
	for _, p := range existing {
		existingMap[p.Code] = true
	}

	colleges, _ := ListColleges()
	collegeMap := make(map[string]bool)
	for _, c := range colleges {
		collegeMap[c.Code] = true
	}

	var result ImportResult
	for i, row := range rows {
		rowNum := i + 2
		if len(row) < 3 {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: expected 3 fields, got %d", rowNum, len(row)))
			continue
		}
		p := models.Program{
			Code:        strings.TrimSpace(row[0]),
			Name:        strings.TrimSpace(row[1]),
			CollegeCode: strings.TrimSpace(row[2]),
		}
		if err := validateCode(p.Code, "Program code"); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			continue
		}
		if err := validateProgramName(p.Name); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			continue
		}
		// clear invalid college codes
		if p.CollegeCode != "" && !collegeMap[p.CollegeCode] {
			result.Warnings = append(result.Warnings, fmt.Sprintf("row %d: college \"%s\" not found — imported as unenrolled", rowNum, p.CollegeCode))
			p.CollegeCode = ""
		}

		if existingMap[p.Code] {
			if merge {
				if err := UpdateProgram(p.Code, p); err != nil {
					result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
				} else {
					result.Merged++
				}
			} else {
				result.Skipped++
			}
		} else {
			if err := AddProgram(p); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			} else {
				result.Imported++
				existingMap[p.Code] = true
			}
		}
	}
	return result
}

// students

func PreviewImportStudents(csvText string) ImportResult {
	rows, err := parseCSV(csvText, []string{"id", "firstname", "lastname", "program", "year", "gender"})
	if err != nil {
		return ImportResult{Errors: []string{err.Error()}}
	}

	existing, _ := ListStudents()
	existingMap := make(map[string]bool)
	for _, s := range existing {
		existingMap[s.ID] = true
	}

	programs, _ := ListPrograms()
	programMap := make(map[string]bool)
	for _, p := range programs {
		programMap[p.Code] = true
	}

	var result ImportResult
	for i, row := range rows {
		rowNum := i + 2
		if len(row) < 6 {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: expected 6 fields, got %d", rowNum, len(row)))
			continue
		}
		s := models.Student{
			ID:          strings.TrimSpace(row[0]),
			FirstName:   strings.TrimSpace(row[1]),
			LastName:    strings.TrimSpace(row[2]),
			ProgramCode: strings.TrimSpace(row[3]),
			Year:        strings.TrimSpace(row[4]),
			Gender:      strings.TrimSpace(row[5]),
		}
		if err := validateStudentFields(s); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			continue
		}
		if s.ProgramCode != "" && !programMap[s.ProgramCode] {
			result.Warnings = append(result.Warnings, fmt.Sprintf("row %d: program \"%s\" not found — will be imported as unenrolled", rowNum, s.ProgramCode))
		}
		if existingMap[s.ID] {
			result.Duplicates = append(result.Duplicates, s.ID+" — "+s.FirstName+" "+s.LastName)
			result.HasDupes = true
		} else {
			result.Imported++
		}
	}
	return result
}

func CommitImportStudents(csvText string, merge bool) ImportResult {
	rows, err := parseCSV(csvText, []string{"id", "firstname", "lastname", "program", "year", "gender"})
	if err != nil {
		return ImportResult{Errors: []string{err.Error()}}
	}

	existing, _ := ListStudents()
	existingMap := make(map[string]bool)
	for _, s := range existing {
		existingMap[s.ID] = true
	}

	programs, _ := ListPrograms()
	programMap := make(map[string]bool)
	for _, p := range programs {
		programMap[p.Code] = true
	}

	var result ImportResult
	for i, row := range rows {
		rowNum := i + 2
		if len(row) < 6 {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: expected 6 fields, got %d", rowNum, len(row)))
			continue
		}
		s := models.Student{
			ID:          strings.TrimSpace(row[0]),
			FirstName:   strings.TrimSpace(row[1]),
			LastName:    strings.TrimSpace(row[2]),
			ProgramCode: strings.TrimSpace(row[3]),
			Year:        strings.TrimSpace(row[4]),
			Gender:      strings.TrimSpace(row[5]),
		}
		if err := validateStudentFields(s); err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			continue
		}
		// clear invalid program codes
		if s.ProgramCode != "" && !programMap[s.ProgramCode] {
			result.Warnings = append(result.Warnings, fmt.Sprintf("row %d: program \"%s\" not found — imported as unenrolled", rowNum, s.ProgramCode))
			s.ProgramCode = ""
		}

		if existingMap[s.ID] {
			if merge {
				if err := UpdateStudent(s.ID, s); err != nil {
					result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
				} else {
					result.Merged++
				}
			} else {
				result.Skipped++
			}
		} else {
			if err := AddStudent(s); err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("row %d: %s", rowNum, err))
			} else {
				result.Imported++
				existingMap[s.ID] = true
			}
		}
	}
	return result
}
