package main

import (
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

// embed the entire frontend folder into the binary
//
//go:embed all:frontend
var assets embed.FS

func main() {
	// create our app
	app := NewApp()

	// launch the Wails window
	err := wails.Run(&options.App{
		Title:  "MSU-IIT Student Information System",
		Width:  1200,
		Height: 750,
		AssetServer: &assetserver.Options{
			Assets: assets, // serve our HTML/CSS/JS from here
		},
		BackgroundColour: &options.RGBA{R: 14, G: 15, B: 17, A: 1},
		OnStartup:        app.startup,
		Bind: []interface{}{
			app, // expose App methods to JavaScript
		},
	})

	if err != nil {
		log.Fatal(err)
	}
}
