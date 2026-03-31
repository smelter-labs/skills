# User Notes: Uncertainties and Caveats

## High Confidence

- Smelter uses a React-like JSX component model with `View`, `Text`, `InputStream`, `Rescaler`.
- The main package is `@swmansion/smelter-node` for Node.js, with shared components from `@swmansion/smelter`.
- Initialization uses `new Smelter()` and `await smelter.init()`.
- Inputs and outputs are registered via `registerInput` and `registerOutput`.

## Medium Confidence

- **Style property names**: I used camelCase CSS-like properties (`backgroundColor`, `paddingLeft`, `fontSize`, `fontWeight`). Smelter's actual style API may differ -- it could use snake_case or a different set of property names.
- **Absolute positioning model**: I assumed `position: "absolute"` with `bottom: 0` works like CSS. Smelter may use a different layout model or require explicit `top`/`left` coordinates instead.
- **Color format with alpha**: I used `#000000AA` for semi-transparent black. Smelter might use a different format for alpha (e.g., a separate `opacity` property, or `rgba()` notation, or `#RRGGBBAA` may not be supported).
- **`root` property placement**: I placed the `root` JSX element inside the `video` config object of `registerOutput`. The exact nesting may differ.

## Low Confidence

- **Rescaler component**: I'm not fully certain about the exact import name or usage of the rescaler. It might be called differently or have different props.
- **RTP stream configuration details**: The exact shape of the RTP input/output config objects (property names like `transportProtocol`, `decoder`, `sendEosWhen`) may differ from what I wrote.
- **Duplicate registerOutput call**: I registered the output twice in my code -- once without a root and once with. In practice, you would likely only register once with the root scene included, or use a separate `updateOutput` method.
- **Audio configuration**: The audio encoder/decoder configuration shape may not match the actual API.

## Recommendation

Before using this code in production, consult the official Smelter documentation or SDK type definitions to verify the exact API surface, especially the style properties, color format, and output registration shape.
