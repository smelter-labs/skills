# User Notes

## Uncertainties

1. **Title text content**: The prompt says "title text" but does not specify the actual title string. Used "My Video Title" as a placeholder -- the user should replace this with their desired title.

2. **Input file path**: Used `"./input.mp4"` as the source path for the Mp4 component. The user should adjust this to point to their actual MP4 file.

3. **Output file path**: Used `"./output.mp4"` as the output path. The user should adjust as needed.

4. **Resolution**: Assumed 1920x1080 (Full HD) for the output. If the input video has a different resolution, the user may want to match it.

5. **Text vertical centering**: The Text component with `height: 1080` and `align: "center"` centers text horizontally. Smelter's Text does not have a vertical alignment property, so text will render from the top. For true vertical centering, additional layout techniques (e.g., absolute positioning with `top` offset) may be needed.
