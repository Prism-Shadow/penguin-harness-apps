# Screen Studio (`@penguinharness/screen-studio`)

[中文](README.zh.md)

Screen Studio is a PenguinHarness workbench for recording and editing product demo videos with spring-physics auto-zoom, cursor motion smoothing, click ripples, multi-track timeline editing, webcam picture-in-picture, and MP4/WebM export.

## Features

- **Spring-Physics Auto-Zoom**: Automatically clusters cursor click events into smooth zoom segments (`mellow`, `smooth`, `snappy`, and `instant` spring presets) with manual or follow-cursor camera modes.
- **On-Demand Native macOS Cursor Tracker**: Includes `workbenches/screen_studio/native/mouse_tracker.swift`, compiled on demand into the workbench cache directory on macOS to capture global mouse coordinates and click events during recording.
- **Interactive Demo Project & Video Import**: Opens with a built-in 12-second animated SaaS dashboard demo trajectory so every control works immediately, and supports recording a screen/window or importing local video files.
- **Canvas Framing & Export**: Customize wallpapers, padding, rounded corners, macOS window chrome, aspect ratios (`16:9`, `9:16`, `1:1`, `4:3`, `original`), webcam PiP overlay, clip speed/trimming, and export to `.mp4` or `.webm`.

## License

Apache-2.0
