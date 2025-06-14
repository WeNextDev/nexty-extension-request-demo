# Nexty.dev Browser Extension Request Demo

This project is a demonstration of the browser extension support functionality for the [Nexty.dev](https://nexty.dev/) full-stack SaaS template.

Corresponding Nexty.dev source code branch for testing: [extension-request-demo](https://github.com/WeNextDev/nexty.dev/tree/extension-request-demo)

## Problems Solved

- Browser extension requests for public data
- Browser extension login and user state synchronization
- Browser extension requests for private data requiring authentication

## 🚀 Getting Started

### 1. Prerequisites

1. You already have a SaaS project launched with [Nexty.dev](https://nexty.dev/).
2. [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) are installed on your system.

### 2. Clone and Install

```bash
git clone https://github.com/WeNextDev/nexty-extension-request-demo.git
cd nexty-extension-request-demo

git checkout extension-request-demo

pnpm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root directory and configure the variables according to your Nexty.dev project.

### 4. Start Development Server

```bash
pnpm dev
```

### 5. Load Extension in Browser

Open your browser (such as Chrome), go to the extensions management page, enable "Developer mode", then click "Load unpacked extension" and select the `build/chrome-mv3-dev` directory in the project.

## 🔧 Development

- **Extension Popup Page**: `popup.tsx`
- **Background Service Script**: `background/index.ts`
- **Encryption Utilities**: `background/crypto-utils.ts`

All changes will automatically reload. You can test and learn the browser extension login and request flow based on the browser extension code and the extension-request-demo branch of the Nexty.dev source code.

---

Thank you for using [Nexty.dev](https://nexty.dev/)!