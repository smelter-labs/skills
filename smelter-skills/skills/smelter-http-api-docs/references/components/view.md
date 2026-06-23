# View

The core layout container in the Smelter API, analogous to an HTML `<div>`. It holds children and provides basic styling, and can be nested and composed. Used as a component inside an output scene (the `video.root` tree).

## Usage

```http
POST: /api/output/:output_id/update
Content-Type: application/json

{
  "video": {
    "root": {
      "type": "view",
      "children": [
        {
          "type": "view",
          "direction": "column",
          "children": [
            { "type": "view", "background_color": "red", "height": 200 },
            { "type": "view", "background_color": "blue" }
          ]
        },
        { "type": "view", "background_color": "green" }
      ]
    }
  }
}
```

## Positioning

- **Absolute**: a child is absolutely positioned when it sets `top`/`left`/`right`/`bottom`/`rotation` (relative to its parent), and the parent supports it. `View` supports absolutely positioning its children; without explicit `width`/`height` an absolutely positioned child inherits them from the parent. A `View` itself can be absolutely positioned relative to its parent if the parent supports it.
- **Static** (`direction: "row" | "column"`): children are placed next to each other (row aligned to the top, column aligned to the left). Per-child sizing: explicit `width`/`height` wins; an undefined `height` matches the parent; for undefined `width`, the defined widths are summed and the remaining parent width is divided equally between children with unknown widths (zero if the defined widths already exceed the parent). See `overview.md` for the full layout sizing model.

### Transitions

On a scene update, a `View` animates between the old and new state if `transition` is defined and both scenes contain a component with the same `id`. Only some fields animate:
- `width` / `height` — only within the same positioning mode; if the mode changes between scenes, the transition does not work.
- `bottom` / `top` / `left` / `right` / `rotation` — only when changing the value of the same field; if the old scene defines a field and the new one omits it, the transition does not work.

## Type

```tsx
type View = {
  type: "view";
  id?: string;
  children?: Component[];
  width?: f32;
  height?: f32;
  direction?: "row" | "column";
  top?: f32;
  left?: f32;
  bottom?: f32;
  right?: f32;
  rotation?: f32;
  transition?: Transition;
  overflow?: "visible" | "hidden" | "fit";
  background_color?: string;
  border_radius?: f32;
  border_width?: f32;
  border_color?: string;
  box_shadow?: BoxShadow[];
  padding?: f32;
  padding_vertical?: f32;
  padding_horizontal?: f32;
  padding_top?: f32;
  padding_right?: f32;
  padding_bottom?: f32;
  padding_left?: f32;
}
```

## Properties

### type
Component type discriminant. Must be `"view"`.
- **Type**: `string`

---

### id
ID of the component.
- **Type**: `string`

---

### children
List of the component's children.
- **Type**: `Component[]`

---

### width
Width of the component in pixels.
- **Type**: `f32`

> ⚠️ **Caution:** Behavior depends on the parent. With a non-layout parent, `width` is **required**. With a layout parent, refer to that component's docs.

---

### height
Height of the component in pixels.
- **Type**: `f32`

> ⚠️ **Caution:** Behavior depends on the parent. With a non-layout parent, `height` is **required**. With a layout parent, refer to that component's docs.

---

### direction
Defines how static children are positioned inside the View.
- **Type**: `"row" | "column"`
- **Default**: `"row"`
- **Values**:
  - `"row"` — children positioned left to right.
  - `"column"` — children positioned top to bottom.

---

### top
Distance in pixels from the top edge of the component to the top edge of its parent. Setting this positions the element absolutely, overriding parent layout constraints.
- **Type**: `f32`

---

### left
Distance in pixels from the left edge of the component to the left edge of its parent. Setting this positions the element absolutely.
- **Type**: `f32`

---

### bottom
Distance in pixels from the bottom edge of the component to the bottom edge of its parent. Setting this positions the element absolutely.
- **Type**: `f32`

---

### right
Distance in pixels from the right edge of the component to the right edge of its parent. Setting this positions the element absolutely.
- **Type**: `f32`

---

### rotation
Rotation of the component in degrees. Setting this positions the element absolutely.
- **Type**: `f32`

---

### transition
Defines how the component behaves during a scene update. Only takes effect if the previous scene contained a `View` with the same id.
- **Type**: `Transition`

---

### overflow
Controls the behaviour of content that exceeds the area size.
- **Type**: `"visible" | "hidden" | "fit"`
- **Default**: `"hidden"`
- **Values**:
  - `"visible"` — render everything, including content extending beyond the parent.
  - `"hidden"` — render only the parts of children inside the parent area.
  - `"fit"` — if children are too big to fit, resize everything inside to fit.

> **Note:** When using `fit`, components with unknown sizes are treated as size 0 when calculating the scaling factor.

> ⚠️ **Caution:** `fit` resizes everything inside the parent, including absolutely positioned elements.

---

### background_color
Background color in `#RRGGBBAA` format.
- **Type**: `string`
- **Default**: `#00000000`

---

### border_radius
Radius of a rounded corner.
- **Type**: `f32`
- **Default**: `0.0`

---

### border_width
Border width.
- **Type**: `f32`
- **Default**: `0.0`

---

### border_color
Border color in `#RRGGBBAA` format.
- **Type**: `string`
- **Default**: `"#00000000"`

---

### box_shadow
List of box shadows.
- **Type**: `BoxShadow[]`

---

### padding
Padding for each side of the component.
- **Type**: `f32`
- **Default**: `0.0`

---

### padding_vertical
Padding for the top and bottom sides.
- **Type**: `f32`
- **Default**: `0.0`

---

### padding_horizontal
Padding for the left and right sides.
- **Type**: `f32`
- **Default**: `0.0`

---

### padding_top
Padding for the top side.
- **Type**: `f32`
- **Default**: `0.0`

---

### padding_right
Padding for the right side.
- **Type**: `f32`
- **Default**: `0.0`

---

### padding_bottom
Padding for the bottom side.
- **Type**: `f32`
- **Default**: `0.0`

---

### padding_left
Padding for the left side.
- **Type**: `f32`
- **Default**: `0.0`

## Transition

```tsx
type Transition = {
  duration_ms: f64;
  easing_function?: EasingFunction;
  should_interrupt?: boolean;
}
```

### duration_ms
Duration of the transition in milliseconds.
- **Type**: `f64`

---

### easing_function
Easing function used to interpolate between two values over time during the transition.
- **Type**: `EasingFunction`
- **Default**: `"linear"`

---

### should_interrupt
If `true`, on a scene update a transition already in progress is interrupted and a new transition starts from the current state.
- **Type**: `boolean`
- **Default**: `false`

## BoxShadow

```tsx
type BoxShadow = {
  offset_x?: f32;
  offset_y?: f32;
  color?: string;
  blur_radius?: f32;
}
```

### offset_x
Horizontal offset on the x-axis. Positive moves right, negative moves left.
- **Type**: `f32`
- **Default**: `0.0`

---

### offset_y
Vertical offset on the y-axis. Positive moves downward, negative moves upward.
- **Type**: `f32`
- **Default**: `0.0`

---

### color
Color in `#RRGGBBAA` format.
- **Type**: `string`
- **Default**: `#FFFFFFFF`

---

### blur_radius
Radius of the blur effect.
- **Type**: `f32`
- **Default**: `0.0`

## EasingFunction

```tsx
type EasingFunction =
  | { function_name: "linear"; }
  | { function_name: "bounce"; }
  | {
      function_name: "cubic_bezier";
      points: [f64, f64, f64, f64];
    }
```

Easing functions interpolate between two values over time. Custom easing can be implemented with cubic Bézier: `points` provides four values `x1`, `y1`, `x2`, `y2`. `x1` and `x2` must be in the range `[0; 1]`, and the result is clamped to `[0; 1]`.

### function_name
Name of the easing function.
- **Type**: `"linear" | "bounce" | "cubic_bezier"`
- **Default**: `"linear"`
- **Values**: `"linear"`, `"bounce"`, `"cubic_bezier"`

---

### points
Four values in `[0; 1]` range used for cubic Bézier (required when `function_name` is `"cubic_bezier"`). The result is clamped to `[0; 1]`.
- **Type**: `[f64, f64, f64, f64]`
