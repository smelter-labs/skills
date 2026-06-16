# WHIP client output (Web API)

Sends the output stream to a WHIP endpoint over WebRTC, from the browser. Used with `@swmansion/smelter-web-wasm`.

**Availability:** Browser (WASM)

> Note: this is the WASM browser WHIP output. The Node.js / client WHIP output has a different, richer shape (encoder preferences, mixing strategy) — see `whip.md`.

## Usage

```tsx
import Smelter from "@swmansion/smelter-web-wasm";
import { View } from "@swmansion/smelter";

const smelter = new Smelter();
await smelter.init();
await smelter.registerOutput("example", <View />, {
  type: "whip_client",
  endpointUrl: "https://example.com/whip",
  video: {
    resolution: { width: 1920, height: 1080 },
  },
  audio: true,
});
```

## Type

```tsx
type RegisterWhipClientOutput = {
  type: "whip_client";
  endpointUrl: string;
  bearerToken?: string;
  iceServers?: RTCConfiguration["iceServers"];
  video: WhipClientOutputVideo;
  audio?: boolean;
};

type WhipClientOutputVideo = {
  resolution: { width: number; height: number };
  maxBitrate?: number;
};
```

## Properties

### endpointUrl
WHIP endpoint URL.
- **Type:** `string`

---

### bearerToken
Bearer token for the WHIP connection.
- **Type:** `string`

---

### iceServers
ICE servers added to the `RTCPeerConnection`.
- **Type:** `RTCConfiguration["iceServers"]`
- **Default:** `[{ urls: "stun:stun.l.google.com:19302" }]`

---

### video
Output video parameters. Required. See [WhipClientOutputVideo](#whipclientoutputvideo).
- **Type:** `WhipClientOutputVideo`

---

### audio
If `true`, the WebRTC connection includes an audio track.
- **Type:** `boolean`
- **Default:** `false`

## WhipClientOutputVideo

- **resolution** — `{ width: number; height: number }`. Output video resolution.
- **maxBitrate** — `number`. Max bitrate of the stream.

## Encoders

Not applicable. Encoding/codec selection is handled by the browser's WebRTC stack and negotiated over WHIP; there are no Smelter codec/encoder options to configure here (aside from `video.maxBitrate`).
