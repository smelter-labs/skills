# Patterns & recipes

How to assemble a working Smelter app with the TypeScript SDK. Each recipe is a
copy-pasteable starting point. For per-component props see `./components/*.md`,
per-input/output config see `./inputs/*.md` and `./outputs/*.md`, runtimes see
`./runtimes/*.md`.

## Basic app skeleton (Node.js)

The flow is always: create + `init()` → register inputs → register output with a
scene (a React component) → `start()`.

```tsx
import { Tiles, InputStream } from "@swmansion/smelter";
import Smelter from "@swmansion/smelter-node";

function App() {
  return (
    <Tiles style={{ backgroundColor: "#4d4d4d" }}>
      <InputStream inputId="input_1" volume={0.9} />
      <InputStream inputId="input_2" />
    </Tiles>
  );
}

async function start() {
  const smelter = new Smelter();
  await smelter.init(); // downloads binaries and starts a local server

  await smelter.registerInput("input_1", { type: "mp4", serverPath: "input1.mp4" });
  await smelter.registerInput("input_2", { type: "mp4", serverPath: "input2.mp4" });

  await smelter.registerOutput("output", <App />, {
    type: "rtmp_client",
    url: "rtmp://127.0.0.1:8002",
    video: {
      resolution: { width: 1280, height: 720 },
      encoder: { type: "ffmpeg_h264" },
    },
    audio: {
      channels: "stereo",
      encoder: { type: "aac" },
    },
  });

  await smelter.start();
}
```

Key points:
- `init()` downloads binaries and runs a local server. To attach to an already-running
  server instead, pass an `ExistingInstanceManager`:
  ```tsx
  import Smelter, { ExistingInstanceManager } from "@swmansion/smelter-node";
  const smelter = new Smelter(new ExistingInstanceManager({ url: "http://127.0.0.1:8000" }));
  ```
- `start()` makes all registered outputs begin producing frames. All user-facing
  timestamps/offsets are relative to this call. Register inputs/outputs before calling it.
- Inputs you register but don't reference in the scene are simply not rendered.
- `volume` on `InputStream` (0–1) scales that source's audio; audio from all rendered
  inputs is mixed. Video is **not** auto-rescaled to the output — use `Rescaler` (below).
- Output protocol is just the config object's `type`. Other options: `rtp_stream`,
  `whip_client`, `mp4` (see `./outputs/*.md`). For `mp4`, you must
  `await smelter.unregisterOutput("output")` to flush metadata, or the file is corrupt.

Offline / batch rendering: instead of the live `Smelter`, use `OfflineSmelter` (see
`./runtimes/nodejs.md`) to render a finite composition to a file without real-time
playback. Same component model, simplified API: after `init()` and registering inputs,
call `await smelter.render(<Scene/>, output, durationMs?)` — the scene and the single
output are passed directly to `render()` (no separate `registerOutput`/`start`).

## Layout sizing rules (the foundation for every layout recipe)

Size resolution for layout components (`View`, `Tiles`, `Rescaler`):
- Explicit `width`/`height` always win.
- **Root** component → sized from the output resolution.
- **Statically positioned child** of a layout component → fills the area its parent
  gives it, unless explicitly sized. (`View` splits space evenly among static children.)
- **Absolutely positioned child** (any of `top`/`bottom`/`left`/`right` set) → same size
  as parent unless explicitly sized; rendered on top and ignored by sibling layout.
- **Child of a non-layout component** (`Shader`, `WebView`) → size is **required**.

Practical: don't size the root `View`; the output already defines it. When nesting, you
usually set only `width` *or* `height`, or nothing.

## Fill / fit a source into a region — Rescaler

When you want a source to fit a region instead of being cropped to the output. A bare
`InputStream` is drawn at native resolution (e.g. a 1920x1080 source on a 1280x720
output shows only a cropped portion). Wrap it in `Rescaler`:

```tsx
function App() {
  return (
    <View style={{ backgroundColor: "#4d4d4d" }}>
      <Rescaler>
        <InputStream inputId="input_1" />
      </Rescaler>
    </View>
  );
}
```

The `Rescaler` (only static child of root `View`) takes the full output size and scales
the input to fit, preserving aspect ratio (letterboxed/centered if it doesn't match).
See `./components/rescaler.md` for fit-vs-fill mode.

## Side-by-side / split — View with multiple children

When you want two (or N) sources splitting the frame evenly. `View` lays static children
out in a row (default) or column, splitting space equally:

```tsx
function App() {
  return (
    <View style={{ backgroundColor: "#4d4d4d" }}>
      <Rescaler>
        <InputStream inputId="input_1" />
      </Rescaler>
      <Rescaler>
        <InputStream inputId="input_2" />
      </Rescaler>
    </View>
  );
}
```

Two children of a 1280x720 root `View` each get 640x720; each `Rescaler` fits its input
into that box. Use `style={{ direction: "column" }}` on the `View` to stack vertically
instead of side-by-side.

## Grid / auto-layout — Tiles

When you want a video-call style grid that packs N sources efficiently without manual
sizing. `Tiles` arranges children into the most space-efficient grid automatically:

```tsx
function App() {
  return (
    <Tiles style={{ backgroundColor: "#4d4d4d" }}>
      <InputStream inputId="input_1" />
      <InputStream inputId="input_2" />
      <InputStream inputId="input_3" />
    </Tiles>
  );
}
```

`Tiles` does not support absolute positioning. See `./components/tiles.md`.

## Picture-in-picture / corner overlay

When you want one source full-frame and another in a corner. Give the overlay `Rescaler`
an explicit size plus absolute positioning (`top`/`right`/etc.). Absolutely positioned
children render on top and don't affect the layout of static siblings:

```tsx
function App() {
  return (
    <View style={{ backgroundColor: "#4d4d4d" }}>
      <Rescaler>
        <InputStream inputId="input_1" /> {/* fills the frame */}
      </Rescaler>
      <Rescaler style={{ width: 320, height: 180, top: 20, right: 20 }}>
        <InputStream inputId="input_2" /> {/* pinned top-right */}
      </Rescaler>
    </View>
  );
}
```

## Overlays — lower-third / text-over-video

When you want text or a graphic layered over video. Same trick: an absolutely positioned
child `View` over the video content. Use a `backgroundColor` with an alpha channel
(8-digit hex, e.g. `"#00000080"` = 50% black) for a readable semi-transparent banner.

```tsx
function App() {
  return (
    <View>
      <Rescaler>
        <InputStream inputId="input_1" />
      </Rescaler>
      {/* lower third */}
      <View
        style={{
          height: 80,
          bottom: 40,
          left: 60,
          right: 60,
          backgroundColor: "#00000080",
          padding: 16,
        }}
      >
        <Text style={{ fontSize: 36, color: "#FFFFFF" }}>Jane Doe — Host</Text>
      </View>
    </View>
  );
}
```

The overlay `View` sets `bottom`/`left`/`right` (absolute) so it ignores sibling layout
and floats over the video. The alpha in `backgroundColor` keeps the video partly visible
behind the text. For text-over-video, drop the background and just absolutely position a
`Text`. See `./components/view.md` and the `Text` component reference.

## Transitions / animation

When you want a property change to animate instead of snapping. `View` and `Rescaler`
animate their children automatically as long as a `transition` field is set: when the
scene re-renders with a new value (e.g. a different `width`), the component interpolates
from the old state to the new one over `durationMs`.

```tsx
function App() {
  const [expanded, setExpanded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setExpanded(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <View style={{ backgroundColor: "#4d4d4d" }}>
      <Rescaler
        style={{ width: expanded ? 1280 : 480 }}
        transition={{ durationMs: 2000 }}
      >
        <InputStream inputId="input_1" />
      </Rescaler>
    </View>
  );
}
```

Key points:
- Animation is driven by re-rendering with changed style. Trigger it with normal React
  state (`useState` + `useEffect`/timers), or with Smelter hooks like
  `useAfterTimestamp` (see `./hooks/use-after-timestamp.md`).
- Sibling layout adjusts automatically: if one of two `Rescaler` siblings animates its
  width, the other reflows to match.
- Easing via `transition.easingFunction`. Default is `"linear"`. Also `"bounce"`, or a
  cubic bezier:
  ```tsx
  transition={{
    durationMs: 2000,
    easingFunction: { functionName: "cubic_bezier", points: [0.65, 0, 0.35, 1] },
  }}
  ```

Note: components are matched across scene updates by their `id` (or stable position in
the tree). Keep a component's identity stable so Smelter knows which old state to
animate from.

## Dynamic composition — add/remove inputs at runtime

When you want to change what's on screen while running. The scene is a live React tree:
register/unregister inputs with the `Smelter` API and update state to re-render the
scene. No need to re-register the output.

```tsx
function App({ inputIds }: { inputIds: string[] }) {
  return (
    <Tiles style={{ backgroundColor: "#4d4d4d" }}>
      {inputIds.map((id) => (
        <InputStream key={id} inputId={id} />
      ))}
    </Tiles>
  );
}

// Outside the component, driving the changes:
await smelter.registerInput("input_3", { type: "mp4", serverPath: "input3.mp4" });
// then update whatever state feeds `inputIds` so <App /> re-renders with input_3.

// Later, drop it:
await smelter.unregisterInput("input_3");
// and remove it from the rendered list.
```

The `useInputStreams` hook gives you the set of connected inputs reactively if you want
the scene to follow registrations automatically (see `./hooks/use-input-streams.md`).
Re-rendering with a `transition` (above) makes the appearance/disappearance animate.

## Web rendering (Node.js only, experimental)

When you want to render a live website into the composition, optionally with input
streams embedded into HTML elements. Requires a Smelter build with web renderer support
and `SMELTER_WEB_RENDERER_ENABLE=true` on the server.

```tsx
// 1. Register a web renderer instance.
await smelter.registerWebRenderer("example_website", {
  url: "https://example.com",
  resolution: { width: 1920, height: 1080 },
  embeddingMethod: "native_embedding_over_content",
});

// 2. Use it via a WebView whose instanceId matches.
function App() {
  return (
    <WebView instanceId="example_website">
      {/* 3. (optional) embed an input into an HTML element by matching id */}
      <InputStream id="my_video" inputId="input_1" />
    </WebView>
  );
}
```

Key points:
- The child component's `id` must match the HTML element id on the page where it's embedded.
- `embeddingMethod`: prefer `native_embedding_over_content` (over page content) or
  `native_embedding_under_content` (under content; page needs a transparent background).
  `chromium_embedding` draws into HTML canvases but costs an extra copy per input frame
  and hurts performance with many inputs.
- Only one `WebView` may use a given renderer instance at a time.
- See `./resources/web-renderer.md` for the full registration config.
