package services

import (
	"bytes"
	"encoding/csv"
)

func ExportColleges() (string, error) {
	colleges, err := ListColleges()
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	w := csv.NewWriter(&buf)

	w.Write([]string{"code", "name"})
	for _, c := range colleges {
		w.Write([]string{c.Code, c.Name})
	}
	w.Flush()
	return buf.String(), w.Error()
}

func ExportPrograms() (string, error) {
	programs, err := ListPrograms()
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	w := csv.NewWriter(&buf)

	w.Write([]string{"code", "name", "college"})
	for _, p := range programs {
		w.Write([]string{p.Code, p.Name, p.CollegeCode})
	}
	w.Flush()
	return buf.String(), w.Error()
}

func ExportStudents() (string, error) {
	students, err := ListStudents()
	if err != nil {
		return "", err
	}

	var buf bytes.Buffer
	w := csv.NewWriter(&buf)

	w.Write([]string{"id", "firstname", "lastname", "program", "year", "gender"})
	for _, s := range students {
		w.Write([]string{s.ID, s.FirstName, s.LastName, s.ProgramCode, s.Year, s.Gender})
	}
	w.Flush()
	return buf.String(), w.Error()
}
