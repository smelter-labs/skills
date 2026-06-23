# Deployment & server configuration

How to run the Smelter server that the HTTP API talks to, and the environment variables
that configure it.

## Getting and running the server

The server runs standalone — there's no SDK in this skill, you talk to it over HTTP.

- **Docker** (recommended): images live at `ghcr.io/software-mansion/smelter`. Tags:
  - `v{VERSION}` (e.g. `v0.6.0`) — base version.
  - `v{VERSION}-web-renderer` — base version with web rendering enabled (bundles the
    Chromium Embedded Framework). Needed for `WebView` / web-renderer resources.
- **Binaries / from source**: GitHub releases, or build with the Dockerfiles in the
  Smelter repo (`tools/docker/slim.Dockerfile` = base, `full.Dockerfile` = web renderer).

Run (CPU-only by default — encoding/decoding on CPU, rendering emulated with LLVMpipe):

```sh
docker run -p 8081:8081 ghcr.io/software-mansion/smelter
```

### GPU acceleration

Pass the GPU into the container:
- **AMD (Linux):** add `--device /dev/dri`.
- **Nvidia (Linux):** add `--gpus all --runtime=nvidia`.

GPU gives dramatically faster encoding/decoding than CPU; steer toward it (and toward the
`vulkan_h264` encoder/decoder) for performance-sensitive workloads.

### Hardware requirements

- **GPU rendering** needs WebGPU features `TEXTURE_BINDING_ARRAY` and `IMMEDIATES` (always
  required) plus `SAMPLED_TEXTURE_AND_STORAGE_BUFFER_ARRAY_NON_UNIFORM_INDEXING` (default,
  toggle via `SMELTER_REQUIRED_WGPU_FEATURES`). These exist on almost any GPU; errors here
  usually mean missing or outdated drivers.
- **Hardware H264 decoding** (`vulkan_h264`) needs the Vulkan extensions
  `VK_KHR_video_queue`, `VK_KHR_video_decode_queue`, `VK_KHR_video_decode_h264`, and a
  server built with the `gpu-video` feature.

## Environment variables

All are optional. Booleans accept `true`/`1` to enable, `false`/`0` to disable.

### API & identity
- `SMELTER_API_PORT` — HTTP API port. Default `8081`.
- `SMELTER_INSTANCE_ID` — ID returned from `GET /status`. Default: a random number.

### Output media defaults
- `SMELTER_OUTPUT_FRAMERATE` — framerate for all outputs. Default `30`. Accepts a number or
  a `NUM/DEN` string (unsigned integers).
- `SMELTER_MIXING_SAMPLE_RATE` — output sample rate for all outputs. Default `48000`.
  Allowed: `8000`, `12000`, `16000`, `24000`, `48000`.

### Rendering / GPU
- `SMELTER_FORCE_GPU` — require a GPU for rendering; exit with an error if only CPU adapters
  are found. Default `false`.
- `SMELTER_REQUIRED_WGPU_FEATURES` — comma-separated list of WebGPU features to enable.
  Default `SAMPLED_TEXTURE_AND_STORAGE_BUFFER_ARRAY_NON_UNIFORM_INDEXING`.
  `TEXTURE_BINDING_ARRAY` and `IMMEDIATES` are always required and can't be overridden.

### Processing timing
- `SMELTER_STREAM_FALLBACK_TIMEOUT_MS` — switch to a fallback when an input stops sending
  frames for this long (ms). Default `500`.
- `SMELTER_INPUT_BUFFER_DURATION_MS` — input buffer duration (ms); a new stream isn't
  processed until this buffer fills. Default `80` (~5 frames at 60fps). Raising it raises
  latency by the same amount.
- `SMELTER_OFFLINE_PROCESSING_ENABLE` — sets both `SMELTER_AHEAD_OF_TIME_PROCESSING_ENABLE`
  and `SMELTER_NEVER_DROP_OUTPUT_FRAMES` to true (each takes priority if also set
  explicitly). Default `false`.
- `SMELTER_AHEAD_OF_TIME_PROCESSING_ENABLE` — generate output frames/samples ahead of time
  when all inputs are available (process faster than real time). Default `false`.
- `SMELTER_NEVER_DROP_OUTPUT_FRAMES` — never drop output frames/samples even if
  rendering/encoding can't keep up in real time. Default `false`.
- `SMELTER_RUN_LATE_SCHEDULED_EVENTS` — still execute `schedule_time_ms` events that were
  scheduled too late. Default `false`.

### Logging
- `SMELTER_LOGGER_LEVEL` — default `info,wgpu_hal=warn,wgpu_core=warn`. Accepts a level
  (`error`/`warn`/`info`/`debug`/`trace`) or a `tracing-subscriber` filter string.
- `SMELTER_LOGGER_FORMAT` — `json` (default), `compact`, or `pretty`. Does not affect FFmpeg
  or the embedded Chromium logs.
- `SMELTER_FFMPEG_LOGGER_LEVEL` — `error`/`warn` (default)/`info`/`debug`.
- `SMELTER_LOG_FILE` — also write logs to this file (stdout logging continues).

### Files & fonts
- `SMELTER_DOWNLOAD_DIR` — where downloaded files are stored. Default: an OS-provided
  location; if unset, a `smelter-<random>` subdirectory is created.
- `SMELTER_LOAD_SYSTEM_FONTS` — load all system fonts at startup. Default `true`; disabling
  can speed up startup.

### Web rendering
- `SMELTER_WEB_RENDERER_ENABLE` — enable web rendering. Default `false`. With it disabled
  you cannot use `WebView` components or register `WebRenderer` instances.
- `SMELTER_WEB_RENDERER_GPU_ENABLE` — enable GPU inside the embedded Chromium. Default
  `true`.

### WHIP / WHEP & RTMP servers
- `SMELTER_WHIP_WHEP_SERVER_PORT` — port for the WHIP/WHEP server API. Default `9000`.
- `SMELTER_START_WHIP_WHEP_SERVER` — start the WHIP/WHEP HTTP server. Default `true`. If
  disabled, WHIP inputs can't be registered.
- `SMELTER_RTMP_SERVER_PORT` — RTMP server port. Default `1935`.
- `SMELTER_START_RTMP_SERVER` — start the RTMP server. Default `true`. If disabled, RTMP
  inputs can't be registered.
- `SMELTER_RTMP_TLS_CERT_FILE` / `SMELTER_RTMP_TLS_KEY_FILE` — paths to a TLS cert and key.
  When both are set, the RTMP server accepts RTMPS connections.

### WebRTC (WHIP/WHEP transport)
- `SMELTER_WEBRTC_STUN_SERVERS` — comma-separated STUN server URLs. Default
  `stun:stun.l.google.com:19302`.
- `SMELTER_WEBRTC_UDP_PORT_RANGE` — `"START:END"` range for WebRTC UDP ports. Mutually
  exclusive with `SMELTER_WEBRTC_UDP_MUX_PORT`.
- `SMELTER_WEBRTC_UDP_MUX_PORT` — a single UDP port to mux all WHIP/WHEP traffic onto.
  Mutually exclusive with `SMELTER_WEBRTC_UDP_PORT_RANGE`.
- `SMELTER_WEBRTC_1_TO_1_NAT_IPS` — comma-separated IPs to use for ICE candidates instead of
  the host IP.

### Side channel
- `SMELTER_SIDE_CHANNEL_SOCKET_DIR` — directory where Smelter creates side-channel Unix
  sockets for inputs registered with `side_channel` enabled (see `side-channel.md`). Must be
  empty at startup; created if missing. Default: a unique subdirectory of `$XDG_RUNTIME_DIR`
  (or `/tmp` on macOS) named `smelter_side_channel_<random>`. The consuming process must see
  the same path.
