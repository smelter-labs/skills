# WHEP client input (Web API)

Connects to a WHEP server endpoint to receive a live media stream, running in the browser (WASM) runtime.

**Availability:** Browser (WASM)

> For the Node.js / Browser (Client) variant with decoder preferences and buffer/side-channel options, see `whep.md`.

## Usage

```tsx
import Smelter from "@swmansion/smelter-web-wasm";

const smelter = new Smelter();
await smelter.init();
await smelter.registerInput("example", {
  type: "whep_client",
  endpointUrl: "https://example.com/whep",
  bearerToken: "example_token",
});
```

## Type

```tsx
type RegisterWhepClientInput = {
  type: "whep_client";
  endpointUrl: string;
  bearerToken?: string;
};
```

## Properties

### endpointUrl
URL of the WHEP endpoint.
- **Type**: `string`

---

### bearerToken
Bearer token for the WHEP connection.
- **Type**: `string`
