# User Notes: Uncertainties and Caveats

## High Uncertainty

1. **API property names**: The exact shape of `registerInput` and `registerOutput` configs is uncertain. Properties like `serverPath`, the `type: "mp4"` literal, and the audio `initial.inputs` structure may not match the actual SDK API. These could be `path`, `filePath`, `url`, or something else entirely.

2. **Import paths**: I imported from `@swmansion/smelter` directly. The actual SDK may require imports from sub-paths like `@swmansion/smelter/components` or similar.

3. **React hook timing**: Using `setTimeout` inside `useEffect` assumes Smelter's React runtime maps time in a way compatible with standard timers. Smelter may have a dedicated timing/scheduling API (e.g., `useCurrentTimestamp` or offset-based transitions) that would be more correct.

## Medium Uncertainty

4. **Video start offset**: When `InputStream` first mounts after 3 seconds, it is unclear whether it plays from the beginning of the input file or from 3 seconds into it (if the input has been "playing" in the background). This is critical for correctness -- we want the full video after the title card, not a video missing its first 3 seconds.

5. **Audio during title card**: The audio config is set globally. During the title card (first 3 seconds), there may be unwanted audio from the input playing. A more robust solution might mute audio during the title card phase.

6. **Graceful termination**: The code does not implement end-of-stream detection. In production, you would need to detect when the input video ends and then finalize/close the output file.

## Low Uncertainty

7. **General architecture**: The overall pattern of init -> register input -> register output with React scene -> start is likely correct for Smelter.

8. **React component model**: Using JSX components like `View`, `Text`, `InputStream`, and `Rescaler` for scene composition aligns with Smelter's documented approach.
