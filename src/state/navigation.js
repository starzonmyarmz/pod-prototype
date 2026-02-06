import { signal, computed } from "@preact/signals"
import { reactorPower } from "./reactor.js"

// Configuration constants
export const STELLAR_COUNT = 250
export const ARTIFICIAL_COUNT = 30
export const UNKNOWN_COUNT = 120
export const TRANSFORM_SCALE = 0.5
export const STAR_COLOR = "#a7ffb0"
export const ROUTE_OPACITY = 0.5
export const DISTRACTOR_OPACITY = 0.2

// Reactor thresholds (30% and 70% of max power 511)
export const REACTOR_LOW_THRESHOLD = 153
export const REACTOR_HIGH_THRESHOLD = 357
export const REACTOR_MAX = 511

// Frame transformation constants
export const ECLIPTIC_SKEW_X = -23.5 * 0.3
export const ECLIPTIC_SKEW_Y = 15 * 0.2
export const SHIP_REL_WOBBLE_SPEED = 1000
export const SHIP_REL_WOBBLE_MAGNITUDE = 2

// Visual effect constants
export const BLUR_BASE = 1.5
export const BLUR_TEMP_FACTOR = 2
export const BLUR_BRIGHT_BASE = 3
export const BLUR_BRIGHT_FACTOR = 3
export const SATURATION_BASE = 1
export const SATURATION_POWER_FACTOR = 0.4

// Orientation controls
export const yaw = signal(0)
export const pitch = signal(0)
export const roll = signal(0)

// Object type filters
export const stellar = signal(true)
export const artificial = signal(false)
export const unknown = signal(true)

// Magnitude filter (1 = brightest, 100 = dimmest)
export const magnitude = signal(50)

// Spectral type filters
export const fgk = signal(true)
export const ob = signal(false)
export const manom = signal(false)

// Confidence filter
export const confidence = signal("probable")

// Frame select
export const frameSelect = signal("galactic")

// Computed navigation status
export const sensorStatus = computed(() => {
  const power = reactorPower.value
  if (power < REACTOR_LOW_THRESHOLD) return "FALLBACK"
  if (power > REACTOR_HIGH_THRESHOLD) return "SATURATED"
  return "NOMINAL"
})

export const driftStatus = computed(() => {
  const power = reactorPower.value
  if (power < REACTOR_LOW_THRESHOLD) return "HIGH"
  if (power > REACTOR_HIGH_THRESHOLD) return "MODERATE"
  return "LOW"
})

export const routeCoherence = computed(() => {
  const power = reactorPower.value

  // Route coherence degrades when power is too low or too high
  if (power < REACTOR_LOW_THRESHOLD) return "DEGRADED"
  if (power > REACTOR_HIGH_THRESHOLD) return "UNSTABLE"

  // Optimal coherence in the middle range
  if (power >= 200 && power <= 311) return "OPTIMAL"

  return "COHERENT"
})
