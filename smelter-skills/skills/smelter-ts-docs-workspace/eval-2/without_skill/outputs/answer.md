# Building a Browser-Based Video Conferencing App with Smelter

## Which Package to Use

For a browser-based video conferencing app that runs without a separate server, you should use the **`@swmansion/smelter-web-wasm`** package (the Smelter WebAssembly/Web client). This package allows you to run Smelter directly in the browser using WebAssembly, so there is no need for a separate backend server. It provides video composition capabilities entirely client-side.

> **Note:** Smelter also offers `@swmansion/smelter` (a Node.js server-side package), but since you explicitly want to avoid running a separate server, the web/WASM variant is the right choice.

## Installation

```bash
npm install @swmansion/smelter-web-wasm
```

You will also likely need a bundler that supports WASM (e.g., Vite, Webpack 5+).

## High-Level Setup

### 1. Initialize the Smelter Web Instance

```typescript
import Smelter from "@swmansion/smelter-web-wasm";

const smelter = new Smelter();
await smelter.init();
```

### 2. Register Input Streams from Participants' Cameras

Each participant's webcam feed needs to be registered as an input. You can capture camera streams using the browser's `navigator.mediaDevices.getUserMedia()` API and then register them with Smelter.

```typescript
// Get the local user's camera
const localStream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});

// Register the local camera as an input
await smelter.registerInput("local-camera", {
  type: "camera",
  stream: localStream,
});
```

For remote participants, you would receive their `MediaStream` objects via WebRTC and register each one:

```typescript
// When a remote participant's stream arrives via WebRTC
async function onRemoteStream(participantId: string, stream: MediaStream) {
  await smelter.registerInput(participantId, {
    type: "stream",
    stream: stream,
  });
}
```

### 3. Define the Grid Layout Using React-Like Components

Smelter uses a React-like component model to define how video streams are composed. You can define a grid layout using Smelter's built-in components like `View` and `InputStream`.

```tsx
import { View, InputStream, Tiles } from "@swmansion/smelter";

function VideoGrid({ participants }: { participants: string[] }) {
  return (
    <Tiles transition={{ durationMs: 300 }}>
      {participants.map((id) => (
        <InputStream key={id} inputId={id} />
      ))}
    </Tiles>
  );
}
```

The `Tiles` component automatically arranges its children in a grid layout, which is ideal for a video conferencing scenario. As participants join or leave, the grid adjusts automatically.

Alternatively, if you want manual grid control:

```tsx
function ManualGrid({ participants }: { participants: string[] }) {
  const cols = Math.ceil(Math.sqrt(participants.length));

  return (
    <View>
      {participants.map((id) => (
        <View key={id}>
          <InputStream inputId={id} />
        </View>
      ))}
    </View>
  );
}
```

### 4. Register the Output

Register an output that renders the composed scene. In the browser, this typically renders to a `<canvas>` element or produces a `MediaStream` you can display.

```typescript
await smelter.registerOutput("composed-output", {
  type: "canvas",
  video: {
    root: <VideoGrid participants={["local-camera", "remote-1", "remote-2"]} />,
    resolution: { width: 1920, height: 1080 },
  },
  canvas: canvasRef, // reference to a <canvas> HTML element
});
```

### 5. Start Rendering

```typescript
await smelter.start();
```

### 6. Updating the Scene When Participants Join/Leave

When participants join or leave, update the output to reflect the new set of participants:

```typescript
await smelter.updateOutput("composed-output", {
  video: {
    root: <VideoGrid participants={currentParticipantIds} />,
  },
});
```

## WebRTC Signaling

Smelter handles the video composition/rendering side, but you still need a signaling mechanism for WebRTC peer connections. For a truly "no server" setup, you could use:

- A third-party signaling service
- A serverless function (e.g., Cloudflare Workers, AWS Lambda) for minimal signaling
- A peer-to-peer signaling approach using something like PeerJS

The WebRTC data/media channels themselves are peer-to-peer and do not require a server once established.

## Summary

| Concern | Solution |
|---|---|
| Package | `@swmansion/smelter-web-wasm` |
| Runs in browser | Yes, via WebAssembly |
| Server required | No |
| Layout | Use `Tiles` component for automatic grid |
| Input sources | Register `MediaStream` objects from getUserMedia / WebRTC |
| Output | Render to a `<canvas>` element |

This setup gives you a fully client-side video conferencing compositor that arranges participants in a grid without needing any backend server for the rendering/composition logic.
