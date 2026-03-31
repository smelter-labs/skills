# Eval Execution Transcript

## Eval Prompt
"I want to build a browser-based video conferencing app where each participant's camera is shown in a grid. I don't want to run a separate server. Which Smelter package should I use and how do I set it up?"

## Skill
- Path: /home/jbrs/Documents/code/work/smelter/skills/smelter-skills/skills/smelter-ts-docs-workspace/eval-2/with_skill/skill/
- Name: smelter-ts-docs

## Execution

### Step 1: Read SKILL.md
**Action**: Read the main skill file to understand the overall Smelter SDK structure and determine which runtime package fits the user's requirements (browser-based, no separate server).
**Result**: The skill documents three runtime packages. The table clearly indicates `@swmansion/smelter-web-wasm` is for "Browser app, no server" -- runs Smelter as WASM in Web Worker, Chrome only. The skill also identifies `Tiles` as the component for "Multi-stream grids (e.g., video conferencing layout)".

### Step 2: Read WASM Runtime Reference
**Action**: Read `references/runtimes/web-wasm.md` for installation, configuration, class API, supported inputs/outputs, and lifecycle.
**Result**: Obtained full setup details: installation (`npm install @swmansion/smelter-web-wasm @swmansion/smelter`), the requirement to call `setWasmBundleUrl()`, Vite and Next.js bundler configs for copying the WASM binary, the Smelter class constructor options, lifecycle (init -> start -> register -> terminate), and WASM-specific input types (camera, screen_capture, stream, whep_client, mp4) and output types (canvas, stream, whip_client).

### Step 3: Read Tiles Component Reference
**Action**: Read `references/components/Tiles.md` for the grid layout component API.
**Result**: Tiles arranges children in equal-sized, non-overlapping tiles with automatic row/column calculation. Props include `style` (TilesStyleProps) and `transition`. Children that are non-layout components (like InputStream) scale proportionally to fit tiles.

### Step 4: Read Inputs Reference
**Action**: Read `references/inputs.md` for all input types, focusing on WASM-specific ones.
**Result**: WASM supports `camera` (getUserMedia), `screen_capture` (getDisplayMedia), `stream` (any MediaStream), `whep_client`, and `mp4` (URL only, no audio). The `camera` type is the natural choice for local participant video.

### Step 5: Read Outputs Reference
**Action**: Read `references/outputs.md` for WASM output types.
**Result**: WASM supports `canvas` (render to HTMLCanvasElement with optional audio playback), `stream` (returns MediaStream), and `whip_client` (WebRTC push). The `canvas` output is ideal for displaying the conference grid in the browser.

### Step 6: Read useInputStreams Hook Reference
**Action**: Read `references/hooks/useInputStreams.md` to understand how to reactively render based on participant join/leave.
**Result**: `useInputStreams()` returns a record of all registered inputs with their state (ready/playing/finished). This enables filtering to only show actively playing streams in the Tiles grid.

### Step 7: Read TilesStyleProps Reference
**Action**: Read `references/props/TilesStyleProps.md` for styling options.
**Result**: Supports `tileAspectRatio` (default "16:9"), `margin`, `padding`, `horizontalAlign`, `verticalAlign`, `backgroundColor`, `width`, `height`.

### Step 8: Compose Answer
**Action**: Wrote a complete answer recommending `@swmansion/smelter-web-wasm`, explaining why, and providing full setup code including: Vite config, Smelter initialization, a ConferenceGrid scene using Tiles and useInputStreams, input registration for local camera and remote participants, canvas output registration, and cleanup.
**Result**: Answer saved to `outputs/answer.md`.

## Final Result
The answer recommends `@swmansion/smelter-web-wasm` as the correct package for a browser-based video conferencing app with no separate server. It provides:
1. Installation commands
2. Vite bundler configuration for the WASM binary
3. Smelter initialization with `setWasmBundleUrl` and lifecycle calls
4. A `ConferenceGrid` React component using `Tiles` for automatic grid layout and `useInputStreams` for reactive participant rendering
5. Input registration for local camera (`type: "camera"`) and remote participants (via `MediaStream` or WHEP)
6. Canvas output registration for rendering to an HTML canvas with audio
7. Explanation of how all pieces connect and key caveats (Chrome-only, signaling is separate)

## Issues
None
