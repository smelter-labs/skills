# Deployment

How the Smelter media engine gets run and configured. As a TypeScript SDK user you
either let the Node.js SDK spawn the server for you (the default) or connect to a
server you deploy yourself. This page covers both. Runtime entry points are in
`./runtimes/*.md`; the conceptual split between React and the engine is in
`./overview.md`.

Target server version: **v0.4.0**.

## How the SDK gets the server (Node.js default)

When you use `@swmansion/smelter-node`, the Node.js process runs only your React
layout code — actual decoding/rendering/encoding happens in a separate native
Smelter process. By default the SDK **downloads the Smelter binaries and starts the
server locally** on the same machine (this is `LocallySpawnedInstanceManager`).
Generate a project with `npx create-smelter-app`.

You **must still satisfy the binary's runtime requirements** (see below) even when
the SDK downloads it for you.

To connect to a server you started yourself instead, use `ExistingInstanceManager`
(see `./runtimes/nodejs.md`) and provide the connection URL. Running your React code
on a different machine than the server is possible but only useful in narrow cases
(e.g. running untrusted JavaScript that controls streams). The practical setups:

- **Production** — run both Node.js and the Smelter server in the same Docker
  container.
- **Development** — run Node.js on your machine and the Smelter server locally
  (directly or in Docker).

The Browser (WASM) runtime (`@swmansion/smelter-web-wasm`) needs **no deployment** —
everything is client-side — but does need project build configuration. The Browser
(Client) runtime (`@swmansion/smelter-web-client`) needs a server deployed
separately, exactly as in the standalone case below.

## Ways to run the server

### Docker (recommended for self-hosting)

Images live in `ghcr.io/software-mansion/smelter`. Tags:

- `v{VERSION}` (e.g. `v0.4.0`) — base version.
- `v{VERSION}-web-renderer` — base plus web rendering (bundles the Chromium Embedded
  Framework; required for `WebView` / `WebRenderer`).

Run it (CPU-only mode by default):

```sh
docker run -p 8081:8081 ghcr.io/software-mansion/smelter
```

By default this runs CPU-only: encoding/decoding on CPU, rendering emulated via
LLVMpipe. To use the GPU, pass the device through:

- **AMD / Linux**: add `--device /dev/dri`.
- **Nvidia / Linux**: add `--gpus all --runtime=nvidia`.

```sh
docker run --gpus all --runtime=nvidia -p 8081:8081 ghcr.io/software-mansion/smelter
```

Build your own from `tools/docker/slim.Dockerfile` (base) or
`tools/docker/full.Dockerfile` (with web rendering) in the Smelter repo.

#### Packaging a Node.js SDK app with the server

Base the image on the Smelter image, add Node.js, point the SDK at the bundled
binary via `SMELTER_PATH`, and run your built app:

```dockerfile
FROM ghcr.io/software-mansion/smelter:v0.4.0

ENV NODE_VERSION 20.18.0

RUN sudo apt-get update -y -qq && \
  sudo apt-get install -y curl xz-utils && \
  sudo rm -rf /var/lib/apt/lists/*

RUN curl -fsSLO --compressed "https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz" && \
  sudo tar -xJf "node-v$NODE_VERSION-linux-x64.tar.xz" -C /usr/local --strip-components=1 --no-same-owner && \
  rm "node-v$NODE_VERSION-linux-x64.tar.xz"

ENV SMELTER_PATH=/home/smelter/smelter/main_process

ADD --chown=smelter . /home/smelter/project
WORKDIR /home/smelter/project

RUN npm install && npm run build

ENTRYPOINT ["node", "/home/smelter/project/dist/index.js"]
```

### Prebuilt binaries

From GitHub releases (`github.com/software-mansion/smelter/releases`). Available
builds:

- `smelter_linux_x86_64.tar.gz`, `smelter_linux_aarch64.tar.gz` — Linux x86 / ARM.
- `smelter_darwin_aarch64.tar.gz`, `smelter_darwin_x86_64.tar.gz` — macOS ARM / Intel.
- `smelter_with_web_renderer_*` variants — same platforms, with web rendering
  enabled. Web rendering bloats the binary significantly, so the base builds omit it.

### Building from source

Requires FFmpeg 6+ (build-time version must match runtime), the Rust toolchain,
FFmpeg dev libraries (`libavcodec`, `libavformat`, `libavfilter`, `libavdevice`,
`libavutil`, `libswscale`, `libswresample`), `libopus`, `libssl`, `cmake`, and
`pkg-config`. On Linux you also need MESA. Then:

```sh
cargo build --no-default-features   # base, no web rendering
cargo build                         # with web rendering (also needs CEF deps)
```

## System requirements (running the binary)

Linux runtime:

- FFmpeg 6.
- `glibc` 2.35+ (Ubuntu 22.04's version).
- MESA (`mesa-vulkan-drivers` on Ubuntu): `23.2.1`+ for CPU rendering; `22.0.1`+
  tested for GPU rendering.

macOS runtime: FFmpeg 7 (tracks Homebrew's default version).

GPU acceleration requirements:

- **WebGPU features** — `TEXTURE_BINDING_ARRAY` and `IMMEDIATES` are always required;
  `SAMPLED_TEXTURE_AND_STORAGE_BUFFER_ARRAY_NON_UNIFORM_INDEXING` is on by default
  (toggle via `SMELTER_REQUIRED_WGPU_FEATURES`). These exist on nearly any GPU —
  an "unsupported feature" error almost always means missing or outdated drivers.
- **Hardware (Vulkan) H264 decoding** — needs the `VK_KHR_video_queue`,
  `VK_KHR_video_decode_queue`, and `VK_KHR_video_decode_h264` Vulkan extensions.

Smelter runs fully on CPU-only machines; GPU just requires meeting the above.

## Configuration (environment variables)

All are optional. Booleans accept `true`/`1` or `false`/`0`.

| Variable | Default | Purpose |
|---|---|---|
| `SMELTER_API_PORT` | `8081` | HTTP API port. |
| `SMELTER_INSTANCE_ID` | random | ID returned by `GET /status`; verify you connected to the right instance. |
| `SMELTER_OUTPUT_FRAMERATE` | `30` | Output FPS for all outputs. Number, or `NUM/DEN` string. |
| `SMELTER_MIXING_SAMPLE_RATE` | `48000` | Output sample rate. One of `8000`/`12000`/`16000`/`24000`/`48000`. |
| `SMELTER_FORCE_GPU` | `false` | Require a GPU; exit with an error if only CPU adapters are found. |
| `SMELTER_STREAM_FALLBACK_TIMEOUT_MS` | `500` | When an input stops sending frames for this long, switch to its fallback. |
| `SMELTER_LOGGER_LEVEL` | `info,wgpu_hal=warn,wgpu_core=warn` | `error`/`warn`/`info`/`debug`/`trace`, or a `tracing-subscriber` filter string. |
| `SMELTER_LOGGER_FORMAT` | `json` | `json`/`compact`/`pretty`. Does not affect FFmpeg or Chromium logs. |
| `SMELTER_FFMPEG_LOGGER_LEVEL` | `warn` | FFmpeg log level: `error`/`warn`/`info`/`debug`. |
| `SMELTER_DOWNLOAD_DIR` | OS-provided | Where downloaded/temp files are stored (creates `smelter-<random>` if unset). |
| `SMELTER_WEB_RENDERER_ENABLE` | `false` | Enable web rendering. Required for `WebView` components and `WebRenderer` resources (and the `-web-renderer` build). |
| `SMELTER_WEB_RENDERER_GPU_ENABLE` | `true` | Enable GPU inside the embedded Chromium. |
| `SMELTER_OFFLINE_PROCESSING_ENABLE` | `false` | Shortcut that sets both ahead-of-time processing and never-drop-frames to true (explicit values for those take priority). |
| `SMELTER_AHEAD_OF_TIME_PROCESSING_ENABLE` | `false` | Generate output ahead of time when all inputs are available — use to process faster than real time. |
| `SMELTER_NEVER_DROP_OUTPUT_FRAMES` | `false` | Never drop output frames/samples even if rendering/encoding can't keep up in real time. |
| `SMELTER_RUN_LATE_SCHEDULED_EVENTS` | `false` | Still execute `schedule_time_ms` events that were scheduled too late. |
| `SMELTER_REQUIRED_WGPU_FEATURES` | `SAMPLED_TEXTURE_AND_STORAGE_BUFFER_ARRAY_NON_UNIFORM_INDEXING` | Comma-separated WebGPU features to enable. `TEXTURE_BINDING_ARRAY` and `IMMEDIATES` are always required and can't be overridden. |
| `SMELTER_INPUT_BUFFER_DURATION_MS` | `80` | Input buffer duration (~5 frames at 60fps); new streams wait until filled. Increasing it raises latency by the same amount. |
| `SMELTER_LOAD_SYSTEM_FONTS` | `true` | Load all system fonts; disabling can speed up startup. |
| `SMELTER_WHIP_WHEP_SERVER_PORT` | `9000` | Port for the WHIP/WHEP HTTP server. |
| `SMELTER_START_WHIP_WHEP_SERVER` | `true` | Start the WHIP/WHEP server; if off, WHIP inputs can't be registered. |
| `SMELTER_RTMP_SERVER_PORT` | `1935` | RTMP server port. |
| `SMELTER_START_RTMP_SERVER` | `true` | Start the RTMP server; if off, RTMP inputs can't be registered. |
| `SMELTER_RTMP_TLS_CERT_FILE` | — | TLS cert path for the RTMP server. Set with the key file to accept RTMPS. |
| `SMELTER_RTMP_TLS_KEY_FILE` | — | TLS private key path for the RTMP server. Set with the cert file to accept RTMPS. |
| `SMELTER_LOG_FILE` | — | Also write all logs to this file (stdout logging continues). |
| `SMELTER_WEBRTC_STUN_SERVERS` | `stun:stun.l.google.com:19302` | Comma-separated STUN server URLs for WHIP/WHEP negotiation. |
| `SMELTER_WEBRTC_UDP_PORT_RANGE` | — | `START:END` port range for WebRTC. Mutually exclusive with the mux port. |
| `SMELTER_WEBRTC_UDP_MUX_PORT` | — | Single UDP port to mux all WHIP/WHEP WebRTC traffic. Mutually exclusive with the port range. |
| `SMELTER_WEBRTC_1_TO_1_NAT_IPS` | — | Comma-separated IPs to use for ICE candidates instead of the host IP. |
| `SMELTER_SIDE_CHANNEL_SOCKET_DIR` | unique `$XDG_RUNTIME_DIR` subdir | Directory for side-channel Unix sockets; must be empty at startup, created if missing. |

## Performance — what to choose

Smelter is most efficient when it decodes, modifies raw frames, and re-encodes. Use
it for compositing/overlays/text/effects, transcoding to a different codec, or
producing multiple resolutions. It is **not** the right tool for pure
protocol/format conversion (e.g. RTMP→HLS) or fan-out re-streaming to many viewers.

The pipeline's heavy work is **decoding**, **rendering** (compositing), and
**encoding**. High-signal guidance for steering an agent:

- **Prefer a full GPU pipeline.** GPU rendering is cheap even on integrated/older
  GPUs, and GPU (Vulkan) H264 decode/encode keeps frames in VRAM, avoiding the
  CPU↔GPU memory transfers that bottleneck CPU pipelines. A GPU instance delivers
  far more throughput per dollar than a comparable CPU-only one.
- **CPU-only is much slower.** Rendering falls back to LLVMpipe (software GPU
  emulation), which competes with H264 decode/encode for the same cores. Mitigate
  by using lower resolutions, simple layouts (no alpha blending, rounded corners,
  borders, box shadows), and CPU-optimized mode (worse color-blend quality).
- **Software vs hardware codecs.** Software (CPU) decoders/encoders support `H264`,
  `VP8`, `VP9` and can give higher quality per bitrate, but rarely fast enough for
  real time. Hardware (GPU/Vulkan) decode/encode is H264-only for now. Vulkan H264
  quality is roughly x264 `medium`; among CPU presets, `fast` is the closest match,
  while `veryfast`/`ultrafast` trade quality for speed.
- **Hardware caveats.** Older AMD cards have weak decode hardware (an RX 570 handles
  only ~3–4 × 1080p streams); Nvidia consumer cards cap concurrent encoder sessions
  at 8.
- **Throughput scales with the input:output ratio and resolution** — more inputs
  composited per output lean on the decoder; higher output resolution leans on
  rendering/encoding.

Browser (WASM) rendering reuses the server's `wgpu` code compiled to WASM over WebGL;
it's slower than native and the dominant cost is often moving frames in/out of the
WASM renderer, which varies wildly by browser/OS. Decode/encode rely on the browser's
own codecs (Smelter has minimal control). Chromium-based browsers only.
</content>
