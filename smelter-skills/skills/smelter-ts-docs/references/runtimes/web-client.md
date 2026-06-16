# Browser client runtime (`@swmansion/smelter-web-client`)

Controls a Smelter server from the browser. Your React code runs in the client's browser; React tree updates are sent to the server as layout updates over HTTP. A browser **cannot** spawn a server, so you must supply the connection URL of an already-deployed instance (there is no `LocallySpawnedInstanceManager` here).

**Install:**

```sh
npm install @swmansion/smelter @swmansion/smelter-web-client react
```

`@swmansion/smelter` provides components/hooks/inputs/outputs types; `@swmansion/smelter-web-client` provides the browser runtime. React `18.3.1` recommended.

Two modes:
- **Live processing** — `Smelter` class. Dynamically add/remove inputs/outputs at any time. Real time by default.
- **Offline processing** — `OfflineSmelter` class. Combine static files into a single output. Restricted API: all inputs defined before render, exactly one output. Frames produced as fast as possible.

## Compatibility

Targets SDK **v0.4.0**, which connects to a Smelter server at **v0.6.0**. React
**18.3.1** recommended (any React compatible with `react-reconciler@0.29.2`).

---

## `Smelter` class (live)

```tsx
import Smelter from "@swmansion/smelter-web-client"
```

Lifecycle: `new Smelter(options)` → `await init()` → (optionally register resources) → `await start()` → (optionally register more) → `await terminate()`.

```tsx
import Smelter from "@swmansion/smelter-web-client";
import { View } from "@swmansion/smelter";

async function run() {
  const smelter = new Smelter({ url: "http://127.0.0.1:8081" });
  await smelter.init();

  await smelter.registerOutput("example", <View />, {
    type: "rtmp_client",
    url: "rtmp://example.com/app/stream_key",
    video: {
      encoder: { type: "ffmpeg_h264" },
      resolution: { width: 1920, height: 1080 },
    },
    audio: { channels: "stereo", encoder: { type: "aac" } },
  });

  await smelter.start();
  // additional inputs/outputs can be registered at any point
}
void run();
```

### Constructor

```tsx
new Smelter(options: SmelterOptions)

type SmelterOptions = {
  url: string;  // URL of the already-deployed Smelter server
};
```

### Methods

```tsx
// Connect to the server and reset its state. No output until start().
init(): Promise<void>

// Start the pipeline; registered outputs begin producing streams.
start(): Promise<void>

registerOutput(outputId: string, root: React.ReactElement, output: RegisterOutput): Promise<object>
unregisterOutput(outputId: string): Promise<void>

registerInput(inputId: string, input: RegisterInput): Promise<InputHandle>
unregisterInput(inputId: string): Promise<void>

registerImage(imageId: string, image: Renderers.RegisterImage): Promise<void>
unregisterImage(imageId: string): Promise<void>
registerShader(shaderId: string, shader: Renderers.RegisterShader): Promise<void>
unregisterShader(shaderId: string): Promise<void>
registerWebRenderer(instanceId: string, instance: Renderers.RegisterWebRenderer): Promise<object>
unregisterWebRenderer(instanceId: string): Promise<void>

registerFont(source: FontSource): Promise<void>  // FontSource = string (URL) | ArrayBuffer

// Disconnect from the server.
terminate(): Promise<void>
```

`Renderers.*` types come from `@swmansion/smelter`.

### Supported outputs

```tsx
type RegisterOutput =
  | ({ type: 'rtp_stream' } & RegisterRtpOutput)
  | ({ type: 'mp4' } & RegisterMp4Output)
  | ({ type: 'hls' } & RegisterHlsOutput)
  | ({ type: 'whip_client' } & RegisterWhipClientOutput)
  | ({ type: 'whep_server' } & RegisterWhepServerOutput)
  | ({ type: 'rtmp_client' } & RegisterRtmpClientOutput);
```

- `../outputs/rtp.md`
- `../outputs/mp4.md`
- `../outputs/hls.md`
- `../outputs/whip.md` (WHIP client)
- `../outputs/whep.md` (WHEP server)
- `../outputs/rtmp.md` (RTMP client)

### Supported inputs

```tsx
type RegisterInput =
  | ({ type: 'rtp_stream' } & RegisterRtpInput)
  | ({ type: 'mp4' } & RegisterMp4Input)
  | ({ type: 'hls' } & RegisterHlsInput)
  | ({ type: 'whip_server' } & RegisterWhipServerInput)
  | ({ type: 'whep_client' } & RegisterWhepClientInput)
  | ({ type: 'rtmp_server' } & RegisterRtmpServerInput);
```

- `../inputs/rtp.md`
- `../inputs/mp4.md`
- `../inputs/hls.md`
- `../inputs/whip.md` (WHIP server)
- `../inputs/whep.md` (WHEP client)
- `../inputs/rtmp.md` (RTMP server)

These are the same source/destination types as the Node.js runtime — the difference is the server is remote and processing happens server-side.

### Input handles

`registerInput` returns an `InputHandle`. MP4 inputs return an `Mp4InputHandle` (seeking); WHIP server inputs return a `WhipInputHandle`.

```tsx
class InputHandle {
  get videoDurationMs(): number | undefined;
  get audioDurationMs(): number | undefined;
  pause(): Promise<void>;   // MP4 inputs only
  resume(): Promise<void>;  // MP4 inputs only
}

class Mp4InputHandle extends InputHandle {
  seek(seekMs: number): Promise<void>;  // ms
}

class WhipInputHandle extends InputHandle {
  get endpointRoute(): string | undefined;
  get bearerToken(): string | undefined;
}
```

---

## `OfflineSmelter` class (offline)

```tsx
import { OfflineSmelter } from "@swmansion/smelter-web-client"
```

Simplified API for rendering a single output file. Lifecycle: `new OfflineSmelter(options)` → `await init()` → (register inputs/resources) → `await render(...)`. No `start()`/`terminate()`.

```tsx
import { OfflineSmelter } from "@swmansion/smelter-web-client";
import { View } from "@swmansion/smelter";

async function run() {
  const smelter = new OfflineSmelter({ url: "http://127.0.0.1:8081" });
  await smelter.init();
  // register inputs here
  await smelter.render(<View />, {
    type: "mp4",
    serverPath: "./output.mp4",
    video: {
      encoder: { type: "ffmpeg_h264" },
      resolution: { width: 1920, height: 1080 },
    },
    audio: { channels: "stereo", encoder: { type: "aac" } },
  });
}
void run();
```

### Constructor

```tsx
new OfflineSmelter(options: SmelterOptions)

type SmelterOptions = {
  url: string;
};
```

### Methods

```tsx
init(): Promise<void>
render(root: React.ReactElement, output: RegisterOutput): Promise<object>
registerInput(inputId: string, input: RegisterInput): Promise<object>
registerImage(imageId: string, image: Renderers.RegisterImage): Promise<void>
registerShader(shaderId: string, shader: Renderers.RegisterShader): Promise<void>
registerFont(source: string | ArrayBuffer): Promise<void>
```

`RegisterOutput` / `RegisterInput` are the same unions as the live `Smelter`. MP4 and HLS are the practical choices; WHIP, WHEP, RTMP, and RTP are accepted but rarely make sense offline (frames render as fast as possible). No `unregisterInput`/`unregisterOutput`/`registerWebRenderer`/`terminate` in offline mode.
