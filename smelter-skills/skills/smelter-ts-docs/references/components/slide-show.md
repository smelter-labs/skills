# SlideShow

Chains a series of scenes one after another. Accepts only `Slide` components as children. After mounting it shows slides sequentially. Each slide's duration is decided as:
1. If `durationMs` is set, it takes precedence.
2. Otherwise, if any descendant (not necessarily a direct child) is an [InputStream](./input-stream.md), [Mp4](./mp4.md), or another `SlideShow`, the slide stays until those finish running.
3. Otherwise, the slide switches to the next after 1 second.

**Availability:** Node.js · Browser (Client) · Browser (WASM)

## Usage

```tsx
import { Mp4, Rescaler, Slide, SlideShow, Text, View } from "@swmansion/smelter";

function ExampleApp() {
  return (
    <View style={{ backgroundColor: "#52505b" }}>
      <Rescaler>
        <SlideShow>
          <Slide durationMs={5000}>
            <Text>Text visible for 5 seconds</Text>
          </Slide>
          <Slide>
            <Mp4 source="https://example.com/video.mp4" />
          </Slide>
          <Slide durationMs={5000}>
            <Text>Text visible after the mp4 finished playing.</Text>
          </Slide>
        </SlideShow>
      </Rescaler>
    </View>
  );
}
```

## SlideShow

```tsx
type SlideShowProps = {
  children?: ReactNode;
};
```

### children
List of `<Slide />` components.
- **Type**: `ReactNode`

## Slide

```tsx
type SlideProps = {
  children: ReactNode;
  durationMs?: number;
};
```

### children
Content of a single slide.
- **Type**: `ReactNode`

---

### durationMs
How long the slide is shown, in milliseconds. If omitted, duration follows the rules above.
- **Type**: `number`
