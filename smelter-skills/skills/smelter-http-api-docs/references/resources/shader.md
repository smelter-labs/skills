# Shader

A compiled WGSL shader registered on the server. Once registered, it is referenced by `shader_id` from a [Shader component](../components/shader.md).

## Usage

```http
POST: /api/shader/:shader_id/register
Content-Type: application/json

{
  "source": "<WGSL shader source code>"
}
```

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
