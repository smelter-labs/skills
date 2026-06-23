# AAC

AAC audio encoder. Selected via an output's `audio.encoder` as `{ type: "aac", ... }`.

## Type

```tsx
type AacEncoderOptions = {
  type: "aac";
  sampleRate?: number;
};
```

## Properties

### sampleRate
Sample rate.

- **Type**: `number`
- **Default**: `44100`
- **Values**: `8000`, `16000`, `24000`, `44100`, `48000`
