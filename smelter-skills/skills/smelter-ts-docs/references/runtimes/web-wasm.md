# Browser WASM runtime (`@swmansion/smelter-web-wasm`)

Runs the **entire** Smelter rendering engine directly in the browser — no separate Smelter server. Your React code runs in the browser; React tree updates are handled by the WASM module running in a separate Web Worker, which does all media processing and output generation locally.

There is no `OfflineSmelter` and no `SmelterManager` in this runtime — only the `Smelter` class plus a one-time WASM bundle setup. Inputs/outputs are Web-API based and differ from the server runtimes.

**Install:**

```sh
npm install @swmansion/smelter @swmansion/smelter-web-wasm react
```

`@swmansion/smelter-browser-render` (which ships `smelter.wasm`) is pulled in transitively; you must host that `.wasm` file yourself (see setup below). React `18.3.1` recommended.

## Compatibility

Targets SDK **v0.4.0**. Runs in Google Chrome / Chromium-based browsers only. React
**18.3.1** recommended (any React compatible with `react-reconciler@0.29.2`). There is
no separate Smelter server version — the engine is the WASM bundle.

---

## Required setup

Before starting any Smelter instance:

1. Host `smelter.wasm` (shipped inside `@swmansion/smelter-browser-render`) as a static asset on your site.
2. Call `setWasmBundleUrl(url)` with the URL to the hosted `smelter.wasm`, once, before constructing any `Smelter`:
   ```ts
   import { setWasmBundleUrl } from "@swmansion/smelter-web-wasm";
   setWasmBundleUrl('/smelter.wasm');
   ```
3. The engine runs in a Web Worker, so your bundler must handle this library-internal syntax:
   ```js
   new Worker(new URL('../esm/runWorker.mjs', import.meta.url), { type: 'module' });
   ```

Bundler specifics:

- **Vite** — copy `smelter.wasm` into the build (e.g. via `vite-plugin-static-copy` from `dirname(require.resolve('@swmansion/smelter-browser-render'))`), and set:
  ```ts
  optimizeDeps: {
    exclude: ['@swmansion/smelter-web-wasm'],
    include: ['@swmansion/smelter-web-wasm > pino'],
  }
  ```
  Then `setWasmBundleUrl('/assets/smelter.wasm')` (matching your copy destination).
- **Next.js** — copy `smelter.wasm` into `public/` via webpack `CopyPlugin`, set `config.resolve.fallback["compositor_web_bg.wasm"] = false`, and add `@swmansion/smelter-web-wasm` to `config.externals` when `isServer`. Then `setWasmBundleUrl('/smelter.wasm')`.

Ready-made example projects: github.com/smelter-labs/examples.

---

## `Smelter` class

```tsx
import Smelter from "@swmansion/smelter-web-wasm"
```

Lifecycle: `new Smelter(options?)` → `await init()` → (optionally register resources) → `await start()` → (optionally register more) → `await terminate()`.

### Constructor

```tsx
new Smelter(options: SmelterOptions)

type Framerate = { num: number; den: number };
type SmelterOptions = {
  framerate?: Framerate | number;
  streamFallbackTimeoutMs: number;
};
```

- `framerate?: Framerate | number` — output framerate, as a number or `{ num, den }` fraction.
- `streamFallbackTimeoutMs: number` — timeout before falling back when a stream stalls.

### Methods

```tsx
// Initialize the instance (loads the WASM engine). No output until start().
init(): Promise<void>

// Start the pipeline; registered outputs begin producing.
start(): Promise<void>

registerOutput(outputId: string, root: React.ReactElement, output: RegisterOutput): Promise<object>
unregisterOutput(outputId: string): Promise<void>

registerInput(inputId: string, input: RegisterInput): Promise<void>
unregisterInput(inputId: string): Promise<void>

registerImage(imageId: string, image: Renderers.RegisterImage): Promise<void>
unregisterImage(imageId: string): Promise<void>
registerShader(shaderId: string, shader: Renderers.RegisterShader): Promise<void>
unregisterShader(shaderId: string): Promise<void>

registerFont(source: FontSource): Promise<void>  // FontSource = string (URL)

// Terminate the compositor instance.
terminate(): Promise<void>
```

`Renderers.*` types come from `@swmansion/smelter`. Note: there is **no** `registerWebRenderer` in the WASM runtime, and `FontSource` here is only a URL string (no `ArrayBuffer`).

### Supported outputs

Web-API based, different from the server runtimes:

```tsx
type RegisterOutput =
  | {
      type: 'stream';
      video: { resolution: Api.Resolution };
      audio?: boolean;
    }
  | {
      type: 'canvas';
      video: { canvas: HTMLCanvasElement; resolution: Api.Resolution };
      audio?: boolean;
    }
  | {
      type: 'whip_client';
      endpointUrl: string;
      bearerToken?: string;
      iceServers?: RTCConfiguration['iceServers'];
      video: { resolution: Api.Resolution; maxBitrate?: number };
      audio?: boolean;
    };
```

(`Api.Resolution` is `{ width: number; height: number }`.) For `type: 'stream'`, `registerOutput` resolves to an object containing a `MediaStream` (`{ stream }`) you can assign to a `<video>` element.

- `../outputs/wasm-stream.md` — MediaStream (Web API)
- `../outputs/wasm-canvas.md` — Canvas (Web API)
- `../outputs/wasm-whip.md` — WHIP (Web API)

### Supported inputs

```tsx
type RegisterInput =
  | { type: 'mp4'; url: string }
  | { type: 'camera' }
  | { type: 'screen_capture' }
  | { type: 'stream'; stream: MediaStream }
  | { type: 'whep_client'; endpointUrl: string; bearerToken?: string };
```

- `../inputs/wasm-camera.md` — Camera (Web API)
- `../inputs/wasm-screen.md` — Screen capture (Web API)
- `../inputs/wasm-stream.md` — MediaStream (Web API)
- `../inputs/mp4.md` — MP4 (by URL)
- `../inputs/wasm-whep.md` — WHEP (Web API)

---

## Example: camera + WHIP output with a `<video>` preview

A React component mounts a `Smelter`, registers a camera input and a WHIP output, and previews the output stream in a `<video>` element. `registerOutput` with `type: 'stream'` (or `whip_client`) returns `{ stream }` usable as `videoElement.srcObject`. Inputs can be registered after `start()` (e.g. on a button click).

```tsx
import { useEffect, useRef, useState } from "react";
import { Rescaler, InputStream, View, useInputStreams } from "@swmansion/smelter";
import Smelter from "@swmansion/smelter-web-wasm";

function SmelterScene() {
  const inputs = useInputStreams();
  const hasScreenCapture = !!inputs['screen'];
  if (!hasScreenCapture) {
    return (
      <Rescaler>
        <InputStream inputId="camera" />
      </Rescaler>
    );
  }
  return (
    <View>
      <Rescaler>
        <InputStream inputId="camera" />
      </Rescaler>
      <Rescaler style={{ top: 20, left: 20, width: 640, height: 360 }}>
        <InputStream inputId="screen" />
      </Rescaler>
    </View>
  );
}

async function start(videoElement: HTMLVideoElement): Promise<Smelter> {
  const smelter = new Smelter();
  await smelter.init();

  await smelter.registerInput('camera', { type: 'camera' });

  const { stream } = await smelter.registerOutput('output', <SmelterScene />, {
    type: 'whip_client',
    endpointUrl: 'https://example.com/whip',
    bearerToken: '<STREAM TOKEN>',
    video: { resolution: { width: 1920, height: 1080 } },
    audio: true,
  });

  await smelter.start();

  videoElement.srcObject = stream;
  await videoElement.play();
  return smelter;
}

function DemoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [smelter, setSmelter] = useState<Smelter | undefined>();

  useEffect(() => {
    (async () => {
      const s = await start(videoRef.current!);
      setSmelter(s);
    })();
  }, []);

  const startScreenCapture = () =>
    smelter?.registerInput('screen', { type: 'screen_capture' });

  return (
    <div>
      <video ref={videoRef} />
      <button onClick={startScreenCapture}>Start screen sharing</button>
    </div>
  );
}
```

> ⚠️ **Caution:** This example omits cleanup, React strict-mode double-mount handling, and init/start race conditions. Handle those in production (see the smelter-labs/examples repo).
