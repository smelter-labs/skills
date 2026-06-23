# AAC

AAC audio encoder. Referenced from an output's `AudioEncoderOptions` via `{ "type": "aac", ... }`.

## Type

```tsx
type AacEncoderOptions = {
  type: "aac";
  sample_rate?: u32;
};
```

## Properties

### sample_rate
Sample rate.

- **Type**: `u32`
- **Default value**: `44100`
- **Supported values**: `8000`, `16000`, `24000`, `44100`, `48000`
