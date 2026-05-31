# Side Channel Reference

Node.js only. Side channel is a Unix-socket stream of decoded media that Smelter exposes alongside its normal output, so an external process can read decoded RGBA video frames and PCM audio batches from any registered Smelter input. Typical use: run ML inference (e.g. YOLO, Whisper) in a Python sidecar and feed results back into the React composition the TS app is driving.

> **Note**: Browser (Client) and Browser (WASM) runtimes don't expose Unix sockets and have no side channel.

> **Note**: Side channel is **read-only**. Consumers receive decoded data; they do not push media into Smelter. To act on results in the composition, update React state in the TS app so the JSX re-renders.

## Table of Contents

- [Enabling Side Channel](#enabling-side-channel) — Per-input config
  - [Buffering ahead with `delayMs`](#buffering-ahead-with-delayms) — Give the consumer a head start; trade-offs
- [Socket Layout](#socket-layout) — File naming + `SMELTER_SIDE_CHANNEL_SOCKET_DIR`
- [Consuming Data](#consuming-data) — Python SDK (sync + async)
- [Python API Surface](#python-api-surface) — Functions, frame/batch types
- [Architecture Pattern](#architecture-pattern) — Sidecar feedback loop, gotchas, example shapes

---

## Enabling Side Channel

`sideChannel` is a per-input option, supported on every Node.js input type (`mp4`, `hls`, `rtp_stream`, `rtmp_server`, `whip_server`, `whep_client`, `v4l2`):

```tsx
type SideChannel = {
  video?: boolean;    // publish decoded RGBA frames, default false
  audio?: boolean;    // publish decoded PCM batches,  default false
  delayMs?: number;   // buffer frames this many ms ahead of the queue, default 0
};
```

```tsx
await smelter.registerInput("cam1", {
  type: "whip_server",
  sideChannel: { video: true, audio: true },
});
```

### Buffering ahead with `delayMs`

By default each frame is published to the side channel at the moment the queue consumes it, leaving the consumer **no head start**: the frame is already due in the output. Set `delayMs` to delay this input's contribution to the composed output by that many milliseconds; Smelter buffers the frames ahead and hands them to the subscriber early, so it has roughly `delayMs` to react (run inference, transcribe, ...) before the matching frame is rendered.

```tsx
sideChannel: { video: true, delayMs: 200 }   // give a detector ~200ms per frame
sideChannel: { audio: true, delayMs: 5000 }  // give a 5s transcription chunk time to finish
```

Higher `delayMs` buys more processing time at the cost of end-to-end latency on the output. Match it to the analysis latency (see [Architecture Pattern](#architecture-pattern)).

> **Caution**: `delayMs` is a single per-input value; it applies to **both** the video and audio tracks of that input. If one input feeds slow audio analysis (e.g. a 5s speech-to-text chunk) and you also enable its video track, every decoded RGBA frame is buffered for that same long delay. At 1080p that is ~8 MB/frame, so a multi-second delay can hold gigabytes in memory. When the two tracks need very different lead times, prefer separate inputs (or enable only the track you actually consume).

> **Note** (backpressure): if the consumer can't keep up, Smelter logs `Side channel: dropping frame, channel full` on the server side and drops the **oldest** queued frames for that connection. The pipeline keeps running at full rate; the side channel never stalls the output.

## Socket Layout

Smelter writes one Unix socket per enabled track into the directory pointed to by `SMELTER_SIDE_CHANNEL_SOCKET_DIR`. The directory must be empty (Smelter creates it if missing).

| File | Payload |
|---|---|
| `video_<input_id>.sock` | Decoded RGBA video frames |
| `audio_<input_id>.sock` | Decoded PCM audio batches |

Set `SMELTER_SIDE_CHANNEL_SOCKET_DIR` on **both** the Smelter Node.js process and the consumer process so they agree on the path. The underlying wire format is **not stable** and is not documented for direct use — consume only via `smelter-sdk`.

## Consuming Data

The `smelter-sdk` Python package is currently the only supported consumer. Install in the sidecar environment:

```bash
pip install smelter-sdk
```

Requires Python 3.11+ and NumPy 1.26+.

Synchronous iteration:

```python
from smelter import subscribe_video_channel

for frame in subscribe_video_channel("cam1"):
    run_inference(frame.rgba)  # numpy (H, W, 4) uint8
```

Asyncio variant lives under `smelter.aio` with the same signatures:

```python
import asyncio
from smelter.aio import subscribe_video_channel

async def main():
    async for frame in subscribe_video_channel("cam1"):
        await run_inference(frame.rgba)

asyncio.run(main())
```

Heavy sync work inside an asyncio loop should be wrapped in `asyncio.to_thread(...)` so it does not block other tasks.

`SMELTER_SIDE_CHANNEL_SOCKET_DIR` is auto-detected from the environment. To override per-call, pass a `Context`:

```python
from smelter import Context, subscribe_video_channel

ctx = Context(socket_dir="/var/run/smelter")
for frame in subscribe_video_channel("cam1", ctx=ctx):
    ...
```

If the variable is unset and no `ctx` is passed, the SDK falls back to the current working directory.

## Python API Surface

All functions exist in both `smelter` (sync, returns iterators) and `smelter.aio` (async, returns async iterators).

### subscribe_video_channel

```python
def subscribe_video_channel(
    input_id: str,
    *,
    ctx: Context | None = None,
    timeout: float | None = None,
) -> Iterator[VideoFrame]
```

Waits for `video_<input_id>.sock` to appear, then yields frames until the server closes the socket. `timeout` applies to socket discovery only; iteration blocks indefinitely once connected. `None` waits forever. Raises `ChannelNotFound` if discovery times out.

### subscribe_audio_channel

```python
def subscribe_audio_channel(
    input_id: str,
    *,
    ctx: Context | None = None,
    dtype: np.dtype | type = np.float32,
    timeout: float | None = None,
) -> Iterator[AudioBatch]
```

Same shape as `subscribe_video_channel`. `dtype` defaults to `float32`; pass `np.float64` to preserve the wire's full precision.

### list_channels

```python
def list_channels(*, ctx: Context | None = None) -> list[SideChannelInfo]
```

Returns every side-channel socket currently visible. Re-scanned on each call; filenames not matching `video_<input_id>.sock` / `audio_<input_id>.sock` are skipped; missing directory yields an empty list.

### VideoFrame

```python
@dataclass(frozen=True, slots=True)
class VideoFrame:
    rgba: numpy.ndarray  # shape (H, W, 4), dtype uint8, channel order R G B A
    pts_nanos: int        # PTS in Smelter pipeline clock (input's offsetMs applied)

    @property
    def width(self) -> int          # rgba.shape[1]
    @property
    def height(self) -> int         # rgba.shape[0]
    @property
    def pts_seconds(self) -> float  # pts_nanos / 1e9, lossy
```

The `rgba` array is writable and owns its buffer — safe to mutate in place (e.g. `cv2.rectangle`) without copying.

### AudioBatch

```python
@dataclass(frozen=True, slots=True)
class AudioBatch:
    samples: numpy.ndarray  # shape (sample_count, channels), dtype float32 (or float64)
    sample_rate: int        # source sample rate; SDK does NOT resample
    start_pts_nanos: int    # PTS of the first sample, pipeline clock

    @property
    def channels(self) -> int               # samples.shape[1]
    @property
    def sample_count(self) -> int           # samples.shape[0]
    @property
    def start_pts_seconds(self) -> float
    @property
    def duration_seconds(self) -> float     # sample_count / sample_rate
    @property
    def end_pts_nanos(self) -> int          # PTS one sample past the last
    def to_mono(self) -> numpy.ndarray      # 1-D, channels averaged
```

Sample values lie in `[-1.0, 1.0]`. For stereo, column 0 is left, column 1 is right.

### SideChannelInfo

```python
@dataclass(frozen=True, slots=True)
class SideChannelInfo:
    path: pathlib.Path
    kind: SideChannelKind  # StrEnum: VIDEO = "video", AUDIO = "audio"
    input_id: str
```

## Architecture Pattern

Side channel does not change the Smelter pipeline. The TS app still owns inputs, outputs, and composition, and the channel is **read-only** (you can analyze frames but cannot push modified media back). "Closing the loop" means: analyze decoded frames in a sidecar, send the *results* back to the TS app, and let the TS app re-render the composition. You drive the picture through React state and JSX overlays, never by editing pixels.

### The loop

```
WHIP input ──▶ Smelter ──▶ side-channel socket ──▶ Python sidecar (inference)
   ▲                                                      │
   │  re-render (React state)                             │ POST results
   └───────────── TS app  ◀── HTTP /update ◀──────────────┘
                    │
                    └──▶ WHEP output (overlays composed on top of the input)
```

1. **Register the input** with `sideChannel` and an appropriate `delayMs` (see below). Render an initial composition that includes `<InputStream>` plus whatever overlay reads from app state.
2. **Sidecar subscribes** (`subscribe_video_channel` / `subscribe_audio_channel`), runs inference, and **POSTs results** to a small endpoint the TS app exposes, e.g. `http.createServer(...).listen(3001, "127.0.0.1")` accepting `POST /update`.
3. **TS app writes results into a store** (Zustand or any state container) from *outside* React, inside the HTTP handler: `useStore.getState().setX(payload)`. That triggers a re-render.
4. **Composition reads the store** and renders overlays (boxes, subtitles, badges) on top of `<InputStream>`.

### Implementation notes & gotchas

- **Align `delayMs` with analysis latency.** The output is delayed by `delayMs`, so if the sidecar takes ~`d` ms, set `delayMs ≈ d` and the overlay lands on the frame it describes. Too low → overlays lag the picture; too high → needless latency (and memory, per the `delayMs` caution above).
- **Stable React keys for moving overlays.** Key each overlay by a stable id (e.g. a tracker id, falling back to index) so React reuses the same element across frames; a short `transition={{ durationMs: 200 }}` then interpolates from the previous position instead of snapping.
- **Video frames are RGBA.** `VideoFrame.rgba` is `(H, W, 4)` `uint8`, RGBA order. OpenCV expects BGR, so convert with `cv2.cvtColor(frame.rgba, cv2.COLOR_RGBA2BGR)`.
- **Audio is not resampled.** `AudioBatch.sample_rate` is the source rate; resample yourself (e.g. `np.interp`) to your model's rate. Use `batch.to_mono()` for mono models.
- **Don't block the subscription loop.** For chunked audio models, accumulate samples on a reader thread and hand fixed-size chunks to a worker thread via a `queue.Queue`; match the chunk length to `delayMs` so chunks finish as the delayed frame arrives.
- **Backpressure is silent-ish.** Slow consumers cause oldest-frame drops (logged server-side). Size `delayMs` / model so you keep up, or accept dropped frames.

### Example shapes

- **Object detection** (video): YOLO sidecar → tracked bounding boxes → animated `<View>` boxes keyed by tracker id. `delayMs: 200`.
- **Speech-to-text** (audio): Whisper sidecar over fixed chunks → recognized lines → `<Text>` subtitle overlay. `delayMs: 5000`, chunk length `5000`.
- **Other analyses follow the same loop** (results → state → JSX): scene/shot detection swapping layouts, silence/VAD detection toggling a "muted" badge, logo/QR detection, content-moderation flags that switch the scene, on-screen audio level meters. Anything that *changes the composition* fits; anything that needs *modified pixels back in the stream* does not (read-only channel).
