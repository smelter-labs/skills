# User Notes

## Uncertainties

1. **RTMP vs RTP**: My built-in knowledge of Smelter indicates it primarily uses RTP streams, not RTMP directly. The code uses `rtp_stream` with `tcp_server` transport. If Smelter has since added direct RTMP input/output support, the code would need updating.

2. **API field accuracy**: The exact field names and type strings in `registerInput` and `registerOutput` (e.g., `"ffmpeg_h264"`, `"opus"`, `transportProtocol`, `decoder`/`encoder` config shapes) are written from memory and may not match the current SDK API precisely.

3. **YouTube RTMP output**: Smelter likely does not natively output to an RTMP URL. The code outputs to an RTP port and suggests using FFmpeg as a bridge to YouTube's RTMP ingest. A production solution would need this FFmpeg step automated (e.g., spawned as a child process).

4. **OBS configuration**: OBS natively outputs RTMP. To work with Smelter's RTP inputs, OBS would need to be configured to output RTP instead, or an FFmpeg relay would be needed to convert RTMP to RTP.

5. **Audio mixing**: The audio mixing API (`initial.inputs` array with `inputId` and `volume`) is recalled from memory and may not be the exact current API shape.
