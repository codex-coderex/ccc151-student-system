package storage

import (
	"encoding/csv"
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

	file, err := os.Open(resolvePath(filename))
	if err != nil {
		return nil, err
	}
	defer file.Close()

	reader := csv.NewReader(file)
	rows, err := reader.ReadAll()
	if err != nil {
		return nil, err
	}

	return rows, nil
}

func WriteCSV(filename string, rows [][]string) error {
	mu.Lock()
	defer mu.Unlock()

	file, err := os.Create(resolvePath(filename))
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

	file, err := os.OpenFile(resolvePath(filename), os.O_APPEND|os.O_WRONLY|os.O_CREATE, 0644)
	if err != nil {
		return err
	}
	defer file.Close()

	writer := csv.NewWriter(file)
	defer writer.Flush()

	return writer.Write(row)
}
