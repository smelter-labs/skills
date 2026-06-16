# Shader

Renders the output of a user-provided WGSL shader. All child components are available as textures inside the shader code. Register the shader first with `Smelter.registerShader` using a matching `shaderId`.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

## Usage

```tsx
import { Mp4, Shader } from "@swmansion/smelter";

const EXAMPLE_SHADER = `
enable wgpu_binding_array;

struct VertexInput {
    @location(0) position: vec3<f32>,
    @location(1) tex_coords: vec2<f32>,
}
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) tex_coords: vec2<f32>,
}
@vertex
fn vs_main(input: VertexInput) -> VertexOutput {
    var output: VertexOutput;
    output.position = vec4(input.position, 1.0);
    output.tex_coords = input.tex_coords;
    return output;
}

struct BaseShaderParameters {
    plane_id: i32,
    time: f32,
    output_resolution: vec2<u32>,
    texture_count: u32,
}

@group(0) @binding(0) var textures: binding_array<texture_2d<f32>, 16>;
@group(2) @binding(0) var sampler_: sampler;
var<immediate> base_params: BaseShaderParameters;

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  if (base_params.texture_count != 1u) {
      return vec4(0.0, 0.0, 0.0, 0.0);
  }
  return textureSample(textures[0], sampler_, input.tex_coords);
}
`;

function ExampleApp() {
  return (
    <Shader shaderId="example_shader" resolution={{ width: 1280, height: 720 }}>
      <Mp4 source="https://example.com/video.mp4" />
    </Shader>
  );
}

// register before use:
await smelter.registerShader("example_shader", { source: EXAMPLE_SHADER });
```

> ⚠️ **Caution:** With `@swmansion/smelter-web-wasm`, shaders accept only **one** texture — use `texture_2d<f32>` instead of `binding_array<texture_2d<f32>, 16>`. Example WASM binding:
> ```wgsl
> @group(0) @binding(0) var texture: texture_2d<f32>;
> @group(2) @binding(0) var sampler_: sampler;
> ```
> and `textureSample(texture, sampler_, ...)`.

## Type

```tsx
type ShaderProps = {
  id?: string;
  children?: ReactElement[];
  shaderId: string;
  shaderParam?: ShaderParam;
  resolution: {
    width: number;
    height: number;
  };
};
```

## Props

### shaderId
ID of a shader registered with `Smelter.registerShader`.
- **Type**: `string`

---

### children
Child components to transform; available as textures inside the shader.
- **Type**: `ReactElement[]`

---

### id
Component ID.
- **Type**: `string`
- **Default**: value produced by the `useId` hook

---

### shaderParam
Object serialized into a struct and passed to the shader as `@group(1) @binding(0) var<uniform>`. Its structure must match the struct defined in the shader source.
- **Type**: `ShaderParam` (see below)

> **Note:** Memory layout is not handled automatically. To get correct memory alignment you may need extra padding fields (see the WGSL alignment-and-size spec).

---

### resolution
Resolution of the texture where the shader is executed.
- **Type**: `{ width: number; height: number }`

## ShaderParam

```tsx
type ShaderParam =
  | { type: "f32"; value: f32; }
  | { type: "u32"; value: u32; }
  | { type: "i32"; value: i32; }
  | { type: "list"; value: ShaderParam[]; }
  | { type: "struct"; value: ShaderParamStructField[]; };
```

## ShaderParamStructField

```tsx
type ShaderParamStructField =
  | { fieldName: string; type: "f32"; value: f32; }
  | { fieldName: string; type: "u32"; value: u32; }
  | { fieldName: string; type: "i32"; value: i32; }
  | { fieldName: string; type: "list"; value: ShaderParam[]; }
  | { fieldName: string; type: "struct"; value: ShaderParamStructField[]; };
```
