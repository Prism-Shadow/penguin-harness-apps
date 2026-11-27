# PixCake Studio (像素蛋糕个人版)

**PixCake Studio** (`@penguinharness/pixcake`) is a local portrait and travel photo retouching workbench for PenguinHarness. Open it from the Agent's App Center or workbench tab to retouch portraits with skin smoothing, facial and body reshaping, makeup enhancements, and film color grading right in the browser.

## Features

- **Frequency-Preserving Skin Retouching**: Smooths skin while keeping natural pore texture, removes blemishes, softens dark circles and nasolabial folds, and brightens skin tone with cold-white and rosy adjustments.
- **40×50 2D Mesh Facial & Body Reshaping**: Adjusts head proportion, jawline, chin, hairline, eye size, eye distance, nose wing, nose bridge, smile curve, lip fullness, leg length, waist, hips, and shoulder line with draggable landmark anchors.
- **Catchlight & Makeup Enhancements**: Brightens eyes with ring catchlights, whitens teeth, and applies lip tint, blush, and T-zone contouring.
- **Travel Film LUTs & Color Grading**: Includes built-in film LUT presets (Cold White, Creamy Film, Fuji CC, Kamakura, Cinema Gold) alongside exposure, contrast, highlights, shadows, temperature, saturation, clarity, and vignette sliders.
- **Interactive Brushes & Split Comparison**: Provides a manual liquify push brush, a spot-healing blemish brush with undo history, a draggable before/after split curtain, and custom recipe saving.

## Your Data & Privacy

- **Local Processing**: All image rendering, skin smoothing, mesh warping, and LUT color grading run locally in your browser's Canvas. No photos are uploaded to external third-party servers.
- **Saved State & Exports**: Active slider parameters and custom recipes are stored in the workbench's state on your PenguinHarness server (`GET /state`, `POST /state`, `POST /presets`, `DELETE /presets/:id`). Exported high-resolution JPEGs (`POST /export`, `GET /export/:fileName`) are saved in the workbench's local `dataDir/exports` folder on your PenguinHarness host.

## License

Apache-2.0, see [LICENSE](LICENSE).
