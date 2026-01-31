# RGP - Static Single Page Site

A modern, responsive static single page site built with Tailwind CSS.

## Features

- 🎨 Built with Tailwind CSS v4
- 📱 Fully responsive design
- ⚡ Lightning-fast static site
- 🎯 Single page application
- 🚀 Easy to customize and deploy

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd rgp
```

2. Install dependencies:
```bash
npm install
```

3. Build the CSS:
```bash
npm run build
```

4. Open `src/index.html` in your browser or serve it with:
```bash
npm run serve
```

## Development

- **Build CSS**: `npm run build` - Compiles Tailwind CSS
- **Watch mode**: `npm run dev` - Watches for changes and rebuilds CSS automatically
- **Serve site**: `npm run serve` - Starts a local development server on port 8080

## Project Structure

```
rgp/
├── src/
│   ├── index.html      # Main HTML file
│   ├── input.css       # Tailwind CSS source
│   └── output.css      # Compiled CSS (generated, not committed)
├── tailwind.config.js  # Tailwind configuration
├── postcss.config.js   # PostCSS configuration
└── package.json        # Dependencies and scripts
```

## Customization

### Tailwind Configuration

Edit `tailwind.config.js` to customize your Tailwind setup:
- Add custom colors
- Extend the theme
- Add plugins
- Configure content paths

### HTML Content

Edit `src/index.html` to modify the page content and structure.

### Styles

The site uses Tailwind's utility classes. You can add custom CSS in `src/input.css` if needed.

## Deployment

The site is static and can be deployed to any static hosting service:

1. Build the CSS: `npm run build`
2. Upload the `src/` folder (containing `index.html` and `output.css`) to your hosting service

### Deployment Options

- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Any static web host

## License

ISC
