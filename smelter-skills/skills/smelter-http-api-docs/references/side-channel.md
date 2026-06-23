# Side channel

The side channel is a Unix-socket stream of decoded media that Smelter exposes alongside its normal output. An external process (typically Python) can read decoded RGBA video frames and PCM audio batches from a Smelter input. A common use is running ML inference on that data and feeding the results back to Smelter via the HTTP API.

> **Note:** The side channel is read-only: the external process consumes decoded data, it does not push media into Smelter. To send results back (e.g. detection boxes, transcripts) use the regular HTTP API.

## How it works

On startup Smelter prepares a side-channel socket directory pointed to by the `SMELTER_SIDE_CHANNEL_SOCKET_DIR` environment variable. The directory must be empty (Smelter creates it if missing).

When you register an input with `side_channel.video: true` and/or `side_channel.audio: true`, Smelter creates one Unix socket per enabled track inside that directory:

- `video_<input_id>.sock` - decoded RGBA video frames.
- `audio_<input_id>.sock` - decoded PCM audio batches.

A consumer process connects to the socket and receives a stream of decoded frames / batches. Acting on that data happens outside the side channel protocol, by calling Smelter's regular HTTP API.

## Enabling side channel

Enable the side channel per track when registering an input. The `side_channel` field is supported by every server-side input type; see each input's reference page for the exact field definition (e.g. `inputs/mp4.md`).

```http
POST: /api/input/:input_id/register
Content-Type: application/json

{
  "type": "mp4",
  "url": "https://example.com/video.mp4",
  "side_channel": {
    "video": true,
    "audio": true
  }
}
```

### side_channel

```tsx
type SideChannel = {
  video?: bool;
  audio?: bool;
  delay_ms?: f64;
};
```

#### video
Expose decoded RGBA video frames on a `video_<input_id>.sock` socket.
- **Type**: `bool`
- **Default**: `false`

#### audio
Expose decoded PCM audio batches on an `audio_<input_id>.sock` socket.
- **Type**: `bool`
- **Default**: `false`

#### delay_ms
Buffer frames this many milliseconds ahead of the queue, so the subscriber receives them early and has roughly that long to react (e.g. run inference) before the frame is due in the composed output. By default the side channel publishes each frame at the moment the queue consumes it, leaving no time to process it first. Higher delays give the consumer more processing time at the cost of additional end-to-end latency on the composed output.
- **Type**: `f64`
- **Default**: `0`

## Configuring the socket directory

Smelter writes side-channel sockets into the directory pointed to by the `SMELTER_SIDE_CHANNEL_SOCKET_DIR` environment variable. The same path must be visible to the consuming process.

## Consuming side channel data

> **Note:** The Python `smelter-sdk` package is currently the only supported consumer. The underlying Unix-socket wire format is not yet stable and is not documented for direct use; write your consumers against the `smelter-sdk` API. See `side-channel-python.md` for the full Python surface (sync + async, audio batches, channel discovery).

Install `smelter-sdk` and subscribe to a channel by input id:

```bash
pip install smelter-sdk
```

```python
from smelter import subscribe_video_channel

for frame in subscribe_video_channel("input_1"):
    # frame.rgba is the decoded RGBA buffer — run inference / analysis
    # and post results back via Smelter's HTTP API as needed.
    ...
```

Run the consuming process with `SMELTER_SIDE_CHANNEL_SOCKET_DIR` pointing at the same directory Smelter writes its sockets to:

```bash
SMELTER_SIDE_CHANNEL_SOCKET_DIR=/path/to/sockets python my_consumer.py
```
