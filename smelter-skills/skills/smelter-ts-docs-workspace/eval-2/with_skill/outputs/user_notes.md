# User Notes

## Uncertainties

1. **WebRTC signaling**: The skill documentation covers Smelter's rendering and composition capabilities but does not address WebRTC signaling. A real video conferencing app needs a signaling mechanism to exchange SDP offers/answers between participants. The answer notes this is the user's responsibility but does not prescribe a specific solution.

2. **Multi-party without any server**: The prompt says "no separate server," which maps to the WASM runtime. However, true multi-party video conferencing typically requires some form of signaling server or relay. The answer assumes the user will handle signaling separately (e.g., a lightweight WebSocket server or a third-party service) and that Smelter's role is purely the local rendering/composition layer.

3. **Audio mixing in WASM**: The `canvas` output supports `audio: true` to play audio in the browser tab. The documentation does not detail how multiple audio inputs are mixed in the WASM runtime. The answer assumes it works analogously to other runtimes.

4. **Performance with many participants**: The documentation does not specify performance limits for the WASM runtime (e.g., how many simultaneous camera inputs it can handle). For a large conference, performance may degrade.
