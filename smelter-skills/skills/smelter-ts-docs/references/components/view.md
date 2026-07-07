# View

The core layout container, analogous to an HTML `<div>`. Holds children and basic styling, and can be composed and nested.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

## Usage

```tsx
import { View } from "@swmansion/smelter";

function ExampleApp() {
  return (
    <View>
      <View style={{ direction: "column" }}>
        <View style={{ backgroundColor: "red", height: 200 }} />
        <View style={{ backgroundColor: "blue" }} />
      </View>
      <View style={{ backgroundColor: "green" }} />
    </View>
  );
}
```

## Positioning

- **Absolute**: a child is absolutely positioned when it sets `top`, `left`, `right`, `bottom`, or `rotation`. `View` supports absolute positioning of its children; if the child has no explicit `width`/`height` it inherits them from the parent. A `View` can itself be absolutely positioned relative to its parent if the parent supports it.
- **Static**: statically positioned children are laid out next to each other (along `direction`).

> ⚠️ **Caution:** A parent `View` does not respect the size of its children — it will not auto-expand to fit them.

> **Box model:** `width`/`height` describe the content box. `borderWidth` and `padding` are added **outside** it — rendered size = `width + paddingLeft + paddingRight + 2*borderWidth` (same for height) — and `top`/`left` position the outer (border) edge. To center on a point, offset by half the *rendered* size.

## Centering

`View` has no flex-style alignment (no `justifyContent`/`alignItems`); static children stack from the top-left along `direction`. Unsized static children split the remaining space equally — which enables the spacer pattern:

- **Spacer views** (general-purpose): surround the child with empty `<View />`s along the parent's `direction`; the spacers absorb the slack equally. Nest row inside column to center in both axes:

  ```tsx
  <View style={{ direction: "column" }}>
    <View />
    {/* explicit height required: an unsized middle child would be
        treated as a spacer and get 1/3 of the height */}
    <View style={{ direction: "row", height: 200 }}>
      <View />
      <View style={{ width: 300, height: 200 }} /> {/* centered child */}
      <View />
    </View>
    <View />
  </View>
  ```

- **Media / subtrees that may resize**: wrap in a `Rescaler` — `horizontalAlign`/`verticalAlign` default to `"center"`; note it scales the child to fit (including upscaling smaller children).
- **Text**: give `Text` a `width` equal to its container and `align: "center"`.
- **Absolute positioning**: `left: (parentWidth - childWidth) / 2` (same for `top`); `borderWidth`/`padding` grow the box beyond its declared size, so offset by half the rendered size.

## Transitions

On a scene update, `View` animates between the old and new state if `transition` is set. Both scenes must contain a `View` with the same `id`. Only some fields animate:
- `width` / `height` — only within the same positioning mode; a positioning-mode change makes the transition fail.
- `top` / `bottom` / `left` / `right` / `rotation` — only when the same field changes value. If a field is defined in the old scene but not the new one (or the positioning type changes), the transition is skipped.

## Type

```tsx
type ViewProps = {
  id?: string;
  children?: ReactNode;
  style?: ViewStyleProps;
  transition?: Transition;
};
```

## Props

### children
Content displayed within the `View`.
- **Type**: `ReactNode`

---

### id
Component ID. Required for transitions to match across scene updates.
- **Type**: `string`
- **Default**: value produced by the `useId` hook

---

### style
View styling properties (see `ViewStyleProps` below).
- **Type**: `ViewStyleProps`

---

### transition
Behavior during a scene update. Only takes effect if the previous scene contained a `View` with a matching `id`.
- **Type**: `Transition` (see below)

---

## ViewStyleProps

```tsx
type ViewStyleProps = {
  width?: number;
  height?: number;
  direction?: "row" | "column";
  top?: number;
  left?: number;
  bottom?: number;
  right?: number;
  rotation?: number;
  overflow?: "visible" | "hidden" | "fit";
  backgroundColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  borderColor?: string;
  boxShadow?: BoxShadow[];
  padding?: number;
  paddingVertical?: number;
  paddingHorizontal?: number;
  paddingTop?: number;
  paddingRight?: number;
  paddingBottom?: number;
  paddingLeft?: number;
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

### direction
How static children are positioned. `"row"` = left to right, `"column"` = top to bottom.
- **Type**: `"row" | "column"`
- **Default**: `"row"`

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

### overflow
Behavior for content exceeding the area.
- **Type**: `"visible" | "hidden" | "fit"`
- **Default**: `"hidden"`
- `"visible"` — render everything, including content beyond the parent.
- `"hidden"` — render only the parts inside the parent area.
- `"fit"` — if children are too big, resize everything inside to fit. Components with unknown sizes are treated as size 0 when computing the scale factor. Note: `fit` also resizes absolutely positioned elements.

---

### backgroundColor
Background color in `#RRGGBBAA` or `#RRGGBB` format.
- **Type**: `string`
- **Default**: `#00000000`

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

---

### padding
Padding on every side, in pixels.
- **Type**: `number`
- **Default**: `0.0`

---

### paddingVertical
Padding on the top and bottom sides.
- **Type**: `number`
- **Default**: `0.0`

---

### paddingHorizontal
Padding on the left and right sides.
- **Type**: `number`
- **Default**: `0.0`

---

### paddingTop
Padding on the top side.
- **Type**: `number`
- **Default**: `0.0`

---

### paddingRight
Padding on the right side.
- **Type**: `number`
- **Default**: `0.0`

---

### paddingBottom
Padding on the bottom side.
- **Type**: `number`
- **Default**: `0.0`

---

### paddingLeft
Padding on the left side.
- **Type**: `number`
- **Default**: `0.0`

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
