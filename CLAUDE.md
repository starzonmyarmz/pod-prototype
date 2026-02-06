# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Interactive sci-fi reactor control and navigation simulator built with **Preact** and **Preact Signals**. A game-like experience where players manage a reactor through power switches, temperature management, and phase progression, then use a star navigation plotter.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Production build to /dist
npm run preview   # Preview production build locally
```

No test runner or linter is configured in package.json.

## Architecture

### Tech Stack
- **Preact** (not React) — lightweight React alternative with identical API
- **Preact Signals** — fine-grained reactive state management (no Redux/Zustand)
- **Vite 7** — build tool and dev server
- **Vanilla CSS** — component-scoped stylesheets, no CSS-in-JS

### JSX Configuration
JSX is configured for Preact via `jsxImportSource: "preact"` in jsconfig.json. Import hooks from `preact/hooks`, not from React.

### State Management Pattern
All application state lives in `src/state/` as module-level Preact Signals — **not** in component `useState`. Components import signals directly and read `.value` to subscribe. Use `.peek()` to read without creating a reactive dependency.

```
src/state/reactor.js    — reactor power, temperature, phases, explosion logic
src/state/navigation.js — orientation, filters, star field configuration
```

Signals are singletons created at module load time. Reactive side effects (`effect()`) manage timers for temperature ramping, phase progression, and explosion countdowns.

### Component Hierarchy
```
App (index.jsx)
├── Reactor — switches (9 binary: 1,2,4,...,256), temp gauge (SVG), override button
└── Navigation (shown when reactorPhase >= 0)
    ├── NavFilters — object type, magnitude, spectral, confidence, frame, orientation
    └── NavPlotter — SVG star field (~400 procedural stars), constellations, status readouts
```

### Custom UI Controls
- `knob.jsx` — draggable rotary control (vertical drag, double-click reset, SVG rendered)
- `switch.jsx` — toggle switch
- `choice.jsx` — radio button group
- `range.jsx` — range slider

### Game Mechanics
- 9 switches provide binary power values (total 0–511)
- Temperature ramps toward current power level with acceleration
- 3 phases unlock at stable thresholds: 31°, 124°, 452°
- "Danger" state (>1.2x threshold) triggers 10-second explosion timer
- Navigation star field filters dynamically; visual effects (blur, saturation) tied to reactor power

## Code Style

Prettier is configured: no semicolons, double quotes, trailing commas (ES5), 2-space indent.
