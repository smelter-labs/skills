# DeckLink

An input type that allows consuming streams from Blackmagic DeckLink cards. Requires the `decklink` build feature.

## Usage

```http
POST: /api/input/:input_id/register
Content-Type: application/json

{
  "type": "decklink",
  "display_name": "DeckLink Quad HDMI Recorder (3)"
}
```

See `routes.md` for more about managing inputs.

The input device is selected based on the fields `subdevice_index`, `persistent_id` **AND** `display_name`. All of them must match the device if specified. If nothing is matched, the error response will list available devices.

## Type

```tsx
type DeckLinkInput = {
  type: "decklink";
  subdevice_index?: u32;
  display_name?: string;
  persistent_id?: string;
  enable_audio?: bool;
  required?: bool;
  side_channel?: SideChannel;
}
```

## Properties

### subdevice_index
A single DeckLink device can consist of multiple sub-devices. This field defines the index of the sub-device that should be used.
- **Type**: `u32`

---

### display_name
Select the sub-device to use based on the display name. This is the value you see in e.g. the Blackmagic Media Express app, like "DeckLink Quad HDMI Recorder (3)".
- **Type**: `string`

---

### persistent_id
Persistent ID of a device represented by a 32-bit hex number. Each DeckLink sub-device has a separate id.
- **Type**: `string`

---

### enable_audio
Enable audio support.
- **Type**: `bool`
- **Default**: `true`

---

### required
If the input is required and frames are not processed on time, then Smelter will delay producing output frames.
- **Type**: `bool`
- **Default**: `false`

---

### side_channel
Enable side channel publishing for this input. The external consumer reads decoded frames / audio from a Unix socket created under `SMELTER_SIDE_CHANNEL_SOCKET_DIR`. See `side-channel.md`.
- **Type**: `SideChannel`

## SideChannel
Per-track side channel configuration. See `side-channel.md` for details on how decoded data is exposed and consumed.

```tsx
type SideChannel = {
  video?: bool;
  audio?: bool;
  delay_ms?: f64;
};
```

### video
Publish decoded RGBA video frames for this input on the side channel.
- **Type**: `bool`
- **Default**: `false`

### audio
Publish decoded PCM audio batches for this input on the side channel.
- **Type**: `bool`
- **Default**: `false`

### delay_ms
Side channel delay in milliseconds. Frames are buffered for this duration ahead of when the queue consumes them, so the side-channel subscriber receives them early and has roughly this much time to process before the frame is due.
- **Type**: `f64`
- **Default**: `0`
