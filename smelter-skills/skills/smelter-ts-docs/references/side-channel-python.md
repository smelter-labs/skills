# Side channel — Python consumer API (`smelter-sdk`)

The `smelter-sdk` Python package consumes decoded video frames and PCM audio batches from a running Smelter Node.js app over the side-channel Unix sockets. It exposes both a synchronous and an asyncio API. The underlying socket format is not stable; this package is currently the only supported way to consume side-channel data.

This package is **only** a side-channel consumer — not a full Smelter SDK. The TypeScript app remains the source of truth for inputs, outputs, and composition (see `./side-channel.md`). The Python sidecar reads side-channel data and pushes results back into the TS app through whatever channel the app exposes (websocket, HTTP endpoint, shared store, …).

## Install & setup

```bash
pip install smelter-sdk
```

Requires Python 3.11+ and NumPy 1.26+.

Both processes must see the same socket directory. If `SMELTER_SIDE_CHANNEL_SOCKET_DIR` is unset, the SDK falls back to the current working directory.

```bash
export SMELTER_SIDE_CHANNEL_SOCKET_DIR=/path/to/sockets
```

Override per-call with an explicit `Context`:

```python
from smelter import Context, subscribe_video_channel

ctx = Context(socket_dir="/var/run/smelter")
for frame in subscribe_video_channel("cam1", ctx=ctx):
    ...
```

## Synchronous API

```python
from smelter import subscribe_video_channel

for frame in subscribe_video_channel("cam1"):
    print(f"{frame.width}x{frame.height} pts={frame.pts_seconds:.3f}s")
    run_inference(frame.rgba)
```

### `subscribe_video_channel`

Wait for a video side channel matching `input_id`, then yield decoded frames until the server closes the socket.

```python
def subscribe_video_channel(
    input_id: str,
    *,
    ctx: Context | None = None,
    timeout: float | None = None,
) -> Iterator[VideoFrame]
```

- **input_id** `str` — ID of the Smelter input to consume.
- **ctx** `Context | None` (default `None`) — context overriding the default socket directory.
- **timeout** `float | None` (default `None`) — seconds to wait for the socket to appear in the directory. Applies to **discovery only**; iteration blocks indefinitely once connected. `None` waits forever.

### `subscribe_audio_channel`

Wait for an audio side channel matching `input_id`, then yield decoded PCM batches.

```python
def subscribe_audio_channel(
    input_id: str,
    *,
    ctx: Context | None = None,
    dtype: np.dtype | type = np.float32,
    timeout: float | None = None,
) -> Iterator[AudioBatch]
```

Same parameters as `subscribe_video_channel`, plus:

- **dtype** `numpy.dtype | type` (default `numpy.float32`) — NumPy sample dtype to expose. Pass `np.float64` to preserve the wire's full precision.

```python
from smelter import subscribe_audio_channel

for batch in subscribe_audio_channel("cam1"):
    print(f"{batch.sample_count} samples @ {batch.sample_rate}Hz, "
          f"{batch.channels}ch, start={batch.start_pts_seconds:.3f}s")
    transcribe(batch.to_mono())
```

### `list_channels`

Return every side-channel socket currently visible to the context. The directory is scanned on each call; filenames not following the `video_<input_id>.sock` / `audio_<input_id>.sock` convention are skipped, and a missing directory yields an empty list.

```python
def list_channels(*, ctx: Context | None = None) -> list[SideChannelInfo]
```

## Async API

The same surface lives under `smelter.aio` with `async`/`await` semantics, built on `asyncio.open_unix_connection` (no dedicated OS thread per stream).

```python
import asyncio
from smelter.aio import subscribe_video_channel

async def main():
    async for frame in subscribe_video_channel("cam1"):
        print(f"{frame.width}x{frame.height} pts={frame.pts_seconds:.3f}s")
        await run_inference(frame.rgba)

asyncio.run(main())
```

> **Note:** Wrap heavy synchronous calls inside the loop (e.g. ML inference) in `asyncio.to_thread(...)` so they don't block other tasks on the same event loop.

Same parameters as the sync counterparts:

```python
async def subscribe_video_channel(
    input_id: str, *, ctx: Context | None = None, timeout: float | None = None,
) -> AsyncIterator[VideoFrame]

async def subscribe_audio_channel(
    input_id: str, *, ctx: Context | None = None,
    dtype: np.dtype | type = np.float32, timeout: float | None = None,
) -> AsyncIterator[AudioBatch]

async def list_channels(*, ctx: Context | None = None) -> list[SideChannelInfo]
```

## Types

### VideoFrame

```python
@dataclass(frozen=True, slots=True)
class VideoFrame:
    rgba: numpy.ndarray
    pts_nanos: int

    @property
    def width(self) -> int: ...
    @property
    def height(self) -> int: ...
    @property
    def pts_seconds(self) -> float: ...
```

- **rgba** `numpy.ndarray` — pixel data, shape `(height, width, 4)`, dtype `uint8`, channel order R, G, B, A. Writable and owns its buffer, so it is safe to mutate in place (e.g. `cv2.rectangle`) without copying.
- **pts_nanos** `int` — presentation timestamp in nanoseconds, in the Smelter pipeline clock (zero at pipeline start, monotonic per input, with the input's `offsetMs` applied).
- **width** `int` — image width in pixels (from `rgba.shape[1]`).
- **height** `int` — image height in pixels (from `rgba.shape[0]`).
- **pts_seconds** `float` — `pts_nanos` in seconds (lossy).

### AudioBatch

```python
@dataclass(frozen=True, slots=True)
class AudioBatch:
    samples: numpy.ndarray
    sample_rate: int
    start_pts_nanos: int

    @property
    def channels(self) -> int: ...
    @property
    def sample_count(self) -> int: ...
    @property
    def start_pts_seconds(self) -> float: ...
    @property
    def duration_seconds(self) -> float: ...
    @property
    def end_pts_nanos(self) -> int: ...
    def to_mono(self) -> numpy.ndarray: ...
```

- **samples** `numpy.ndarray` — shape `(sample_count, channels)`, dtype `float32` by default (`float64` if requested via `dtype`). Values in `[-1.0, 1.0]`. For stereo, column 0 is left, column 1 is right.
- **sample_rate** `int` — source sample rate in Hz. The SDK does not resample.
- **start_pts_nanos** `int` — PTS of the first sample, in the Smelter pipeline clock (nanoseconds).
- **channels** `int` — number of audio channels (from `samples.shape[1]`).
- **sample_count** `int` — samples per channel in this batch (from `samples.shape[0]`).
- **start_pts_seconds** `float` — `start_pts_nanos` in seconds (lossy).
- **duration_seconds** `float` — batch length in seconds (`sample_count / sample_rate`).
- **end_pts_nanos** `int` — PTS one sample past the last sample in this batch.
- **to_mono()** → `numpy.ndarray` — 1-D mono array; multi-channel audio is averaged, returned dtype matches `samples.dtype`.

### SideChannelInfo

Returned by `list_channels`. Identifies one discovered socket.

```python
@dataclass(frozen=True, slots=True)
class SideChannelInfo:
    path: pathlib.Path
    kind: SideChannelKind
    input_id: str
```

- **path** `pathlib.Path` — filesystem path to the Unix socket.
- **kind** `SideChannelKind` — whether the socket carries video frames or audio batches.
- **input_id** `str` — ID of the Smelter input this socket belongs to.

### SideChannelKind

`StrEnum` distinguishing the two socket kinds.

```python
class SideChannelKind(StrEnum):
    VIDEO = "video"
    AUDIO = "audio"
```

See `./side-channel.md` for the TypeScript-side configuration and end-to-end patterns.
