# Side channel — Python API

The `smelter-sdk` Python package exposes a synchronous and an asyncio API for subscribing to decoded video frames and PCM audio batches from a running Smelter server over the side-channel Unix sockets. The underlying socket format is not yet stable; the package is currently the only supported way to consume side channel data. See `side-channel.md` for how the side channel works and how to enable it per input.

> **Note:** The Python package is *only* a side-channel consumer. It does not wrap Smelter's HTTP API. To register inputs, configure outputs, or drive composition, call the HTTP endpoints directly (any HTTP client works).

## Install

```bash
pip install smelter-sdk
```

Requires Python 3.11+ and NumPy 1.26+.

## Setup

The consuming process needs to know where Smelter wrote its sockets:

```bash
export SMELTER_SIDE_CHANNEL_SOCKET_DIR=/path/to/sockets
```

If the variable is unset, the SDK falls back to the current working directory. To override per-call, pass an explicit `Context`:

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

### subscribe_video_channel

Wait for a video side channel matching `input_id`, then yield decoded frames until the server closes the socket.

```python
def subscribe_video_channel(
    input_id: str,
    *,
    ctx: Context | None = None,
    timeout: float | None = None,
) -> Iterator[VideoFrame]
```

#### input_id
ID of the Smelter input to consume.
- **Type**: `str`

#### ctx
Optional context overriding the default socket directory (see Setup).
- **Type**: `Context | None`
- **Default**: `None`

#### timeout
Seconds to wait for the socket to appear in the directory. Applies to discovery only; iteration blocks indefinitely once connected. `None` waits forever.
- **Type**: `float | None`
- **Default**: `None`

### subscribe_audio_channel

Wait for an audio side channel matching `input_id`, then yield decoded PCM batches.

```python
from smelter import subscribe_audio_channel

for batch in subscribe_audio_channel("cam1"):
    print(f"{batch.sample_count} samples @ {batch.sample_rate}Hz, "
          f"{batch.channels}ch, start={batch.start_pts_seconds:.3f}s")
    transcribe(batch.to_mono())
```

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

#### dtype
NumPy sample dtype to expose. Defaults to `float32`; pass `np.float64` to preserve the wire's full precision.
- **Type**: `numpy.dtype | type`
- **Default**: `numpy.float32`

### list_channels

Return every side-channel socket currently visible to the context. The directory is scanned on each call; filenames that don't follow the `video_<input_id>.sock` / `audio_<input_id>.sock` convention are skipped, and a missing directory yields an empty list.

```python
def list_channels(*, ctx: Context | None = None) -> list[SideChannelInfo]
```

## Async API

The same surface lives under `smelter.aio` with `async`/`await` semantics. The async client is built on `asyncio.open_unix_connection`, so a side-channel reader fits into an existing event loop without a dedicated OS thread per stream.

```python
import asyncio
from smelter.aio import subscribe_video_channel

async def main():
    async for frame in subscribe_video_channel("cam1"):
        print(f"{frame.width}x{frame.height} pts={frame.pts_seconds:.3f}s")
        await run_inference(frame.rgba)

asyncio.run(main())
```

> **Note:** Heavy synchronous calls inside the loop (e.g. ML inference) should be wrapped in `asyncio.to_thread(...)` so they don't block other tasks running on the same event loop.

The async functions take the same parameters as their sync counterparts:

```python
async def subscribe_video_channel(
    input_id: str,
    *,
    ctx: Context | None = None,
    timeout: float | None = None,
) -> AsyncIterator[VideoFrame]

async def subscribe_audio_channel(
    input_id: str,
    *,
    ctx: Context | None = None,
    dtype: np.dtype | type = np.float32,
    timeout: float | None = None,
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

#### rgba
Pixel data with shape `(height, width, 4)` and dtype `uint8`. Channel order is R, G, B, A. The array is writable and owns its buffer, so it is safe to mutate in place (e.g. with `cv2.rectangle`) without copying.
- **Type**: `numpy.ndarray`

#### pts_nanos
Presentation timestamp in nanoseconds, in the Smelter pipeline clock (zero at pipeline start, monotonic per input, with the input's `offset_ms` applied).
- **Type**: `int`

#### width
Image width in pixels. Read from `rgba.shape[1]`.
- **Type**: `int`

#### height
Image height in pixels. Read from `rgba.shape[0]`.
- **Type**: `int`

#### pts_seconds
`pts_nanos` expressed in seconds. Lossy.
- **Type**: `float`

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

#### samples
Sample data with shape `(sample_count, channels)`, dtype `float32` by default (`float64` if requested via `dtype`). Sample values lie in `[-1.0, 1.0]`. For stereo, column 0 is left and column 1 is right.
- **Type**: `numpy.ndarray`

#### sample_rate
Source sample rate in Hz. The SDK does not resample.
- **Type**: `int`

#### start_pts_nanos
PTS of the first sample in this batch, in the Smelter pipeline clock (nanoseconds).
- **Type**: `int`

#### channels
Number of audio channels. Read from `samples.shape[1]`.
- **Type**: `int`

#### sample_count
Number of samples per channel in this batch. Read from `samples.shape[0]`.
- **Type**: `int`

#### start_pts_seconds
`start_pts_nanos` expressed in seconds. Lossy.
- **Type**: `float`

#### duration_seconds
Length of the batch in seconds (`sample_count / sample_rate`).
- **Type**: `float`

#### end_pts_nanos
PTS one sample past the last sample in this batch.
- **Type**: `int`

#### to_mono()
Return a 1-D array of mono samples. For multi-channel audio the channels are averaged; the returned dtype matches `samples.dtype`.
- **Returns**: `numpy.ndarray`

### SideChannelInfo

Returned by `list_channels`. Identifies one discovered socket.

```python
@dataclass(frozen=True, slots=True)
class SideChannelInfo:
    path: pathlib.Path
    kind: SideChannelKind
    input_id: str
```

#### path
Filesystem path to the Unix socket.
- **Type**: `pathlib.Path`

#### kind
Whether the socket carries video frames or audio batches.
- **Type**: `SideChannelKind`

#### input_id
ID of the Smelter input this socket belongs to.
- **Type**: `str`

### SideChannelKind

`StrEnum` distinguishing the two socket kinds.

```python
class SideChannelKind(StrEnum):
    VIDEO = "video"
    AUDIO = "audio"
```
