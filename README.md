# Factory React Demo

**⚠️  This repository exists **only** to power the Tutorial Droid walkthrough.**  
It is **not** intended for production work or general app scaffolding. For real-world coding help, use **Code Droid** instead.

---

## What the Demo Shows

1. Greets you from Tutorial Droid.  
2. Verifies Bridge & Node.js are installed.  
3. Clones this repo, installs deps, starts a Vite dev server.  
4. Opens a secure Electron window branded as **Factory**.  
5. Droid live-edits the headline, injects system info, runs tests, then displays a diff.  
6. Presents a **“Graduate → Code Droid”** button so you can try Factory on your own codebase.

Total footprint: **≤ 100 KB, ≤ 30 files**.

---

## Requirements

| Tool | Version |
|------|---------|
| Node.js | LTS 18 + (checked automatically) |
| npm    | ≥ 9 (bundled with Node) |
| Git    | Any modern release |
| Operating systems | macOS 12+, Windows 10+, Ubuntu 22.04+ |

No Rust, Tauri, or heavyweight toolchains are required.

---

## Quick Setup

```bash
# 1. Clone fresh
git clone --depth 1 https://github.com/Factory-AI/factory-react-demo.git
cd factory-react-demo

# 2. Install dependencies (≈3 s on broadband)
npm install --silent

# 3. Launch dev demo (Vite + Electron)
npm run start
```

> The `start` script concurrently spins up Vite on port **5173**, waits for it to be ready, then opens the Electron wrapper.

---

## Script Reference

| Script | Purpose |
|--------|---------|
| `npm run dev` | Vite dev server only (browser) |
| `npm run electron` | Electron only (expects Vite already running) |
| `npm run start` | Dev server **+** Electron (default) |
| `npm run test` | Unit tests via Vitest & RTL |
| `npm run lint` | ESLint on `src/**/*.ts(x)` |

---

## Key Dependencies

- **React 18** + **Vite 5** – fast HMR & modern build chain  
- **Electron 28** – minimal, sandboxed desktop shell (`contextIsolation: true`, `nodeIntegration: false`)  
- **Vitest** + **@testing-library/react** – lightweight test runner  
- **concurrently** + **wait-on** – orchestrate Vite ↔ Electron startup

---

## Folder Structure (trimmed)

```
electron/           # Main & preload scripts
assets/             # Factory logo, icons
src/
  components/       # SystemInfo, GraduateButton
  factory/          # redirect & guard helpers
  __tests__/        # Vitest specs
```

---

## Support

This repo is maintained by the **Tutorial XP** team.  
Issues & PRs outside the scope of the guided demo may be closed without review.
