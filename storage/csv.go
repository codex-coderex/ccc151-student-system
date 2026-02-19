package storage

import (
	"encoding/csv"
	"os"
	"path/filepath"
	"sync"
)

var mu sync.RWMutex

// resolvePath converts a relative path like "data/colleges.csv"
// into an absolute path based on where the executable is located.
// This ensures the app finds its data folder regardless of the
// working directory Wails uses at launch.
func resolvePath(filename string) string {
	exe, err := os.Executable()
	if err != nil {
		return filename // fall back to relative if something goes wrong
	}
	return filepath.Join(filepath.Dir(exe), filename)
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
