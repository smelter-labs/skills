# User Notes: Uncertainties and Caveats

## High Uncertainty

1. **Package name**: I am not 100% certain the web WASM package is called `@swmansion/smelter-web-wasm`. It could be `@swmansion/smelter-browser`, `@swmansion/smelter-web`, or another variant. The exact npm package name should be verified.

2. **Input registration API for MediaStream**: The exact API for registering a browser `MediaStream` as a Smelter input is uncertain. The parameter shapes (`type: "camera"`, `type: "stream"`, `stream: mediaStream`) are my best guesses but may not match the actual API.

3. **Canvas output mechanism**: I am not sure whether Smelter web outputs to a `<canvas>` element directly via a `canvas` output type, or if it provides a `MediaStream` output that you then attach to a `<video>` element. The output registration API shape may differ.

4. **Tiles component availability in web**: While I believe `Tiles` exists as a layout component in Smelter, I am not certain it is available in the web/WASM variant specifically.

## Medium Uncertainty

5. **React-like JSX usage**: I believe Smelter uses JSX components for scene description, but the exact import path and component names may differ.

6. **`updateOutput` method**: I am not certain whether dynamic scene updates use `updateOutput` or a different mechanism (e.g., React-style re-rendering with state changes).

7. **Resolution/video options shape**: The exact shape of video configuration options (resolution, etc.) may differ from what I described.

## Low Uncertainty

8. **General architecture**: Smelter is a video composition tool from Software Mansion that supports both server-side (Node.js) and client-side (browser/WASM) usage. This is fairly confident.

9. **No-server requirement**: The web/WASM variant does run client-side without needing a backend server for composition. This is the core value proposition of the web package.
