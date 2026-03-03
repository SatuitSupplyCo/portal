# DesignDocument v1

This document defines the persisted Studio design snapshot contract used by:

- `saveStudioDesignVersion` in `apps/portal/app/internal/studio/actions.ts`
- `DesignEditorClient` serialization/restoration in `apps/portal/app/internal/studio/design/DesignEditorClient.tsx`

## Schema

```json
{
  "schemaVersion": "1.0",
  "side": "front",
  "frontLayers": [
    {
      "id": "uuid",
      "type": "text",
      "groupId": "optional-group-id",
      "x": 50,
      "y": 50,
      "scale": 1,
      "rotation": 0,
      "opacity": 100,
      "color": "#000000",
      "text": "Text",
      "strokeEnabled": false,
      "strokeColor": "#000000",
      "strokeWidth": 1,
      "effects": {
        "shadow": {
          "enabled": false,
          "x": 0,
          "y": 2,
          "blur": 4,
          "color": "#000000",
          "opacity": 20
        }
      }
    }
  ],
  "backLayers": [],
  "guideSettings": {
    "showGuides": true,
    "constrainToPrintSafe": false,
    "snapToGuides": false
  },
  "savedAt": "2026-03-01T00:00:00.000Z"
}
```

## Migration policy

- Any snapshot missing `schemaVersion` is treated as legacy and normalized to `schemaVersion: "1.0"`.
- Invalid/missing layer fields are normalized to safe defaults.
- Unknown fields are ignored in the normalization path for persisted version snapshots.
