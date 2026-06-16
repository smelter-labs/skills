# Text

A component for rendering text.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

## Usage

```tsx
import { Text, View } from "@swmansion/smelter";

function ExampleApp() {
  return (
    <View style={{ backgroundColor: "#52505b", padding: 100, direction: "column" }}>
      <Text style={{ fontSize: 72, color: "#a5baf0", fontWeight: "bold" }}>
        Example text
      </Text>
      <View style={{ height: 30 }} />
      <Text style={{ fontSize: 30, lineHeight: 44, color: "#a5baf0", wrap: "word", width: 1000 }}>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
      </Text>
    </View>
  );
}
```

## Type

```tsx
type TextProps = {
  id?: string;
  children?: (string | number)[] | string | number;
  style?: TextStyleProps;
};
```

## Props

### children
Text content to display.
- **Type**: `string | number | (string | number)[]`

---

### id
Component ID.
- **Type**: `string`
- **Default**: value produced by the `useId` hook

---

### style
Text styling properties (see `TextStyleProps` below).
- **Type**: `TextStyleProps`

---

## TextStyleProps

`fontSize` is the only required field.

```tsx
type TextStyleProps = {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
  fontSize: number;
  lineHeight?: number;
  color?: string;
  backgroundColor?: string;
  fontFamily?: string;
  fontStyle?: "normal" | "italic" | "oblique";
  align?: "left" | "right" | "justified" | "center";
  wrap?: "none" | "glyph" | "word";
  fontWeight?:
    | "thin" | "extra_light" | "light" | "normal" | "medium"
    | "semi_bold" | "bold" | "extra_bold" | "black";
};
```

### width
Width of the text texture. If undefined, the texture sizes to the text up to `maxWidth`.
- **Type**: `number`

---

### height
Height of the text texture. If undefined, the texture sizes to the text up to `maxHeight`.
- **Type**: `number`

> ⚠️ **Caution:** Providing `height` without `width` is an error.

---

### maxWidth
Limits the texture width. Ignored if `width` is defined.
- **Type**: `number`
- **Default**: `7682`

---

### maxHeight
Limits the texture height. Ignored if `height` is defined.
- **Type**: `number`
- **Default**: `4320`

---

### fontSize
Font size in pixels.
- **Type**: `number`

---

### lineHeight
Distance between lines in pixels.
- **Type**: `number`
- **Default**: value of `fontSize`

---

### color
Font color in `#RRGGBBAA` or `#RRGGBB` format.
- **Type**: `string`
- **Default**: `#FFFFFFFF`

---

### backgroundColor
Background color in `#RRGGBBAA` or `#RRGGBB` format.
- **Type**: `string`
- **Default**: `#00000000`

---

### fontFamily
Font family name. Generic-family values like `"sans-serif"` are not supported.
- **Type**: `string`
- **Default**: `"Verdana"`

---

### fontStyle
Font style; the selected font must support it.
- **Type**: `"normal" | "italic" | "oblique"`
- **Default**: `"normal"`

---

### align
Text alignment.
- **Type**: `"left" | "right" | "justified" | "center"`
- **Default**: `"left"`

---

### wrap
How to handle text exceeding the available space.
- **Type**: `"none" | "glyph" | "word"`
- **Default**: `"none"`
- `"none"` — no wrapping; overflow is truncated.
- `"glyph"` — wrap at the glyph level.
- `"word"` — wrap at the word level (no word splits).

---

### fontWeight
Font weight (per the OpenType spec); the selected font must support it. Values map to numeric weights: `thin` 100, `extra_light` 200, `light` 300, `normal` 400, `medium` 500, `semi_bold` 600, `bold` 700, `extra_bold` 800, `black` 900.
- **Type**: `"thin" | "extra_light" | "light" | "normal" | "medium" | "semi_bold" | "bold" | "extra_bold" | "black"`
- **Default**: `"normal"`
