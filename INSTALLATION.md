# Installation Guide

This guide will help you set up and run the **Goldilocks Worlds** exoplanet visualization project locally.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Running the Project](#running-the-project)
4. [Building for Production](#building-for-production)
5. [Running Tests](#running-tests)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software

- **Node.js** (v18.0.0 or higher recommended)
  - Download from [nodejs.org](https://nodejs.org/)
  - Verify installation: `node --version`
  
- **npm** (comes with Node.js) or **yarn**
  - Verify npm installation: `npm --version`

### Optional but Recommended

- **Git** (for cloning the repository)
  - Download from [git-scm.com](https://git-scm.com/)
  - Verify installation: `git --version`

- A modern web browser (Chrome, Firefox, Edge, or Safari)

---

## Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/jerem-marti/DDD-2025-Group10.git
cd DDD-2025-Group10
```

Or download the ZIP file from GitHub and extract it to your desired location.

### Step 2: Install Dependencies

From the project root directory, run:

```bash
npm install
```

This will install all required dependencies:
- **Vite** (v7.2.4) - Fast development server and build tool
- **D3.js** (v7.9.0) - Data visualization library
- **Vitest** (v4.0.13) - Unit testing framework
- **csv-parse** (v6.1.0) - CSV parsing utility
- **jsdom** (v27.2.0) - DOM implementation for Node.js (testing)

The installation should complete in 1-2 minutes depending on your internet connection.

---

## Running the Project

### Development Mode

To start the development server with hot-reload:

```bash
npm run dev
```

**Expected output:**
```
VITE v7.2.4  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

Open your browser and navigate to `http://localhost:5173/` to view the project.

### Features in Development Mode

- **Hot Module Replacement (HMR)**: Changes to files are reflected instantly without page refresh
- **Fast refresh**: Updates views in milliseconds
- **Source maps**: Debugging with original source code

---

## Building for Production

### Step 1: Create Production Build

```bash
npm run build
```

This command:
1. Bundles all JavaScript modules
2. Optimizes assets (minification, tree-shaking)
3. Processes CSS
4. Outputs to the `dist/` directory

**Build output location:** `dist/`

### Step 2: Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

This starts a local static server to preview the built files.

**Expected output:**
```
➜  Local:   http://localhost:4173/
```

### Deployment

The production build in the `dist/` directory can be deployed to any static hosting service:
- **GitHub Pages** (currently used: https://jerem-marti.github.io/DDD-2025-Group10/)
- **Netlify**
- **Vercel**
- **AWS S3**
- Any web server (Apache, Nginx)

---

## Running Tests

### Run All Tests

```bash
npm test
```

This runs the Vitest test suite covering:
- Data loading and preprocessing (`data-loader.test.js`)
- State management (`state.test.js`)
- UI controls (`controls.test.js`)
- Sidebar functionality (`sidebar.test.js`)
- Galaxy view (`galaxyView.test.js`)
- Scatter view (`scatterView.test.js`)

### Watch Mode (Continuous Testing)

```bash
npm test -- --watch
```

Tests will automatically re-run when files change.

### Coverage Report

```bash
npm test -- --coverage
```

Generates a test coverage report showing which parts of the code are tested.

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: `npm install` fails

**Solution:**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules/` and `package-lock.json`
- Run `npm install` again
- Ensure you have Node.js v18+ installed

#### Issue: Port 5173 is already in use

**Solution:**
- Stop the process using port 5173
- Or specify a different port: `npm run dev -- --port 3000`

#### Issue: Page shows blank or errors in browser console

**Solution:**
- Check browser console for specific errors (F12 or Cmd+Option+I)
- Ensure data files exist in `public/data/`:
  - `planets.json`
  - `systems.json`
- Clear browser cache and hard reload (Ctrl+Shift+R or Cmd+Shift+R)
- Verify all dependencies installed correctly

#### Issue: Tests fail to run

**Solution:**
- Ensure all dependencies installed: `npm install`
- Check Node.js version: `node --version` (should be v18+)
- Run tests with verbose output: `npm test -- --reporter=verbose`

#### Issue: Build fails with memory errors

**Solution:**
- Increase Node.js memory limit:
  ```bash
  NODE_OPTIONS="--max-old-space-size=4096" npm run build
  ```

#### Issue: Hot reload not working

**Solution:**
- Check file watcher limits (Linux/Mac):
  ```bash
  echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
  sudo sysctl -p
  ```
- Restart the dev server: Stop (Ctrl+C) and run `npm run dev` again

---

## Project Structure

```
DDD-2025-Group10/
├── public/
│   └── data/              # JSON datasets (planets.json, systems.json)
├── src/
│   ├── views/             # Visualization components
│   │   ├── galaxyView.js  # Canvas-based galaxy visualization
│   │   ├── scatterView.js # SVG scatter plots with D3 zoom
│   │   └── smallMultiplesView.js # Animated system cards
│   ├── ui/                # User interface components
│   │   ├── controls.js    # Scene controls
│   │   └── sidebar.js     # Information panel
│   ├── styles/            # CSS stylesheets
│   ├── tests/             # Unit tests
│   ├── data-loader.js     # Data loading utilities
│   ├── preprocess.js      # Data preprocessing
│   ├── scenes-config.js   # Scene configurations
│   ├── state.js           # Application state management
│   └── main.js            # Application entry point
├── docs/                  # Documentation
├── index.html             # Main HTML file
├── package.json           # Dependencies and scripts
├── vitest.config.js       # Test configuration
└── vite.config.js         # Vite configuration (if present)
```

---

## Additional Resources

- **Live Demo:** https://jerem-marti.github.io/DDD-2025-Group10/
- **GitHub Repository:** https://github.com/jerem-marti/DDD-2025-Group10
- **Documentation:**
  - [Protocol Diagram](docs/PROTOCOL_DIAGRAM.md)
  - [Encoding Implementation Guide](docs/ENCODING_IMPLEMENTATION_GUIDE.md)

---

## System Requirements

### Minimum Requirements
- **OS:** Windows 10+, macOS 10.15+, or Linux (Ubuntu 20.04+)
- **RAM:** 4 GB
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Recommended Requirements
- **RAM:** 8 GB or more
- **Browser:** Latest version of Chrome, Firefox, or Edge
- **Display:** 1920×1080 or higher resolution

---

## Support

If you encounter issues not covered in this guide:

1. Check the [GitHub Issues](https://github.com/jerem-marti/DDD-2025-Group10/issues) page
2. Create a new issue with:
   - Your operating system and version
   - Node.js version (`node --version`)
   - npm version (`npm --version`)
   - Complete error message
   - Steps to reproduce the problem

---

## Version Information

- **Project Version:** 0.0.0
- **Node.js:** v18.0.0+ required
- **Vite:** 7.2.4
- **D3.js:** 7.9.0
- **Last Updated:** November 24, 2025
