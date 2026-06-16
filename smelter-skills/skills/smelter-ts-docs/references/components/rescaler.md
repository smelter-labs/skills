# Rescaler

A layout component that resizes its single child to match its own size, always preserving aspect ratio.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

## Usage

```tsx
import { Image, Rescaler, View } from "@swmansion/smelter";

function ExampleApp() {
  return (
    <View style={{ backgroundColor: "#52505b" }}>
      <Rescaler>
        <Image source="https://example.com/image.png" />
      </Rescaler>
      <Rescaler style={{ rescaleMode: "fill" }}>
        <Image source="https://example.com/image.png" />
      </Rescaler>
    </View>
  );
}
```

## Transitions

On a scene update, `Rescaler` animates between old and new state if `transition` is set. Both scenes must contain a `Rescaler` with the same `id`. Only some fields animate:
- `width` / `height` — only within the same positioning mode; a positioning-mode change makes the transition fail.
- `top` / `bottom` / `left` / `right` / `rotation` — only when the same field changes value. If a field is defined in the old scene but not the new one (or the positioning type changes), the transition is skipped.

## Type

```tsx
type RescalerProps = {
  id?: string;
  children: ReactElement;
  style?: RescalerStyleProps;
  transition?: Transition;
};
```

## Props

### children
Exactly one child component.
- **Type**: `ReactElement`

---

### id
Component ID.
- **Type**: `string`
- **Default**: value produced by the `useId` hook

---

### style
Rescaler styling properties (see `RescalerStyleProps` below).
- **Type**: `RescalerStyleProps`

---

### transition
Behavior during a scene update. Only takes effect if the previous scene contained a `Rescaler` with the same `id`.
- **Type**: `Transition` (see below)

---

## RescalerStyleProps

```tsx
type RescalerStyleProps = {
  rescaleMode?: "fit" | "fill";
  horizontalAlign?: "left" | "right" | "justified" | "center";
  verticalAlign?: "top" | "center" | "bottom" | "justified";
  width?: number;
  height?: number;
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  rotation?: number;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: BoxShadow[];
};
```

### rescaleMode
Content resize mode.
- **Type**: `"fit" | "fill"`
- **Default**: `"fit"`
- `"fit"` — resize to match one dimension of the parent, keeping the content fully visible.
- `"fill"` — resize to cover the whole parent by matching at least one dimension; excess is clipped.

---

### horizontalAlign
Horizontal alignment.
- **Type**: `"left" | "right" | "justified" | "center"`
- **Default**: `"center"`

---

### verticalAlign
Vertical alignment.
- **Type**: `"top" | "center" | "bottom" | "justified"`
- **Default**: `"center"`

---

### width
Width in pixels. **Required** when the parent is a non-layout component; for layout parents see that component's docs.
- **Type**: `number`

---

### height
Height in pixels. **Required** when the parent is a non-layout component; for layout parents see that component's docs.
- **Type**: `number`

---

### top
Distance in pixels from the parent's top edge. Setting it makes the element absolutely positioned.
- **Type**: `number`

---

### right
Distance in pixels from the parent's right edge. Setting it makes the element absolutely positioned.
- **Type**: `number`

---

### bottom
Distance in pixels from the parent's bottom edge. Setting it makes the element absolutely positioned.
- **Type**: `number`

---

### left
Distance in pixels from the parent's left edge. Setting it makes the element absolutely positioned.
- **Type**: `number`

---

### rotation
Rotation in degrees. Setting it makes the element absolutely positioned.
- **Type**: `number`

---

### borderRadius
Radius of a rounded corner.
- **Type**: `number`
- **Default**: `0.0`

---

### borderWidth
Border width.
- **Type**: `number`
- **Default**: `0.0`

---

### borderColor
Border color in `#RRGGBBAA` format.
- **Type**: `string`
- **Default**: `#00000000`

---

### boxShadow
List of box shadows (see `BoxShadow` below).
- **Type**: `BoxShadow[]`

## BoxShadow

```tsx
type BoxShadow = {
  offsetX?: number;
  offsetY?: number;
  color?: string;
  blurRadius?: number;
};
```

- **offsetX** `number` (default `0.0`) — horizontal offset; positive = right, negative = left.
- **offsetY** `number` (default `0.0`) — vertical offset; positive = down, negative = up.
- **color** `string` (default `#FFFFFFFF`) — color in `#RRGGBBAA` format.
- **blurRadius** `number` (default `0.0`) — radius of the blur effect.

## Transition

```tsx
type Transition = {
  durationMs: number;
  easingFunction?: EasingFunction | null;
  shouldInterrupt?: boolean;
};
```

- **durationMs** `number` — duration of the transition in milliseconds.
- **easingFunction** `EasingFunction` (default `"linear"`) — interpolation curve (see below).
- **shouldInterrupt** `boolean` (default `false`) — if `true`, a new transition starts from the current state instead of continuing the ongoing one.

## EasingFunction

```tsx
type EasingFunction =
  | "linear"
  | "bounce"
  | {
      functionName: "cubic_bezier";
      points: [number, number, number, number];
    };
```

- `"linear"` / `"bounce"` — predefined curves.
- `cubic_bezier` — `points` are four numbers in `[0, 1]`; the result is clamped to `[0, 1]`.
