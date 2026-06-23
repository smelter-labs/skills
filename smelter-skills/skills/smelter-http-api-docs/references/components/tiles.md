# Tiles

A layout component that arranges all child components side by side, dividing its area into equal-sized, non-overlapping rectangles (tiles), one per child.

## Usage

```http
POST: /api/output/:output_id/update
Content-Type: application/json

{
  "video": {
    "root": {
      "type": "tiles",
      "id": "example_tiles",
      "transition": { "duration_ms": 200 },
      "children": [
        { "type": "input_stream", "input_id": "input_1" },
        { "type": "input_stream", "input_id": "input_2" },
        { "type": "input_stream", "input_id": "input_3" },
        { "type": "input_stream", "input_id": "input_4" },
        { "type": "input_stream", "input_id": "input_5" }
      ]
    }
  }
}
```

## Positioning

- **Absolute**: Tiles **do not** support absolute positioning of children — children are still rendered, but `top`/`left`/`right`/`bottom`/`rotation` are ignored. Tiles **cannot** be absolutely positioned relative to its parent.
- **Static**: Tiles compute the number of rows and columns based on the component's size, the per-tile aspect ratio (`tile_aspect_ratio`), and the number of children, choosing the configuration that uses the largest possible area. Children are placed in order, left to right, row by row, top to bottom.
  - **Non-layout child**: scales proportionally to fit inside its tile; if aspect ratios don't match, it is centered vertically or horizontally.
  - **Layout child**: takes the width and height of the tile, ignoring its own `width`/`height` fields.

See `overview.md` for the shared layout sizing model.

### Transitions

Tiles does **not** support size transitions the way `View` or `Rescaler` do. To animate the Tiles size, wrap it inside a `View` and define a transition on the `View`.

Supported transitions:
- Adding a component — existing components move to their new location within `transition.duration_ms`; the new child appears (without animation) at the end of the transition.
- Removing a component — the removed tile disappears immediately, and remaining elements move to their new location within `transition.duration_ms`.
- Changing the order of children.

Child identity (required to animate add/remove/reorder) is resolved as:
- If a child has an `"id"`, that is its primary identifier.
- Otherwise it is identified by its order in `children` counting only components without an `"id"`.

## Type

```tsx
type Tiles = {
  type: "tiles";
  id?: string;
  children?: Component[];
  width?: f32;
  height?: f32;
  background_color?: string;
  tile_aspect_ratio?: string;
  margin?: f32;
  padding?: f32;
  horizontal_align?: "left" | "right" | "justified" | "center";
  vertical_align?: "top" | "center" | "bottom" | "justified";
  transition?: Transition;
}
```

## Properties

### type
Component type discriminant. Must be `"tiles"`.
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

### background_color
Background color in `#RRGGBBAA` format.
- **Type**: `string`
- **Default**: `#00000000`

---

### tile_aspect_ratio
Aspect ratio of each tile in `W:H` format, where `W` and `H` are integers.
- **Type**: `string`
- **Default**: `"16:9"`

---

### margin
Margin on each tile in pixels.
- **Type**: `f32`
- **Default**: `0`

---

### padding
Padding on each tile in pixels.
- **Type**: `f32`
- **Default**: `0`

---

### horizontal_align
Horizontal alignment of tiles.
- **Type**: `"left" | "right" | "justified" | "center"`
- **Default**: `"center"`

---

### vertical_align
Vertical alignment of tiles.
- **Type**: `"top" | "center" | "bottom" | "justified"`
- **Default**: `"center"`

---

### transition
Defines how the component behaves during a scene update. Only takes effect if the previous scene contained a `Tiles` with the same id.
- **Type**: `Transition`

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
