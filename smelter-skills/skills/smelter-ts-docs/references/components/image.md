# Image

A component for rendering images, from an external URL or from a local path on the machine hosting the Smelter instance. Supports static and animated formats (and SVG).

**Availability:** Node.js · Browser (Client) · Browser (WASM)

## Usage

```tsx
import { Image, View } from "@swmansion/smelter";

function ExampleApp() {
  return (
    <View style={{ backgroundColor: "#52505b" }}>
      <Image source="https://example.com/image.svg" />
    </View>
  );
}
```

You can either reference a pre-registered image via `imageId` (registered with `Smelter.registerImage`) or pass an inline `source`.

> **Note:** Exactly one of `imageId` and `source` must be defined.

## Type

```tsx
type ImageProps = {
  id?: string;
  imageId?: string;
  source?: string;
  style?: ImageStyleProps;
};
```

## Props

### imageId
ID of an image registered with `Smelter.registerImage`.
- **Type**: `string`

---

### source
URL or local path to the image. A local path must be local to the machine running the Smelter server.
- **Type**: `string`

---

### id
Component ID.
- **Type**: `string`
- **Default**: value produced by the `useId` hook

---

### style
Image styling properties (see `ImageStyleProps` below).
- **Type**: `ImageStyleProps`

## ImageStyleProps

```tsx
type ImageStyleProps = {
  width?: number;
  height?: number;
};
```

### width
Width in pixels. If `height` is not given, height auto-adjusts to preserve the original aspect ratio.
- **Type**: `number`

---

### height
Height in pixels. If `width` is not given, width auto-adjusts to preserve the original aspect ratio.
- **Type**: `number`
