# Side channel

**Availability:** Node.js only.

The side channel is a Unix-socket stream of decoded media that Smelter exposes alongside its normal output. An external process (typically a Python sidecar) reads decoded RGBA video frames and PCM audio batches from a Smelter input — commonly to run ML inference (object detection, speech-to-text, etc.) and feed results back into the TypeScript app driving the composition.

> **Note:** Side channel is Node.js-only. The Browser (Client) and Browser (WASM) runtimes do not expose Unix sockets, so they have no side channel.

> **Note:** The side channel is read-only — the external process only consumes decoded data; it cannot push media into Smelter. To act on results (render boxes, subtitles, etc.) update React state in your Smelter app so the JSX composition re-renders.

## How it works

- On startup Smelter prepares a socket directory pointed to by the `SMELTER_SIDE_CHANNEL_SOCKET_DIR` env var. The directory must be empty (Smelter creates it if missing).
- When you register an input with `sideChannel` enabled, Smelter creates one Unix socket per enabled track inside that directory:
  - `video_<input_id>.sock` — decoded RGBA video frames.
  - `audio_<input_id>.sock` — decoded PCM audio batches.
- A consumer process connects to the socket and receives a stream of decoded frames/batches. Pushing results back into the Smelter Node.js app happens outside the side-channel protocol — typically over a websocket or HTTP endpoint your app exposes.

The underlying Unix-socket wire format is **not stable** and is not documented for direct use. The Python `smelter-sdk` package is currently the only supported consumer (see `./side-channel-python.md`). Run it as a sidecar to your TS app, with both processes pointing at the same `SMELTER_SIDE_CHANNEL_SOCKET_DIR`.

## TypeScript API surface

The side channel is configured entirely through the `sideChannel` field on the input config passed to `registerInput`. It is supported by **every Node.js input type** (see each input's reference page).

```tsx
type SideChannel = {
  video?: boolean;   // enable the decoded RGBA video socket (default: false)
  audio?: boolean;   // enable the decoded PCM audio socket (default: false)
  delayMs?: number;  // buffer frames this many ms ahead of the queue (default: 0)
};
```

### Enabling

```tsx
import Smelter from "@swmansion/smelter-node";

const smelter = new Smelter();
await smelter.init();
await smelter.registerInput("cam1", {
  type: "whip_server",
  sideChannel: { video: true, audio: true },
});
```

### `delayMs` — buffering frames ahead

By default the side channel publishes each frame at the moment the queue consumes it, leaving the subscriber no time to process it before it appears in the output. Set `sideChannel.delayMs` to buffer frames that many milliseconds ahead of the queue, so the subscriber receives them early and has roughly that long to react (e.g. run inference) before the frame is due in the composed output. Higher delays give more processing time at the cost of more end-to-end output latency.

```tsx
await smelter.registerInput("cam1", {
  type: "whip_server",
  sideChannel: { video: true, delayMs: 500 },
});
```

If the consumer can't keep up, Smelter logs `Side channel: dropping frame, channel full` and drops the oldest queued frames for that connection; the pipeline keeps running at full rate.

## Pattern: TS app + Python sidecar

Both guides below share the same wiring. The recurring pattern:

1. Register an input with `sideChannel` (video and/or audio) plus a `delayMs` that gives the sidecar time to process.
2. Hold the latest sidecar results in app state (e.g. a Zustand store).
3. Expose a local HTTP endpoint the sidecar POSTs results to; write to the store from outside React via `useStore.getState().setX(...)`, which re-renders the JSX.
4. Render the result in the composition reading from the store.

State store + HTTP endpoint:

```tsx
import { create } from "zustand";
import http from "node:http";

const useStore = create<{ value: T; setValue: (v: T) => void }>((set) => ({
  value: initial,
  setValue: (value) => set({ value }),
}));

http
  .createServer((req, res) => {
    if (req.method !== "POST" || req.url !== "/update") {
      res.statusCode = 404;
      res.end();
      return;
    }
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      const data = JSON.parse(body);
      useStore.getState().setValue(data /* ... */);
      res.end();
    });
  })
  .listen(3001, "127.0.0.1");
```

Input + output registration (shared shape):

```tsx
await smelter.registerInput("input", {
  type: "whip_server",
  bearerToken: "example",
  sideChannel: { video: true, delayMs: 200 }, // or { audio: true, delayMs: 5000 }
});

await smelter.registerOutput("output", <Composition />, {
  type: "whep_server",
  bearerToken: "example",
  video: {
    resolution: { width: 1920, height: 1080 },
    encoder: { type: "ffmpeg_h264", preset: "ultrafast" },
  },
  audio: { encoder: { type: "opus" } },
});

await smelter.start();
```

### Pattern: object detection (video)

YOLO sidecar tracks bounding boxes; the composition renders one animated `View` box per detection. Key points:

- Input uses `sideChannel: { video: true, delayMs: 200 }`.
- Detections are stored as normalized coords (`x`, `y`, `width`, `height` in `[0,1]`) plus a tracking `id`.
- Each box is a `View` positioned/sized from the normalized coords times output dimensions, with a `transition={{ durationMs: 200 }}` so it interpolates smoothly between updates.
- Use the tracking `id` as the React `key` so the same view is reused across frames (gives the transition a previous position to start from).

```tsx
function Box({ det }: { det: Detection }) {
  return (
    <View
      style={{
        left: Math.round(det.x * OUTPUT_W),
        top: Math.round(det.y * OUTPUT_H),
        width: Math.max(2, Math.round(det.width * OUTPUT_W)),
        height: Math.max(2, Math.round(det.height * OUTPUT_H)),
        borderWidth: 4,
        borderColor: "#00FF88FF",
        borderRadius: 6,
      }}
      transition={{ durationMs: 200 }}
    />
  );
}

function Composition() {
  const detections = useStore((s) => s.detections);
  return (
    <View style={{ width: OUTPUT_W, height: OUTPUT_H }}>
      <Rescaler><InputStream inputId="input" /></Rescaler>
      {detections.map((det, i) => (
        <Box key={det.id ?? `i-${i}`} det={det} />
      ))}
    </View>
  );
}
```

Python sidecar (`pip install smelter-sdk ultralytics opencv-python`):

```python
import json, urllib.request
import cv2
from smelter import subscribe_video_channel
from ultralytics import YOLO

def main():
    model = YOLO("yolov8n.pt")
    for frame in subscribe_video_channel("input"):
        bgr = cv2.cvtColor(frame.rgba, cv2.COLOR_RGBA2BGR)
        results = model.track(bgr, persist=True, verbose=False, classes=[0])
        if not results or results[0].boxes is None:
            continue
        boxes = results[0].boxes
        xyxy = boxes.xyxy.cpu().numpy()
        ids = (boxes.id.cpu().numpy().astype(int).tolist()
               if boxes.id is not None else [None] * len(xyxy))
        detections = [
            {"id": tid,
             "x": float(x1) / frame.width, "y": float(y1) / frame.height,
             "width": float(x2 - x1) / frame.width,
             "height": float(y2 - y1) / frame.height}
            for (x1, y1, x2, y2), tid in zip(xyxy, ids)
        ]
        post({"detections": detections})  # POST to http://127.0.0.1:3001/update
```

`model.track(..., persist=True)` keeps a per-target `id` across frames. `classes=[0]` restricts detection to people (COCO class 0); drop or change it for other objects.

### Pattern: speech-to-text (audio)

Whisper sidecar transcribes audio; the composition renders the latest line as a subtitle. Key points:

- Input uses `sideChannel: { audio: true, delayMs: 5000 }`.
- Match the transcription chunk length to `delayMs` (both `5000`) so the subtitle stays roughly in step with the spoken words.
- The composition reads `subtitle` from the store and renders a `Text` overlay.

```tsx
function Composition() {
  const subtitle = useStore((s) => s.subtitle);
  return (
    <View style={{ width: 1920, height: 1080 }}>
      <Rescaler><InputStream inputId="input" /></Rescaler>
      {subtitle && (
        <View style={{ bottom: 40, left: 80, width: 1760, height: 120,
                       backgroundColor: "#000000EE", paddingHorizontal: 40,
                       direction: "column" }}>
          <View />
          <Text style={{ width: 1680, fontSize: 40, color: "#FFFFFFFF",
                         align: "center" }}>
            {subtitle}
          </Text>
          <View />
        </View>
      )}
    </View>
  );
}
```

Python sidecar (`pip install smelter-sdk faster-whisper`) — read on one thread, transcribe on another, resampling to Whisper's 16 kHz:

```python
import queue, threading
import numpy as np
from faster_whisper import WhisperModel
from smelter import subscribe_audio_channel

WHISPER_SAMPLE_RATE = 16000
CHUNK_DURATION_MS = 5000  # matches the input's sideChannel.delayMs

def main():
    model = WhisperModel("base", compute_type="int8")
    chunks: queue.Queue[np.ndarray] = queue.Queue()

    def reader():
        buffer = np.empty(0, dtype=np.float32)
        for batch in subscribe_audio_channel("input"):
            samples = batch.to_mono()
            if batch.sample_rate != WHISPER_SAMPLE_RATE:
                ratio = WHISPER_SAMPLE_RATE / batch.sample_rate
                target = int(len(samples) * ratio)
                idx = np.linspace(0, len(samples) - 1, target)
                samples = np.interp(idx, np.arange(len(samples)), samples).astype(np.float32)
            buffer = np.concatenate([buffer, samples])
            if len(buffer) >= WHISPER_SAMPLE_RATE * CHUNK_DURATION_MS // 1000:
                chunks.put(buffer)
                buffer = np.empty(0, dtype=np.float32)

    threading.Thread(target=reader, daemon=True).start()
    while True:
        chunk = chunks.get()
        segments, _ = model.transcribe(chunk, language="en")
        for segment in segments:
            text = segment.text.strip()
            if text:
                post({"text": text})  # POST to http://127.0.0.1:3001/update
```

This naive fixed-chunking can mis-transcribe words landing on a chunk boundary.

## Running

Export the socket dir once in the shell, run the TS app, then the sidecar in the same shell:

```bash
export SMELTER_SIDE_CHANNEL_SOCKET_DIR=/tmp/smelter-sockets
tsx app.tsx        # starts side-channel sockets, waits for WHIP stream
python detect.py   # or transcribe.py
```

See `./side-channel-python.md` for the full Python consumer API.
