# qr-gen

[![NPM Version](https://img.shields.io/npm/v/qr-gen.svg)](https://www.npmjs.com/package/qr-gen)
[![License](https://img.shields.io/npm/l/qr-gen.svg)](https://github.com/BrunoNyland/qr-gen/blob/main/LICENSE)

A powerful, zero-dependency, and highly customizable QR Code generator for modern browsers and Node.js. A modern, optimized reimplementation of the `kjua` library, offering rich aesthetic features like linear/radial gradients, custom finder shapes, custom finder eye styles (cHearts, Stars, Triangles, etc.), text/image overlays, and full server-side rendering (SSR) compatibility.

---

## Features

- 🚀 **Zero Runtime Dependencies**: Bundled with `qrcode-generator` for a lightweight, self-contained implementation.
- 🎨 **Rich Aesthetics**:
  - Linear and radial gradients with customizable angles and multi-color stops.
  - Fully independent styling for **Finder Patterns** (Frames) and **Finder Eyes** (Centers).
- 🧩 **Custom Finder Shapes**:
  - **Frames**: `square`, `circle`, `rounded`.
  - **Eyes (Center)**: `square`, `circle`, `rounded`, `triangle`, `diamond`, `star`, `heart`.
- 🖼️ **Flexible Overlay Modes**:
  - Text labels with adjustable fonts, size, position, and stroke styling.
  - Image/Logo overlays with adjustable dimensions and position.
- ⚡ **Synchronous Output API**:
  - `qrGen(options)`: Returns a canvas, SVG, or image DOM element.
  - `qrGen.toSVGString(options)`: Synchronously generates raw SVG text.
  - `qrGen.toDataURL(options)`: Synchronously generates a Base64 data URI of the canvas.
- 💻 **Node.js (SSR / Backend) Support**: Inject a custom canvas factory (e.g. `canvas` or `jsdom`) to run in non-browser environments.
- 📏 **Crisp Rendering**: Adapts to high-DPI screens seamlessly.

---

## Installation

```bash
npm install qr-gen
```

---

## Quick Start

### Browser / Script tag

Include the script from `dist` or a CDN, then use `window.qrGen`:

```html
<script src="dist/qr-gen.min.js"></script>
<script>
    const qrEl = qrGen({
        text: "https://github.com/BrunoNyland/qr-gen",
        size: 300,
        rounded: 100 // Rounded data modules
    });
    document.body.appendChild(qrEl);
</script>
```

### ESM / Bundlers

```javascript
import qrGen from 'qr-gen';

const qr = qrGen({
    text: "https://github.com/BrunoNyland/qr-gen",
    render: "svg",
    size: 250
});
document.getElementById("qrcode-container").appendChild(qr);
```

---

## Styling Customizations

### 1. Gradients

You can specify a linear or radial gradient for the fill style:

```javascript
const qr = qrGen({
    text: "https://github.com/BrunoNyland/qr-gen",
    size: 400,
    fill: {
        type: "linear", // or "radial"
        colors: ["#3b82f6", "#8b5cf6"], // multi-color support
        angle: 45 // linear gradient angle in degrees
    }
});
```

### 2. Custom Finders

Style the three corner outer frames and inner eyes independently:

```javascript
const qr = qrGen({
    text: "https://github.com/BrunoNyland/qr-gen",
    size: 400,
    // Outer Frame Shape
    finderShape: "circle", // "square" | "circle" | "rounded"
    // Inner Eye Shape
    finderEyeShape: "heart", // "square" | "circle" | "rounded" | "triangle" | "diamond" | "star" | "heart"
    // Distinct color for finders (supports gradients too)
    finderColor: "#ef4444"
});
```

### 3. Overlay Logo / Text

#### Adding a Logo Image

```javascript
const img = new Image();
img.src = "logo.png";
img.onload = () => {
    const qr = qrGen({
        text: "https://github.com/BrunoNyland/qr-gen",
        mode: "image",
        image: img,
        mSize: 20, // 20% of QR code size
        mPosX: 50, // Center X
        mPosY: 50  // Center Y
    });
    document.body.appendChild(qr);
};
```

#### Adding Text Label

```javascript
const qr = qrGen({
    text: "https://github.com/BrunoNyland/qr-gen",
    mode: "label",
    label: "SCAN ME",
    fontname: "Space Grotesk",
    fontcolor: "#3b82f6",
    mSize: 15,
    mPosX: 50,
    mPosY: 50
});
```

---

## Node.js / Server-Side Rendering (SSR)

To use `qr-gen` in a Node.js backend environment (without a window/document DOM), inject a canvas factory (e.g. from the `canvas` package) and use the utility string output methods:

```javascript
import qrGen from 'qr-gen';
import { createCanvas } from 'canvas';

// 1. Get Base64 PNG Data URL
const dataUrl = qrGen.toDataURL({
    text: "https://github.com/BrunoNyland/qr-gen",
    canvasFactory: (w, h) => createCanvas(w, h)
});

// 2. Get Raw SVG String (does not require canvasFactory!)
const svgString = qrGen.toSVGString({
    text: "https://github.com/BrunoNyland/qr-gen"
});
```

---

## API Options

| Option | Type | Default | Description |
|---|---|---|---|
| `render` | `'canvas' \| 'image' \| 'svg'` | `'image'` | Output element type. |
| `text` | `string` | `'no text'` | The text to encode in the QR code. |
| `size` | `number` | `200` | Width/Height in pixels. |
| `crisp` | `boolean` | `true` | Enable pixel-perfect rendering for high-DPI. |
| `minVersion` | `number` | `1` | Minimum QR Code version (1-40). |
| `ecLevel` | `'L' \| 'M' \| 'Q' \| 'H'` | `'L'` | Error correction level. |
| `fill` | `string \| QrGenGradient` | `'#333'` | Fill style for data modules. |
| `back` | `string \| null` | `'#fff'` | Background color. `null` for transparent. |
| `rounded` | `number` | `0` | Corner roundness of data modules (0-100%). |
| `quiet` | `number` | `0` | Padding size in QR modules (0-4). |
| `mode` | `'plain' \| 'label' \| 'image'` | `'plain'` | Center overlay mode. |
| `mSize` | `number` | `30` | Overlay size percentage relative to `size` (1-40). |
| `mPosX` | `number` | `50` | Overlay horizontal position percentage (0-100). |
| `mPosY` | `number` | `50` | Overlay vertical position percentage (0-100). |
| `label` | `string` | `'no label'` | Label text. |
| `fontname` | `string` | `'sans'` | Font family name for the label. |
| `fontcolor` | `string` | `'#333'` | Font color for the label. |
| `labelStrokeColor` | `string` | `'#fff'` | Text stroke/contour color. |
| `labelStrokeWidth`| `number` | `0.1` | Text stroke width percentage relative to text size. |
| `image` | `string \| HTMLImageElement \| null` | `null` | Logo image source. |
| `finderShape` | `'square' \| 'circle' \| 'rounded' \| null` | `null` | Outer shape of Finder Pattern. Defaults to `rounded`. |
| `finderEyeShape` | `'square' \| 'circle' \| 'rounded' \| 'triangle' \| 'diamond' \| 'star' \| 'heart' \| null` | `null` | Inner shape of Finder Pattern. |
| `finderColor` | `string \| QrGenGradient \| null` | `null` | Specific fill style for Finder Patterns. |
| `canvasFactory` | `Function \| null` | `null` | Custom factory function for Node.js `(width, height) => Canvas`. |

---

## Local Development

### Installation

```bash
npm install
```

### Compile Bundles

```bash
npm run build
```

### Run Tests

```bash
npm run test
```

### Run Linter

```bash
npm run lint
```

---

## License

This project is licensed under the [MIT License](LICENSE).
