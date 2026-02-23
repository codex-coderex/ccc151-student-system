package storage

import (
	"encoding/csv"
	"errors"
	"os"
	"path/filepath"
	"sync"
)

var mu sync.RWMutex

// resolvePath converts a relative path like "data/colleges.csv" into an
// absolute path. In production the exe sits next to the data/ folder, so we
// resolve from the executable's directory. In wails dev mode the exe is a
// temp debug binary, so we fall back to the working directory (project root).
func resolvePath(filename string) string {
	exe, err := os.Executable()
	if err != nil {
		return filename
	}

	exeDir := filepath.Dir(exe)
	candidate := filepath.Join(exeDir, filename)

	// if the file exists relative to the exe, use that (production)
	// otherwise fall back to working directory (dev)
	if _, err := os.Stat(filepath.Join(exeDir, "data")); err == nil {
		return candidate
	}

	if wd, err := os.Getwd(); err == nil {
		return filepath.Join(wd, filename)
	}

	return filename
}

func ReadCSV(filename string) ([][]string, error) {
	mu.RLock()
	defer mu.RUnlock()

	path := resolvePath(filename)

	if _, err := os.Stat(path); os.IsNotExist(err) {
		return [][]string{}, nil
	}

	file, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	rows, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	if len(rows) == 0 {
		return [][]string{}, nil
	}

	return rows, nil
}

func WriteCSV(filename string, rows [][]string) error {
	mu.Lock()
	defer mu.Unlock()

	path := resolvePath(filename)

	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}

	file, err := os.Create(path)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	return writer.WriteAll(rows)
}

func AppendCSV(filename string, row []string) error {
	mu.Lock()
	defer mu.Unlock()

	path := resolvePath(filename)

	if err := os.MkdirAll(filepath.Dir(path), 0755); err != nil {
		return err
	}

	_, statErr := os.Stat(path)
	isNewFile := os.IsNotExist(statErr)

	file, err := os.OpenFile(path, os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	if isNewFile {
		var header []string
		switch filepath.Base(filename) {
		case "colleges.csv":
			header = []string{"code", "name"}
		case "programs.csv":
			header = []string{"code", "name", "college"}
		case "students.csv":
			header = []string{"id", "firstname", "lastname", "program", "year", "gender"}
		default:
			return errors.New("unknown CSV file")
		}

		if header != nil {
			if err := writer.Write(header); err != nil {
				return err
			}
		}
	}
	return writer.Write(row)
}
