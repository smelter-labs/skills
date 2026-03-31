# Transcript: Title Card + Video with Smelter (No Skill)

## Task
Write a Node.js Smelter program that adds a 3-second title card before an MP4 video and outputs a new MP4 file.

## Approach

I relied entirely on my built-in knowledge of the `@swmansion/smelter` TypeScript SDK. My recollection of the API includes:

1. **Smelter class** - The main entry point. You instantiate it, call `init()`, register inputs/outputs, and `start()`.
2. **React-based scene description** - Smelter uses React/JSX components (`View`, `Text`, `InputStream`, `Rescaler`) to describe the video scene graph.
3. **Input registration** - `registerInput(id, config)` for MP4 files with a `type: "mp4"` and a `serverPath`.
4. **Output registration** - `registerOutput(id, config)` for MP4 output with video resolution, a root React component, and audio config.
5. **State management** - Standard React `useState`/`useEffect` hooks to transition from the title card to the video after 3 seconds.

## Key Decisions

- **Title card as a React component**: I used a `View` with a centered `Text` element on a black background for the title card.
- **Transition via `setTimeout`**: After 3000ms, a state change swaps from the title card to the video stream. This is a straightforward approach using React hooks.
- **`InputStream` + `Rescaler`**: The video is rendered via `InputStream` referencing the registered input ID, wrapped in a `Rescaler` to fit the output dimensions.
- **Audio passthrough**: The audio config references the input so audio from the original video is included (though during the title card portion, behavior depends on Smelter's handling -- the video input may not be producing frames yet if we delay it).

## Uncertainties

- **Exact API shape**: I am not fully confident in the exact property names for `registerInput` and `registerOutput`. The `serverPath` vs `path` vs `url` naming, and the exact structure of the audio config, may differ from what I wrote.
- **Timing model**: Whether `setTimeout` in a Smelter React component maps to real output time or wall-clock time is uncertain. Smelter may have its own timing primitives.
- **Input offset / delayed start**: The current approach conditionally renders the `InputStream` after 3 seconds. It is unclear if Smelter buffers the input from the start or if the input begins playing only when the `InputStream` component mounts. This could cause the first few seconds of the original video to be skipped.
- **Graceful shutdown**: I did not implement precise end-of-stream detection. A production solution would listen for the input stream to end and then close the smelter/output.
- **Component imports**: The exact import paths (`@swmansion/smelter` vs `@swmansion/smelter/components`) may differ.

## Tools Used

- **Bash**: 1 call (mkdir)
- **Write**: 4 calls (answer.tsx, transcript.md, user_notes.md, metrics.json)
- **Read**: 0 calls
- **Grep/Glob**: 0 calls

Total tool calls: 5
