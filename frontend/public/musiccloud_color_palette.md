# MusicCloud Color Palette

| Name | Hex | RGB | Usage |
|------|-----|-----|-------|
| Indigo | `#6C5CFF` | 108, 92, 255 | Primary brand color, app icon background, "Cloud" in the wordmark |
| Lavender | `#8E82FF` | 142, 130, 255 | Cloud color on dark backgrounds, accents in dark mode |
| Soft tint | `#EFECFF` | 239, 236, 255 | Light icon background, subtle surfaces and highlights |
| Deep navy | `#17142B` | 23, 20, 43 | Dark icon background, dark mode surfaces, body text |
| White | `#FFFFFF` | 255, 255, 255 | Cloud on the primary icon, text on Indigo and Deep navy |

## Icon variants

| Variant | Background | Cloud | Bars |
|---------|------------|-------|------|
| Primary | `#6C5CFF` | `#FFFFFF` | `#6C5CFF` |
| Light | `#EFECFF` | `#6C5CFF` | `#EFECFF` |
| Dark | `#17142B` | `#8E82FF` | `#17142B` |

## CSS variables

```css
:root {
  --mc-indigo: #6C5CFF;
  --mc-lavender: #8E82FF;
  --mc-tint: #EFECFF;
  --mc-navy: #17142B;
  --mc-white: #FFFFFF;
}
```
