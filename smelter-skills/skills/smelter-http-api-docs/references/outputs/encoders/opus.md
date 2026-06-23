# Opus

Opus audio encoder. Referenced from an output's `AudioEncoderOptions` via `{ "type": "opus", ... }`.

## Type

```tsx
type OpusEncoderOptions = {
  type: "opus";
  preset?: "quality" | "voip" | "lowest_latency";
  sample_rate?: u32;
  forward_error_correction?: bool;
  expected_packet_loss?: u32;
};
```

## Properties

### preset
Audio output encoder preset.

- **Type**: `"quality" | "voip" | "lowest_latency"`
- **Default value**: `voip`
- **Supported values**:
  - `quality` - Recommended for broadcast and high-fidelity applications requiring decoded audio to maintain maximum fidelity to the input signal.
  - `voip` - Recommended for VoIP and videoconferencing applications, prioritizing listening quality and speech intelligibility.
  - `lowest_latency` - Recommended **only** when achieving the lowest possible latency is the highest priority.

---

### sample_rate
Sample rate.

- **Type**: `u32`
- **Default value**: `48000`
- **Supported values**: `8000`, `16000`, `24000`, `48000`

---

### forward_error_correction
When enabled, include in-band forward error correction data to protect against packet loss (see RFC 6716 sections 2.1.7 and 4.2.5).

- **Type**: `bool`
- **Default value**: `false`

---

### expected_packet_loss
Expected packet loss expressed as a percentage. Controls how much redundant data is added to counteract packet loss (only when forward error correction is enabled).

- **Type**: `u32`
- **Default value**: `0`
- **Supported values**: `0-100`
