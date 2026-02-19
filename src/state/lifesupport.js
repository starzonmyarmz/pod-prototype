import { signal, computed, effect } from "@preact/signals"
import {
  reactorTemp,
  reactorPhase,
  reactorPower,
  lastPhaseChangeTime,
} from "./reactor.js"
import { oxygenLevel } from "./shiphealth.js"

// Compartment isolation
export const cockpitSealed = signal(false)
export const crewQuartersSealed = signal(false)
export const serviceBaySealed = signal(false)

// Fracture state — randomized at init, player must discover via isolation
const SITES = ["cockpit", "crew-quarters", "service-bay"]
export const fractureSite = signal(SITES[Math.floor(Math.random() * 3)])
export const fracturePatched = signal(false)

// Scrubber knobs — deliberately misaligned at start (optimal: ~67, ~62)
export const intakeRatio = signal(10)
export const purgeInterval = signal(90)

// Max reactor temp for normalization
const MAX_TEMP = 511

// Reactor thermal band categorization
export const reactorBand = computed(() => {
  const pct = reactorTemp.value / MAX_TEMP
  if (pct < 0.4) return "underpowered"
  if (pct <= 0.7) return "nominal"
  if (pct <= 0.85) return "high"
  return "overpower"
})

// Fracture leak contribution to O₂ loss
export const fractureLeakRate = computed(() => {
  if (fracturePatched.value) return 0
  const site = fractureSite.value
  const sealedMap = {
    cockpit: cockpitSealed,
    "crew-quarters": crewQuartersSealed,
    "service-bay": serviceBaySealed,
  }
  if (sealedMap[site].value) return 0
  const band = reactorBand.value
  if (band === "high" || band === "overpower") return 1.2
  return 0.6
})

// Scrubber efficiency (40–95% raw, capped by reactor band)
export const scrubberEfficiency = computed(() => {
  const intake = intakeRatio.value
  const purge = purgeInterval.value

  const intakeDist = Math.abs(intake - 67) / 67
  const purgeDist = Math.abs(purge - 62) / 62
  const misalign = Math.min(1, (intakeDist + purgeDist) / 2)

  const raw = 40 + (1 - misalign) * 55

  const caps = { underpowered: 65, nominal: 95, high: 85, overpower: 70 }
  const cap = caps[reactorBand.value] ?? 95

  return Math.min(raw, cap)
})

// CO₂ saturation — inverse of scrubber efficiency
export const co2Saturation = computed(() => {
  return Math.max(0, 100 - scrubberEfficiency.value) * 0.6
})

// Cabin pressure in ATM (nominal 1.0)
export const cabinPressure = computed(() => {
  const band = reactorBand.value
  const leak = fractureLeakRate.value
  const baseDrop = leak * 0.015
  const bandDrop = band === "overpower" ? 0.04 : 0
  return Math.max(0, 1.0 - baseDrop - bandDrop)
})

// Net O₂ loss rate (positive = losing, negative = recovering)
export const oxygenLossRate = computed(() => {
  const band = reactorBand.value
  const recovery = (scrubberEfficiency.value / 100) * 0.5
  const leak = fractureLeakRate.value
  const desyncSpike = band === "overpower" ? 0.8 : 0
  const baseDrain = 0.1
  return baseDrain + leak + desyncSpike - recovery
})

// Airflow balance display label
export const airflowBalance = computed(() => {
  const anySealed =
    cockpitSealed.value || crewQuartersSealed.value || serviceBaySealed.value
  if (anySealed && fracturePatched.value) return "REROUTED"
  if (anySealed) return "UNBALANCED"
  return "BALANCED"
})

// Environmental gate: all conditions required for Phase II
export const envGateMet = computed(() => {
  return (
    oxygenLossRate.value <= 0 &&
    scrubberEfficiency.value >= 85 &&
    cabinPressure.value >= 0.98 &&
    reactorBand.value === "nominal"
  )
})

// Effect: oxygen depletion loop (replaces setupOxygenDepletion in shiphealth.js)
function setupOxygenDepletion() {
  let interval = null

  effect(() => {
    const phase = reactorPhase.value

    if (interval) {
      clearInterval(interval)
      interval = null
    }

    if (phase < 1) return

    // Initial oxygen drop when Phase 1 is reached
    if (oxygenLevel.value === 100) {
      oxygenLevel.value = 68
    }

    interval = setInterval(() => {
      const rate = oxygenLossRate.peek()
      const current = oxygenLevel.peek()
      oxygenLevel.value = Math.max(0, Math.min(100, current - rate))
    }, 1000)
  })
}

// Effect: phase 1→2 gate (avoids circular import with reactor.js)
function setupPhaseGate() {
  let gateTimer = null

  effect(() => {
    const phase = reactorPhase.value
    const temp = reactorTemp.value
    const power = reactorPower.value
    const gate = envGateMet.value

    if (gateTimer) {
      clearTimeout(gateTimer)
      gateTimer = null
    }

    if (phase === 1 && temp === 124 && power === 124 && gate) {
      gateTimer = setTimeout(() => {
        if (
          reactorPhase.peek() === 1 &&
          reactorTemp.peek() === 124 &&
          reactorPower.peek() === 124 &&
          envGateMet.peek()
        ) {
          reactorPhase.value = 2
          lastPhaseChangeTime.value = Date.now()
        }
      }, 5000)
    }
  })
}

// Effect: set data-o2 attribute on html element for CSS degradation
function setupO2DegradationAttribute() {
  effect(() => {
    const o2 = oxygenLevel.value
    const level =
      o2 < 10
        ? "critical"
        : o2 < 20
          ? "severe"
          : o2 < 30
            ? "moderate"
            : o2 < 40
              ? "low"
              : "normal"
    document.documentElement.setAttribute("data-o2", level)
  })
}

// Initialize all effects
setupOxygenDepletion()
setupPhaseGate()
setupO2DegradationAttribute()
