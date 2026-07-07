# Shader

A component that represents the output of a user-provided WGSL shader. All children components are available as textures inside the shader code.

> **Note:** To use this component, first register the shader with a matching `shader_id` using a register shader request (see `resources/shader.md` and `routes.md`).

A passthrough shader (fragment returning `textureSample(textures[0], sampler_, input.tex_coords)`) collapses its child subtree to a single rendered element — a workaround for the 100-element layout limit (see `overview.md`).

## Usage

Register a shader with id `example_shader` (`source` is the WGSL shader code):

```http
POST: /api/shader/example_shader/register
Content-Type: application/json

{
  "source": "<WGSL SHADER CODE>"
}
```

Update an output with a scene that uses shader `example_shader`:

```http
POST: /api/output/:output_id/update
Content-Type: application/json

{
  "video": {
    "root": {
      "type": "shader",
      "shader_id": "example_shader",
      "children": [
        {
          "type": "input_stream",
          "input_id": "example_input"
        }
      ],
      "resolution": { "width": 1920, "height": 1080 }
    }
  }
}
```

## Type

```tsx
type Shader = {
  type: "shader";
  id?: string;
  children?: Component[];
  shader_id: string;
  shader_param?: ShaderParam;
  resolution: {
    width: u32;
    height: u32;
  };
}
```

## Properties

### type
Component type discriminant. Must be `"shader"`.
- **Type**: `string`

---

### id
ID of the component.
- **Type**: `string`

---

### children
Child components, exposed as textures inside the shader.
- **Type**: `Component[]`

---

### shader_id
ID of a shader registered using a register shader request (see `resources/shader.md`).
- **Type**: `string`

---

### shader_param
Object serialized into a struct and passed to the shader as `@group(1) @binding(0) var<uniform>`. The object must match the structure defined in the shader source code.
- **Type**: `ShaderParam`

> **Note:** Memory layout is not handled automatically. To get the correct memory alignment you may need to add extra padding fields (see the WGSL alignment-and-size documentation).

---

### resolution
Resolution of the texture where the shader will be executed.
- **Type**: `{ width: u32; height: u32; }`

## ShaderParam

```tsx
type ShaderParam =
  | { type: "f32"; value: f32; }
  | { type: "u32"; value: u32; }
  | { type: "i32"; value: i32; }
  | { type: "list"; value: ShaderParam[]; }
  | {
      type: "struct";
      value: ShaderParamStructField[];
    }
```

## ShaderParamStructField

```tsx
type ShaderParamStructField =
  | { field_name: string; type: "f32"; value: f32; }
  | { field_name: string; type: "u32"; value: u32; }
  | { field_name: string; type: "i32"; value: i32; }
  | {
      field_name: string;
      type: "list";
      value: ShaderParam[];
    }
  | {
      field_name: string;
      type: "struct";
      value: ShaderParamStructField[];
    }
```
