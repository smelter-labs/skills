# User Notes

## Uncertainties

- **RTMP server input is experimental**: The docs note that `rtmp_server` input type is experimental with no stream key validation and no RTMPS support. For production, consider using an nginx proxy with `nginx-rtmp-module`, or switch to a different input type like `whip_server` or `rtp_stream`.

- **Text width values**: The `width: 652` on the Text components is calculated as the View width (700) minus horizontal padding (24 * 2 = 48). This ensures text wraps correctly within the padded container. If the lower-third dimensions change, these values should be adjusted accordingly.

- **Font availability**: The code uses the default font "Verdana". If a custom font is desired, it must be registered via `smelter.registerFont(source)` before rendering.

- **Rescaler sizing**: The `Rescaler` wrapping `InputStream` uses `rescaleMode: "fit"` by default, which may leave letterbox bars if the input aspect ratio differs from 1920x1080. Use `rescaleMode: "fill"` in the Rescaler style if full coverage without bars is preferred (at the cost of cropping).
