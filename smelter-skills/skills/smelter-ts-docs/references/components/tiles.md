# Tiles

A layout component that arranges all children side by side into equal-sized, non-overlapping rectangles (tiles), optimizing use of available space.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

## Usage

```tsx
import { InputStream, Rescaler, Tiles, useInputStreams } from "@swmansion/smelter";

function ExampleApp() {
  const inputs = useInputStreams();
  return (
    <Tiles transition={{ durationMs: 200 }}>
      {Object.values(inputs).map((input) => (
        <Rescaler key={input.inputId} style={{ rescaleMode: "fill" }}>
          <InputStream inputId={input.inputId} />
        </Rescaler>
      ))}
    </Tiles>
  );
}
```

## Positioning

> ⚠️ **Caution:** Tiles do **not** support absolute positioning of children — `top`/`left`/`right`/`bottom`/`rotation` on children are ignored (children still render). Tiles also **cannot** be absolutely positioned relative to their parent.

Tiles choose the number of rows/columns based on: the size of the `Tiles` component, the tile aspect ratio (`tileAspectRatio`), and the number of children. They pick the layout that fills the largest area. Children are placed in order, left to right, row by row, top to bottom.
- **Non-layout child** — scaled proportionally to fit a tile; centered if aspect ratios differ.
- **Layout child** — takes the tile's width/height, ignoring its own `width`/`height`.

## Transitions

Tiles' transitions are predefined and applied automatically; `transition` only customizes their timing/easing (it does not work like `View`/`Rescaler` size transitions):
- **Adding a component** — existing components shift to new positions over `transition.durationMs`; the new child then appears without animation.
- **Removing a component** — the tile disappears immediately, then the rest relocate over `transition.durationMs`.
- **Reordering children** — elements relocate to new positions over `transition.durationMs`.

> **Note:** For more custom animations, wrap `Tiles` in a [View](./view.md) and apply the transition to the wrapper.

## Type

```tsx
type TilesProps = {
  id?: string;
  children: ReactNode;
  style?: TilesStyleProps;
  transition?: Transition;
};
```

## Props

### children
Each child is displayed within a single tile.
- **Type**: `ReactNode`

---

### id
Component ID.
- **Type**: `string`
- **Default**: value produced by the `useId` hook

---

### style
Tiles styling properties (see `TilesStyleProps` below).
- **Type**: `TilesStyleProps`

---

### transition
Transition properties applied while reordering children.
- **Type**: `Transition` (see below)

---

## TilesStyleProps

```tsx
type TilesStyleProps = {
  width?: number;
  height?: number;
  backgroundColor?: string;
  tileAspectRatio?: string;
  margin?: number;
  padding?: number;
  horizontalAlign?: "left" | "right" | "justified" | "center";
  verticalAlign?: "top" | "center" | "bottom" | "justified";
};
```

### width
Width in pixels. **Required** when the parent is a non-layout component; for layout parents see that component's docs.
- **Type**: `number`

---

### height
Height in pixels. **Required** when the parent is a non-layout component; for layout parents see that component's docs.
- **Type**: `number`

---

### backgroundColor
Background color in `#RRGGBBAA` or `#RRGGBB` format.
- **Type**: `string`
- **Default**: `#00000000`

---

### tileAspectRatio
Aspect ratio of each tile in `W:H` format (`W`, `H` integers).
- **Type**: `string`
- **Default**: `16:9`

---

### margin
Margin on each tile in pixels.
- **Type**: `number`
- **Default**: `0`

---

### padding
Padding on each tile in pixels.
- **Type**: `number`
- **Default**: `0`

---

### horizontalAlign
Horizontal alignment of tiles.
- **Type**: `"left" | "right" | "justified" | "center"`
- **Default**: `"center"`

---

### verticalAlign
Vertical alignment of tiles.
- **Type**: `"top" | "center" | "bottom" | "justified"`
- **Default**: `"center"`

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
