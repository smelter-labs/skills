# User Notes

- The `YOUTUBE_RTMP_URL` constant must be replaced with your actual YouTube Live stream key before running.
- The two RTMP server inputs listen on ports 1935 and 1936. In OBS, configure each instance to push to `rtmp://127.0.0.1:1935` and `rtmp://127.0.0.1:1936` respectively.
- The `rtmp_server` input type is documented as experimental. The docs note no stream key validation and no RTMPS support. For production use, consider placing an nginx proxy with `nginx-rtmp-module` in front.
- The `Tiles` component automatically calculates layout. With 2 children and a default 16:9 aspect ratio, the two streams will be placed side by side horizontally.
- The code uses `useInputStreams` to show placeholder text while waiting for OBS to connect. This is optional but improves the user experience.
- Required packages: `@swmansion/smelter-node` and `@swmansion/smelter`. Install via `npm install @swmansion/smelter-node @swmansion/smelter`.
