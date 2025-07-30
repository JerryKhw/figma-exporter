<div align="center">
  <a href="https://github.com/JerryKhw/figma-exporter">
    <img src="images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Figma Exporter</h3>

  <p align="center">
    Easily export assets as PNG/JPG/WebP/SVG/PDF for Web, Android, Flutter, iOS, React Native
    <br />
    <a href="https://www.figma.com/community/plugin/1183975085577339184"><strong>View in Figma »</strong></a>
    <br />
    <br />
    <a href="https://github.com/JerryKhw/figma-exporter/issues">Issues & Features</a>
    ·
    <a href="https://www.buymeacoffee.com/jerrykhw">☕ Support the Project</a>
  </p>
</div>

<br/>

[![Figma Exporter Screen Shot][screenshot]](https://www.figma.com/community/plugin/1183975085577339184)

## Features

- 🎨 **Multiple Export Formats**: Export as PNG, JPG, WebP, SVG, or PDF
- 📱 **Platform Optimized**: Tailored exports for Web, Android, Flutter, iOS, and React Native
- ⚡ **Batch Export**: Export multiple assets at once
- 🔧 **Customizable Settings**: Configure export parameters to fit your needs

## Installation

1. Open Figma
2. Go to **Plugins** > **Browse plugins in Community**
3. Search for "Figma Exporter"
4. Click **Install**

> ⚠️ **Note**: This plugin requires write access to your Figma file to function properly.

## How to Use

1. Select the frames or components you want to export
2. Right-click and choose **Plugins** > **Figma Exporter**
3. Choose your export format and platform settings
4. Click **Export** to download your assets

### Export Structure

When exporting for different platforms, assets are organized as follows:

```
├── Web
│   └── img.png
├── Android
│   ├── drawable-mdpi
│   │   └── img.png
│   ├── drawable-hdpi
│   │   └── img.png
│   ├── drawable-xhdpi
│   │   └── img.png
│   ├── drawable-xxhdpi
│   │   └── img.png
│   └── drawable-xxxhdpi
│       └── img.png
├── iOS
│   ├── img.png
│   ├── img@2x.png
│   └── img@3x.png
├── Flutter
│   ├── 1.5x
│   │   └── img.png
│   ├── 2x
│   │   └── img.png
│   ├── 3x
│   │   └── img.png
│   ├── 4x
│   │   └── img.png
│   └── img.png
└── React Native
    ├── img.png
    ├── img@2x.png
    └── img@3x.png
```

---

## For Developers

### Project Structure

```
src/
├── plugin/          # Figma plugin code (runs in Figma's sandbox)
│   ├── code.ts      # Main plugin logic
│   └── data.ts      # Data processing utilities
├── ui/              # Plugin UI (React/Preact components)
│   ├── App.tsx      # Main application component
│   ├── components/  # Reusable UI components
│   ├── page/        # Page components
│   └── lib/         # Utility libraries
└── common/          # Shared types and utilities
    ├── enum.ts      # Enums and constants
    ├── interface.ts # TypeScript interfaces
    └── base64.ts    # Base64 utilities
```

### Development Setup

1. **Prerequisites**
   ```bash
   node >= 18
   pnpm >= 8
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Development**
   ```bash
   # Start development server with hot reload
   pnpm dev
   
   # Watch TypeScript compilation
   pnpm tsc:watch
   
   # Watch build process
   pnpm build:watch
   ```

4. **Testing in Figma**
   - Open Figma Desktop
   - Go to **Plugins** > **Development** > **Import plugin from manifest**
   - Select `manifest.json` from this project

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development with hot reload |
| `pnpm build` | Build for production |
| `pnpm test` | Run TypeScript check and build |
| `pnpm lint` | Run ESLint with auto-fix |
| `pnpm format` | Format code with Prettier |
| `pnpm tsc` | Type check both plugin and UI code |

### Tech Stack

- **Framework**: Preact (React compatible)
- **Build Tool**: Vite + ESBuild
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **UI Components**: Radix UI
- **Type Checking**: TypeScript
- **Linting**: ESLint
- **Formatting**: Prettier

### Architecture

The plugin follows Figma's architecture pattern:
- **Plugin Code** (`src/plugin/`): Runs in Figma's sandbox, handles Figma API calls
- **UI Code** (`src/ui/`): Runs in iframe, handles user interface
- **Communication**: PostMessage API between plugin and UI

### Key Libraries

- `@figma/plugin-typings`: Figma API types
- `fflate`: ZIP compression for batch exports
- `webp-converter-browser`: WebP format conversion
- `browser-image-compression`: Image optimization
- `superstruct`: Runtime type validation

### Building for Production

```bash
pnpm build
```

This creates optimized bundles in the `dist/` directory ready for Figma plugin submission.

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pnpm test`
5. Commit changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a pull request

[screenshot]: images/screenshot.png
