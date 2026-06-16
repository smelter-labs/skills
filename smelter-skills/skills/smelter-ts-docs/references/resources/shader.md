# Shader (resource)

Represents a compiled shader registered with Smelter. Once registered, it is used by the `Shader` component (see `../components/shader.md`).

> ⚠️ **Caution:** The shader header differs on `@swmansion/smelter-web-wasm` compared to other runtimes.

## Type

```tsx
type Shader = {
  source: string;
};
```

## Properties

### source
Shader source code (WGSL).
- **Type**: `string`
