import { signal } from "@preact/signals"

// Orientation controls
export const yaw = signal(0)
export const pitch = signal(0)
export const roll = signal(0)

// Object type filters
export const stellar = signal(true)
export const artificial = signal(false)
export const unknown = signal(true)

// Spectral type filters
export const fgk = signal(true)
export const ob = signal(false)
export const manom = signal(false)
