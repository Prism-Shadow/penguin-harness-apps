---
name: short-drama-studio
description: Break down single-episode short drama scripts into character consistency cards, location views, and shot-by-shot storyboards with Seedance / MiniMax H3 video prompts; revise individual shots non-destructively and coordinate with the AI Short Drama Studio workbench. Use when the user asks to write or break down a short drama episode, design character consistency anchors, write or refine storyboard shots and video prompts, redo a single shot, or export an episode in Short Drama Studio.
version: 2026.11.25.1
---

# AI Short Drama Studio Skill

This skill integrates the production methodology of DeepSeek Harness Chapter 8 (*The Cardboard House* / 《纸箱小屋》) and `drama-skills` with the **AI Short Drama Studio** workbench (`short-drama-studio`).

## Core Methodology: Three Layers of Consistency

1. **Character Consistency Anchors (`identityAnchors` & `looks`)**:
   - Separate permanent physical traits (`identityAnchors`, e.g. `"round face with large amber eyes and pink nose"`, `"orange back fur and white chest/belly color blocks"`, `"high ponytail reaching shoulder blades and warm-colored apron over store uniform"`) from temporary scene states (`looks`, e.g. `LOOK-CAT-RAIN` soaked flat fur in `SC001-SC005` vs `LOOK-CAT-BASE` dry fluffy fur in `SC006-SC008`).
   - Every text-to-video prompt for a shot MUST explicitly include the active appearance anchors of every character present in that shot so cross-shot identity never drifts.

2. **Location & Lighting Views (`fixedAnchors` & `views`)**:
   - Define fixed spatial anchors (`glass door`, `doormat`, `eave`, `shelves`, `oden pot`) separately from time/weather lighting variants (`VIEW-STORE-EXT-RAINY-NIGHT` cold blue rain + warm interior glow vs `VIEW-STORE-EXT-DAWN` warm morning sunlight + dew).

3. **Three-Step Shot & Video Prompt Writing (`Start -> Timed Action Sequence -> End`)**:
   - **Start boundary**: Describe the static opening pose, facing direction, gaze target, and hands/held props at `0s` without leaking later actions into the opening frame.
   - **Timed action segments**: Organize actions causally (`0-1s`, `1-2.5s`, `2.5-4s`, `4-5s`), specifying who moves, what contact point they reach, camera behavior (locked or motivated move), and sound timeline.
   - **End boundary**: Verify the final pose, gaze, and prop placement match the next shot's opening continuity.
   - **Subtitles**: Keep screen text (`subtitle`) as a post-production overlay field and end the video generation prompt with `No readable text in the frame.`

## Workbench Data Location & Collaboration

The Short Drama Studio workbench stores its active project files under:

```
<Agent directory>/app/data/<Agent ID>.short-drama-studio/
├── project.json                # Active episode script, character cards, location cards, shots, and audit log
├── videos/
│   ├── SHOT-001.mp4            # Individual per-shot MP4 files (bound 1:1 to each shotId)
│   └── ...
└── exports/
    └── episode-EP001.mp4       # Synthesized full-episode playable MP4
```

When modifying a single shot (such as `SHOT-007`) in `project.json` or through the workbench:
- Update only the target shot's `videoPrompt`, `actionDescription`, `cameraMotion`, or `subtitle`, and mark only that shot's status as `"modified"`.
- Never overwrite or invalidate other shots' generated `.mp4` files or timeline ordering.
