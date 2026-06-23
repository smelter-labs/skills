# Text

A component for rendering text.

## Usage

```http
POST: /api/output/:output_id/update
Content-Type: application/json

{
  "video": {
    "root": {
      "type": "view",
      "background_color": "#52505b",
      "padding": 100,
      "direction": "column",
      "children": [
        {
          "type": "text",
          "font_size": 72,
          "color": "#a5baf0",
          "weight": "bold",
          "text": "Example text"
        },
        { "type": "view", "height": 30 },
        {
          "type": "text",
          "font_size": 30,
          "line_height": 44,
          "color": "#a5baf0",
          "wrap": "word",
          "width": 1000,
          "text": "Lorem ipsum dolor sit amet, consectetur adipiscing (...)"
        }
      ]
    }
  }
}
```

## Type

```tsx
type Text = {
  type: "text";
  id?: string;
  text: string;
  width?: f32;
  height?: f32;
  max_width?: f32;
  max_height?: f32;
  font_size: f32;
  line_height?: f32;
  color?: string;
  background_color?: string;
  font_family?: string;
  style?: "normal" | "italic" | "oblique";
  align?: "left" | "right" | "justified" | "center";
  wrap?: "none" | "glyph" | "word";
  weight?:
    | "thin"
    | "extra_light"
    | "light"
    | "normal"
    | "medium"
    | "semi_bold"
    | "bold"
    | "extra_bold"
    | "black";
}
```

## Properties

### type
Component type discriminant. Must be `"text"`.
- **Type**: `string`

---

### id
ID of the component.
- **Type**: `string`

---

### text
Text that will be rendered.
- **Type**: `string`

---

### width
Width of the texture the text is rendered on. If not provided, the texture is sized to fit the text but limited to `max_width`.
- **Type**: `f32`

---

### height
Height of the texture the text is rendered on. If not provided, the texture is sized to fit the text but limited to `max_height`. It is an error to provide `height` if `width` is not defined.
- **Type**: `f32`

---

### max_width
Maximum `width`. Limits the width of the texture the text is rendered on. Ignored if `width` is defined.
- **Type**: `f32`
- **Default**: `7682`

---

### max_height
Maximum `height`. Limits the height of the texture the text is rendered on. Ignored if `height` is defined.
- **Type**: `f32`
- **Default**: `4320`

---

### font_size
Font size in pixels.
- **Type**: `f32`

---

### line_height
Distance between lines in pixels.
- **Type**: `f32`
- **Default**: the value of `font_size`

---

### color
Font color in `#RRGGBBAA` format.
- **Type**: `string`
- **Default**: `"#FFFFFFFF"`

---

### background_color
Background color in `#RRGGBBAA` format.
- **Type**: `string`
- **Default**: `"#00000000"`

---

### font_family
Font family. Provide a specific font's family-name; generic-family values like `"sans-serif"` will not work.
- **Type**: `string`
- **Default**: `"Verdana"`

---

### style
Font style. The selected font must support the specified style.
- **Type**: `"normal" | "italic" | "oblique"`
- **Default**: `"normal"`

---

### align
Text alignment.
- **Type**: `"left" | "right" | "justified" | "center"`
- **Default**: `"left"`

---

### wrap
Text wrapping option.
- **Type**: `"none" | "glyph" | "word"`
- **Default**: `"none"`
- **Values**:
  - `"none"` — disable wrapping; text that does not fit is cut off.
  - `"glyph"` — wrap at the glyph level.
  - `"word"` — wrap at the word level, preventing words from being split.

---

### weight
Font weight (based on the OpenType `usWeightClass` specification). The selected font must support the specified weight.
- **Type**: `"thin" | "extra_light" | "light" | "normal" | "medium" | "semi_bold" | "bold" | "extra_bold" | "black"`
- **Default**: `"normal"`
- **Values**:
  - `"thin"` — Weight 100.
  - `"extra_light"` — Weight 200.
  - `"light"` — Weight 300.
  - `"normal"` — Weight 400.
  - `"medium"` — Weight 500.
  - `"semi_bold"` — Weight 600.
  - `"bold"` — Weight 700.
  - `"extra_bold"` — Weight 800.
  - `"black"` — Weight 900.
