# InputStream

A component for displaying registered media inputs.

> **Note:** To use this component, first register the stream with a matching `input_id` using a register input request (see `routes.md` and the `inputs/` references).

## Usage

Register an input from an MP4 file with id `example_input`:

```http
POST: /api/input/example_input/register
Content-Type: application/json

{
  "type": "mp4",
  "path": "https://example.com/video.mp4"
}
```

Update an output with a scene that uses input `example_input`:

```http
POST: /api/output/:output_id/update
Content-Type: application/json

{
  "video": {
    "root": {
      "type": "rescaler",
      "child": {
        "type": "input_stream",
        "input_id": "example_input"
      }
    }
  }
}
```

## Type

```tsx
type InputStream = {
  type: "input_stream";
  id?: string;
  input_id: string;
}
```

## Properties

### type
Component type discriminant. Must be `"input_stream"`.
- **Type**: `string`

---

### id
ID of the component.
- **Type**: `string`

---

### input_id
ID of an input registered using a register input request.
- **Type**: `string`
