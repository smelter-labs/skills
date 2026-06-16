# Image (resource)

Represents an image asset registered with Smelter. Once registered, it is displayed via the `Image` component (see `../components/image.md`).

> **Note:** The `auto` `assetType` determines the image format automatically from the file's content.

## Type

```tsx
type RegisterImage = {
  assetType: "jpeg" | "png" | "gif" | "svg" | "auto";
  url?: string;
  serverPath?: string;
};
```

## Properties

### assetType
Image format.
- **Type**: `"jpeg" | "png" | "gif" | "svg" | "auto"`

---

### url
URL for downloading the image. Cannot be used together with `serverPath`.
- **Type**: `string`

---

### serverPath
Path to the image on the server where Smelter is deployed. Cannot be used together with `url`.
- **Type**: `string`
