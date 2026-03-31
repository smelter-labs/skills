# Building a Browser-Based Video Conferencing App with Smelter

## Recommended Package: `@swmansion/smelter-web-wasm`

Since you want a browser-based app with no separate server, **`@swmansion/smelter-web-wasm`** is the right choice. It runs the entire Smelter rendering engine directly in the browser via WebAssembly inside a Web Worker -- no backend server required.

**Important limitation**: This package only works in Chrome and Chromium-based browsers.

## Installation

```bash
npm install @swmansion/smelter-web-wasm @swmansion/smelter
```

## Bundler Configuration

The WASM binary must be copied to your public/static assets so the browser can load it. Here is a Vite example:

```js
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [{
        src: path.join(path.dirname(require.resolve('@swmansion/smelter-browser-render')), 'smelter.wasm'),
        dest: 'assets',
      }],
    }),
  ],
  optimizeDeps: {
    exclude: ['@swmansion/smelter-web-wasm'],
    include: ['@swmansion/smelter-web-wasm > pino'],
  },
});
```

## Application Code

### 1. Initialize Smelter

```tsx
import Smelter from "@swmansion/smelter-web-wasm";
import { setWasmBundleUrl } from "@swmansion/smelter-web-wasm";
import { View, Tiles, InputStream, Text, useInputStreams } from "@swmansion/smelter";

// Point to the WASM bundle served from your static assets
setWasmBundleUrl('/assets/smelter.wasm');

const smelter = new Smelter({
  streamFallbackTimeoutMs: 5000,
});
```

### 2. Define the Conference Grid Scene

Use the `Tiles` component to arrange participants in a grid. It automatically calculates the optimal number of rows and columns based on the number of children and the tile aspect ratio.

```tsx
function ConferenceGrid() {
  const streams = useInputStreams();
  const activeInputs = Object.values(streams).filter(
    (s) => s.videoState === "playing"
  );

  return (
    <View style={{ width: 1280, height: 720, backgroundColor: "#1a1a1aFF" }}>
      {activeInputs.length > 0 ? (
        <Tiles
          style={{
            tileAspectRatio: "16:9",
            margin: 4,
            horizontalAlign: "center",
            verticalAlign: "center",
          }}
        >
          {activeInputs.map((stream) => (
            <InputStream key={stream.inputId} inputId={stream.inputId} />
          ))}
        </Tiles>
      ) : (
        <Text style={{ fontSize: 36, color: "#ffffffFF" }}>
          Waiting for participants...
        </Text>
      )}
    </View>
  );
}
```

### 3. Start Smelter and Register Inputs/Outputs

```tsx
async function startConference(canvasElement: HTMLCanvasElement) {
  // Initialize and start the WASM engine
  await smelter.init();
  await smelter.start();

  // Register the local user's camera (uses getUserMedia)
  await smelter.registerInput("local_camera", { type: "camera" });

  // Register the output to render onto an HTML canvas element
  await smelter.registerOutput("conference_view", <ConferenceGrid />, {
    type: "canvas",
    video: {
      canvas: canvasElement,
      resolution: { width: 1280, height: 720 },
    },
    audio: true,
  });
}
```

### 4. Add Remote Participants

For a real conferencing scenario, remote participants can join via WebRTC. Each remote participant's stream can be registered as a `MediaStream` input or pulled from a WHEP server:

```tsx
// Option A: Register a MediaStream obtained from WebRTC peer connection
async function addRemoteParticipant(id: string, mediaStream: MediaStream) {
  await smelter.registerInput(id, { type: "stream", stream: mediaStream });
}

// Option B: Pull from a WHEP server
async function addRemoteParticipantViaWhep(id: string, whepUrl: string) {
  await smelter.registerInput(id, {
    type: "whep_client",
    endpointUrl: whepUrl,
  });
}

// Remove a participant when they leave
async function removeParticipant(id: string) {
  await smelter.unregisterInput(id);
}
```

### 5. Shutdown

```tsx
async function stopConference() {
  await smelter.terminate();
}
```

## How It All Fits Together

1. **`setWasmBundleUrl`** tells the library where to fetch the WASM binary from.
2. **`smelter.init()`** boots the WASM engine in a Web Worker.
3. **`smelter.start()`** begins the rendering pipeline.
4. **`registerInput`** with `type: "camera"` calls `getUserMedia()` to capture the local camera and microphone.
5. **`registerOutput`** with `type: "canvas"` renders the React scene (`ConferenceGrid`) onto an HTML `<canvas>` element and plays mixed audio in the browser tab.
6. The **`Tiles`** component automatically arranges all `InputStream` children into a grid, recalculating the layout as participants join or leave.
7. **`useInputStreams()`** reactively provides the state of all registered inputs, so the scene re-renders when participants connect or disconnect.
8. Remote participants are added via `registerInput` using either a raw `MediaStream` (from your own WebRTC signaling) or `whep_client` (to pull from a WHEP endpoint).

## Key Points

- **No server needed**: The WASM runtime handles everything in-browser.
- **Chrome only**: `@swmansion/smelter-web-wasm` requires Chrome or a Chromium-based browser.
- **Tiles handles the grid**: You do not need to calculate rows/columns yourself. Just pass `InputStream` components as children and `Tiles` figures out the optimal arrangement.
- **Signaling is your responsibility**: Smelter handles rendering and composition, but you still need your own signaling mechanism (e.g., a simple WebSocket relay) to exchange WebRTC offers/answers between participants. Once you have a `MediaStream` from a peer connection, hand it to Smelter via `registerInput`.
