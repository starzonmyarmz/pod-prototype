import { signal, computed, effect } from "@preact/signals"
import { reactorPhase, reactorTemp, reactorStatus } from "./reactor.js"

// Ship vitals state
export const oxygenLevel = signal(100) // percentage
export const hullIntegrity = signal(100) // percentage
export const shieldStatus = signal(100) // percentage
export const systemsOnline = signal(true)

// Computed values
export const shipHealthStatus = computed(() => {
  const oxygen = oxygenLevel.value
  const hull = hullIntegrity.value
  const shields = shieldStatus.value

  if (oxygen < 20 || hull < 20) return "critical"
  if (oxygen < 50 || hull < 50) return "warning"
  if (shields < 30) return "shields-low"
  return "nominal"
})

export const vitalsActive = computed(() => {
  return reactorPhase.value >= 1
})

// Effect: oxygen depletion when Phase 1 is reached
function setupOxygenDepletion() {
  let depletionInterval = null

  effect(() => {
    const phase = reactorPhase.value
    const temp = reactorTemp.value
    const status = reactorStatus.value

    // Clear any existing interval
    if (depletionInterval) {
      clearInterval(depletionInterval)
      depletionInterval = null
    }

    // Start oxygen depletion at Phase 1
    if (phase >= 1) {
      // Initial oxygen drop when phase 1 is reached
      if (oxygenLevel.value === 100) {
        oxygenLevel.value = 68 // Below safe readings (70%)
      }

      // Continue slow depletion
      depletionInterval = setInterval(() => {
        const current = oxygenLevel.peek()
        if (current > 0) {
          // Depletion rate varies based on reactor status
          let depletionRate = 0.5 // base rate

          if (status === "danger") {
            depletionRate = 2.0 // faster when reactor is in danger
          } else if (status === "under powered") {
            depletionRate = 1.0 // moderate when underpowered
          }

          oxygenLevel.value = Math.max(0, current - depletionRate)
        }
      }, 1000) // Update every second
    }
  })
}

// Effect: hull degradation based on reactor conditions
function setupHullDegradation() {
  let degradationInterval = null

  effect(() => {
    const phase = reactorPhase.value
    const status = reactorStatus.value

    if (degradationInterval) {
      clearInterval(degradationInterval)
      degradationInterval = null
    }

    if (phase >= 1 && (status === "danger" || status === "over powered")) {
      degradationInterval = setInterval(() => {
        const current = hullIntegrity.peek()
        if (current > 0) {
          const rate = status === "danger" ? 0.8 : 0.3
          hullIntegrity.value = Math.max(0, current - rate)
        }
      }, 1000)
    }
  })
}

// Effect: shield fluctuation
function setupShieldFluctuation() {
  let shieldInterval = null

  effect(() => {
    const phase = reactorPhase.value
    const temp = reactorTemp.value

    if (shieldInterval) {
      clearInterval(shieldInterval)
      shieldInterval = null
    }

    if (phase >= 2) {
      shieldInterval = setInterval(() => {
        const current = shieldStatus.peek()
        // Shields fluctuate based on reactor temp
        const fluctuation = (Math.random() - 0.5) * 2
        const tempFactor = temp / 511 // normalize to 0-1
        const adjustment = fluctuation * (1 + tempFactor)

        shieldStatus.value = Math.max(
          0,
          Math.min(100, current + adjustment)
        )
      }, 2000)
    }
  })
}

// Initialize effects
setupOxygenDepletion()
setupHullDegradation()
setupShieldFluctuation()
