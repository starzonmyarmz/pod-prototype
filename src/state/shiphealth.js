import { signal, effect } from "@preact/signals"
import { reactorPhase, reactorTemp, reactorStatus } from "./reactor.js"

// Ship vitals state
export const oxygenLevel = signal(100) // percentage
export const hullIntegrity = signal(100) // percentage
export const shieldStatus = signal(100) // percentage

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
        const fluctuation = (Math.random() - 0.5) * 2
        const tempFactor = temp / 511
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
setupHullDegradation()
setupShieldFluctuation()
