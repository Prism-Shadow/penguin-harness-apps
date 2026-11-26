# AI Short Drama Studio

AI short drama storyboard and video workbench for PenguinHarness, built around the workflow of [DeepSeek Harness Book Chapter 8 (*The Cardboard House* / 《纸箱小屋》)](https://dshbook.penguin.ooo/chapter8/) and [`drama-skills`](https://github.com/zenstory-ai/drama-skills).

Open **AI Short Drama Studio** from your Agent's App Center to:

1. **AI Script Breakdown & Editable Storyboard**: Load the built-in *The Cardboard House* (`EP001 Rainy Night Visitor`) episode or paste your own single-episode screenplay. Automatically extract **Character Consistency Cards** (with appearance anchors and look variants), **Location & Lighting Views**, and an editable **Shot-by-Shot Storyboard Table** (shot number, characters, location, framing/camera motion, start/end boundaries, subtitle overlay, and text-to-video prompt).
2. **Real Video Generation & Single-Shot Non-Destructive Redo**: Connect to **Volcengine Ark Seedance** (`ARK_API_KEY` + `SEEDANCE_MODEL`), **MiniMax Hailuo Video / H3** (`MINIMAX_API_KEY` + `MINIMAX_VIDEO_MODEL`), an OpenAI-compatible video endpoint, or the built-in **FFmpeg Studio Engine**. Preview and confirm generation per shot or in batch, retry failed shots individually, and edit a single shot's prompt to regenerate **only that shot** while keeping every other generated shot and the timeline order untouched.
3. **Sequential Timeline Preview & Playable MP4 Export**: Preview all shots in timeline order with real-time subtitle overlays, synthesize the full episode into a standard `.mp4` film with `ffmpeg`, and download both the `.mp4` master and the non-destructive redo audit log.

[中文说明](README.zh.md)
