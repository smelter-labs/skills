# Node.js runtime (`@swmansion/smelter-node`)

Controls a Smelter server from a Node.js process. Your React code runs in Node.js; React tree updates are sent to the Smelter server as layout updates over HTTP. By default the server binary is downloaded and spawned locally on the same machine, but you can also connect to an independently deployed instance.

**Install:**

```sh
npm install @swmansion/smelter @swmansion/smelter-node react
```

`@swmansion/smelter` provides components/hooks/inputs/outputs types; `@swmansion/smelter-node` provides the runtime. React `18.3.1` recommended.

Two modes:
- **Live processing** — `Smelter` class. Dynamically add/remove inputs/outputs at any time. Media processed in real time by default (affected by required inputs / global settings).
- **Offline processing** — `OfflineSmelter` class. Combine static files into a single output. Restricted API: all inputs defined before render, exactly one output. Frames produced as fast as possible.

## Compatibility

| SDK version | Smelter server version | React version |
|---|---|---|
| `v0.2.0`, `v0.2.1` | `v0.4.0`, `v0.4.1` | Recommended `18.3.1`; any react compatible with `react-reconciler@0.29.2` |
| `v0.3.0` | `v0.5.0` | Recommended `18.3.1`; any react compatible with `react-reconciler@0.29.2` |
| `v0.4.0` | `v0.6.0` | Recommended `18.3.1`; any react compatible with `react-reconciler@0.29.2` |

The underlying Smelter server has its own deployment requirements (Docker / binaries).

---

## `Smelter` class (live)

```tsx
import Smelter from "@swmansion/smelter-node"
```

Lifecycle: `new Smelter()` → `await init()` → (optionally register resources) → `await start()` → (optionally register more) → `await terminate()`.

```tsx
import Smelter from "@swmansion/smelter-node";
import { View } from "@swmansion/smelter";

async function run() {
  const smelter = new Smelter();
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
new Smelter(manager?: SmelterManager)
```

- `manager` — how the client connects to / manages the server. Defaults to `LocallySpawnedInstanceManager`. See [Instance managers](#instance-managers).

### Methods

```tsx
// Initialize: spawn a new instance or connect to an existing one.
// No output is produced until start() is called.
init(): Promise<void>

// Start the processing pipeline; registered outputs begin producing streams.
start(): Promise<void>

// Register an output destination. Returns server response.
registerOutput(outputId: string, root: React.ReactElement, output: RegisterOutput): Promise<object>
unregisterOutput(outputId: string): Promise<void>

// Register an input source. Returns a handle for controlling the input.
registerInput(inputId: string, input: RegisterInput): Promise<InputHandle>
unregisterInput(inputId: string): Promise<void>

// Register/unregister resources (Renderers.* types from @swmansion/smelter).
registerImage(imageId: string, image: Renderers.RegisterImage): Promise<void>
unregisterImage(imageId: string): Promise<void>
registerShader(shaderId: string, shader: Renderers.RegisterShader): Promise<void>
unregisterShader(shaderId: string): Promise<void>
registerWebRenderer(instanceId: string, instance: Renderers.RegisterWebRenderer): Promise<object>
unregisterWebRenderer(instanceId: string): Promise<void>

// Register a font usable by the <Text> component.
registerFont(source: FontSource): Promise<void>  // FontSource = string (URL) | ArrayBuffer

// Tear down: may drop the connection or shut down the server depending on the manager.
terminate(): Promise<void>
```

> Note: `registerOutput` takes the React root as its second argument (`(outputId, root, output)`), unlike the server HTTP API.

### Supported outputs

`RegisterOutput` is a discriminated union on `type`:

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

`RegisterInput` is a discriminated union on `type`:

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

### Input handles

`registerInput` returns an `InputHandle` for controlling the input afterward. MP4 inputs return an `Mp4InputHandle` (adds seeking); WHIP server inputs return a `WhipInputHandle` (exposes endpoint URL and bearer token).

```tsx
class InputHandle {
  get videoDurationMs(): number | undefined;  // video track length, if available
  get audioDurationMs(): number | undefined;  // audio track length, if available
  pause(): Promise<void>;   // stop delivering frames/samples. MP4 inputs only
  resume(): Promise<void>;  // resume a paused input. MP4 inputs only
}

class Mp4InputHandle extends InputHandle {
  seek(seekMs: number): Promise<void>;  // seek to position in the file (ms)
}

class WhipInputHandle extends InputHandle {
  get endpointRoute(): string | undefined;  // WHIP endpoint URL to connect to
  get bearerToken(): string | undefined;    // bearer token for the endpoint
}
```

---

## `OfflineSmelter` class (offline)

```tsx
import { OfflineSmelter } from "@swmansion/smelter-node"
```

Simplified API optimized for rendering a single output file (e.g. combine MP4s). Lifecycle: `new OfflineSmelter()` → `await init()` → (register inputs/resources) → `await render(...)`. There is no `start()`/`terminate()`; `render` runs the whole job.

```tsx
import { OfflineSmelter } from "@swmansion/smelter-node";
import { View } from "@swmansion/smelter";

async function run() {
  const smelter = new OfflineSmelter();
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
new OfflineSmelter(manager?: SmelterManager)
```

- `manager` — same `SmelterManager` as `Smelter`. See [Instance managers](#instance-managers).

### Methods

```tsx
init(): Promise<void>

// Render the React tree to a single output. Optional duration cap in ms.
render(root: React.ReactElement, output: RegisterOutput, duration_ms?: number): Promise<object>

registerInput(inputId: string, input: RegisterInput): Promise<object>
registerImage(imageId: string, image: Renderers.RegisterImage): Promise<void>
registerShader(shaderId: string, shader: Renderers.RegisterShader): Promise<void>
registerFont(source: string | ArrayBuffer): Promise<void>
```

`RegisterOutput` / `RegisterInput` are the same unions as the live `Smelter` (MP4 and HLS are the practical choices). WHIP, WHEP, RTMP, and RTP are technically accepted, but offline mode renders frames as fast as possible, so real-time protocols rarely make sense. There is no `unregisterInput`/`unregisterOutput`/`registerWebRenderer`/`terminate` in offline mode.

---

## Instance managers

The package controls the server via the `SmelterManager` interface, passed to the `Smelter`/`OfflineSmelter` constructor:

```tsx
type ApiRequest = { method: 'GET' | 'POST'; route: string; body?: object };
type MultipartRequest = { method: 'POST'; route: string; body: any };

type SmelterManager = {
  setupInstance(): Promise<void>;
  sendRequest(request: ApiRequest): Promise<object>;
  sendMultipartRequest(request: MultipartRequest): Promise<object>;
  registerEventListener(cb: (event: unknown) => void): void;
};
```

Two implementations are provided.

### `LocallySpawnedInstanceManager` (default)

Downloads the Smelter binary and spawns a server on the local machine.

```tsx
import Smelter, { LocallySpawnedInstanceManager } from "@swmansion/smelter-node";

const manager = new LocallySpawnedInstanceManager({ port: 8000 });
const smelter = new Smelter(manager);
await smelter.init();
```

```tsx
type LocallySpawnedInstanceOptions = {
  port: number;
  workingdir?: string;
  executablePath?: string;
  enableWebRenderer?: boolean;
};
```

- `port: number` — port where the Smelter API endpoint is exposed.
- `workingdir?: string` — working directory the instance uses: for temporary downloads (`SMELTER_DOWNLOAD_DIR`), to resolve relative paths for path options, and as the process CWD.
- `executablePath?: string` — path to a compositor executable; if set, used instead of downloading official binaries.
- `enableWebRenderer?: boolean` (default `false`) — enables Web Renderer support. Selects which binaries are downloaded (with/without web rendering) and sets the `SMELTER_WEB_RENDERER_ENABLE` env var.

### `ExistingInstanceManager`

Connects to an already-running Smelter server. Assumes it is the only client connecting to that server.

```tsx
import Smelter, { ExistingInstanceManager } from "@swmansion/smelter-node";

const manager = new ExistingInstanceManager({ url: 'http://127.0.0.1:8000' });
const smelter = new Smelter(manager);
await smelter.init();
```

```tsx
type ExistingInstanceOptions = {
  url: string | URL;
  authorizationHeader?: string;
};
```

- `url: string | URL` — address of the running server. The protocol also determines the WebSocket protocol (`http -> ws`, `https -> wss`).
- `authorizationHeader?: string` — value of the `Authorization` header sent with every request to the server.
