# Transcript: Lower-Third Overlay in Smelter (Without Skill)

## Task

The user asked: "How do I render a lower-third text overlay with a semi-transparent dark background on top of a live video stream in Smelter? I'm using Node.js."

## Approach

I relied entirely on my built-in knowledge of the `@swmansion/smelter` and `@swmansion/smelter-node` packages. My understanding is that Smelter uses a React-like JSX component model to describe video scene composition, and provides primitives like `View`, `Text`, `InputStream`, and `Rescaler`.

## Steps Taken

1. **Recalled the Smelter API model**: Smelter uses a declarative scene graph expressed in JSX/TSX. Components like `<View>`, `<Text>`, `<InputStream>`, and `<Rescaler>` are the building blocks. Scenes are assigned to outputs via the `root` property in the video configuration.

2. **Designed the scene layout**:
   - A root `<View>` at 1920x1080.
   - A `<Rescaler>` wrapping `<InputStream>` to fill the frame with the live video.
   - An absolutely-positioned `<View>` at the bottom of the frame with a semi-transparent dark background (`#000000AA`).
   - Two `<Text>` elements inside for the name and subtitle.

3. **Set up the Smelter pipeline**:
   - Created a `Smelter` instance and called `init()`.
   - Registered an RTP input stream on port 9001.
   - Registered an RTP output stream on port 9002 with the scene component as the `root`.

4. **Wrote the code** to `answer.tsx`.

## Key Decisions

- Used RTP streams for both input and output as a common live-streaming transport in Smelter examples.
- Used `position: "absolute"` with `bottom: 0` for the lower-third positioning.
- Used `#000000AA` (hex with alpha) for the semi-transparent dark background.
- Used H.264 video encoding and Opus audio encoding as they are the standard codecs in Smelter.

## Tool Usage Summary

- **Bash**: 1 call (mkdir)
- **Write**: 5 calls (answer.tsx, transcript.md, user_notes.md, metrics.json)
- **Read**: 0 calls
- **Grep/Glob**: 0 calls
