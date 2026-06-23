# Rescaler

A layout component that resizes its single child to match its own size, always preserving the child's aspect ratio.

## Usage

```http
POST: /api/output/:output_id/update
Content-Type: application/json

{
  "video": {
    "root": {
      "type": "view",
      "background_color": "#52505b",
      "children": [
        {
          "type": "rescaler",
          "child": { "type": "image", "image_id": "example_image" }
        },
        {
          "type": "rescaler",
          "mode": "fill",
          "child": { "type": "image", "image_id": "example_image" }
        }
      ]
    }
  }
}
```

## Positioning

- **Absolute**: `Rescaler` **does not** support absolute positioning of its child — the child is still rendered, but `top`/`left`/`right`/`bottom`/`rotation` are ignored. A `Rescaler` itself can be absolutely positioned relative to its parent if the parent supports it.
- **Static**: `Rescaler` always has exactly one child, which is proportionally rescaled to match the parent.

See `overview.md` for the shared layout sizing model.

### Transitions

On a scene update, a `Rescaler` animates between the old and new state if `transition` is defined and both scenes contain a component with the same `id`. Only some fields animate:
- `width` / `height` — only within the same positioning mode; if the mode changes between scenes, the transition does not work.
- `bottom` / `top` / `left` / `right` / `rotation` — only when changing the value of the same field; if the old scene defines a field and the new one omits it, the transition does not work.

## Type

```tsx
type Rescaler = {
  type: "rescaler";
  id?: string;
  child: Component;
  mode?: "fit" | "fill";
  horizontal_align?: "left" | "right" | "justified" | "center";
  vertical_align?: "top" | "center" | "bottom" | "justified";
  width?: f32;
  height?: f32;
  top?: f32;
  left?: f32;
  bottom?: f32;
  right?: f32;
  rotation?: f32;
  transition?: Transition;
  border_radius?: f32;
  border_width?: f32;
  border_color?: string;
  box_shadow?: BoxShadow[];
}
```

## Properties

### type
Component type discriminant. Must be `"rescaler"`.
- **Type**: `string`

---

### id
ID of the component.
- **Type**: `string`

---

### child
Exactly one child component.
- **Type**: `Component`

---

### mode
Content resize mode.
- **Type**: `"fit" | "fill"`
- **Default**: `"fit"`
- **Values**:
  - `"fit"` — resize to match one dimension of the parent while remaining fully visible.
  - `"fill"` — resize to cover the entire parent area by matching at least one dimension; excess is clipped.

---

### horizontal_align
Horizontal alignment.
- **Type**: `"left" | "right" | "justified" | "center"`
- **Default**: `"center"`

---

### vertical_align
Vertical alignment.
- **Type**: `"top" | "center" | "bottom" | "justified"`
- **Default**: `"center"`

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

### top
Distance in pixels from the top edge of the component to the top edge of its parent. Setting this positions the element absolutely.
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
Defines how the component behaves during a scene update. Only takes effect if the previous scene contained a `Rescaler` with the same id.
- **Type**: `Transition`

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
