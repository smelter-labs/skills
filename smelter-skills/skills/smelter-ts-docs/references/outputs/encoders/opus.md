# Opus

Opus audio encoder. Selected via an output's `audio.encoder` as `{ type: "opus", ... }`. Note that some outputs only accept Opus under specific conditions (e.g. RTMP requires E-RTMP).

## Type

```tsx
type OpusEncoderOptions = {
  type: "opus";
  preset?: "quality" | "voip" | "lowest_latency";
  sampleRate?: number;
  forwardErrorCorrection?: boolean;
  expectedPacketLoss?: number;
};
```

## Properties

### preset
Audio output encoder preset.

- **Type**: `"quality" | "voip" | "lowest_latency"`
- **Default**: `"voip"`
- **Values**:
  - `quality` - Recommended for broadcast and high-fidelity applications requiring decoded audio to maintain maximum fidelity to the input signal.
  - `voip` - Recommended for VoIP and videoconferencing applications, prioritizing listening quality and speech intelligibility.
  - `lowest_latency` - Recommended **only** when achieving the lowest possible latency is the highest priority.

---

### sampleRate
Sample rate.

- **Type**: `number`
- **Default**: `48000`
- **Values**: `8000`, `16000`, `24000`, `48000`

---

### forwardErrorCorrection
When enabled, include in-band forward error correction (FEC) data to protect against packet loss.

- **Type**: `boolean`
- **Default**: `false`

---

### expectedPacketLoss
Expected packet loss expressed as a percentage. Controls how much redundant data is added to counteract packet loss (only effective when `forwardErrorCorrection` is enabled).

- **Type**: `number`
- **Default**: `0`
- **Values**: `0`–`100`
