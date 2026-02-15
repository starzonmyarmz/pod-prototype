import { signal, computed, effect } from "@preact/signals"

// Game constants
export const SWITCH_VALUES = [1, 2, 4, 8, 16, 32, 64, 128, 256]

export const PHASE_THRESHOLDS = {
  0: 31,
  1: 124,
  2: 452,
}

const TIMERS = {
  TEMP_UPDATE_SPEED: 100,
  TEMP_ACCELERATION_MIN: 10,
  STABILITY_DELAY: 5000,
  OVERLOAD_DELAY: 10000,
  EXPLOSION_DELAY: 10000,
}

const TEMP_ACCELERATION_RATE = 0.9

// Core reactor state
export const checkedSwitches = signal(new Set())
export const reactorPower = signal(0)
export const reactorPhase = signal(0)
export const reactorTemp = signal(0)
export const reactorOverride = signal(false)
export const reactorExploded = signal(false)
export const lastSwitchPressTime = signal(0)
export const lastPhaseChangeTime = signal(0)

// Helper functions
const getThresholds = (threshold) => ({
  weak: Math.floor(threshold * 0.8),
  danger: Math.ceil(threshold * 1.2),
})

const isPhaseChangeActive = () =>
  lastPhaseChangeTime.value > lastSwitchPressTime.value

// Computed values
export const reactorStatus = computed(() => {
  const temp = reactorTemp.value
  const phase = reactorPhase.value
  const threshold = PHASE_THRESHOLDS[phase]

  if (!threshold) return "complete"
  if (isPhaseChangeActive()) return ""

  const { weak, danger } = getThresholds(threshold)

  if (temp >= danger) return "danger"
  if (temp > threshold) return "over powered"
  if (temp === threshold) return "stable"
  if (temp >= weak) return "weak"
  if (phase === 0 && temp === 0) return ""
  return "under powered"
})

export const reactorTempStatus = computed(() => {
  const temp = reactorTemp.value
  const phase = reactorPhase.value
  const threshold = PHASE_THRESHOLDS[phase]

  if (!threshold) return "green"

  const { weak, danger } = getThresholds(threshold)

  if (temp >= danger) return "red"
  if (temp > threshold) return "orange"
  if (temp === threshold || temp >= weak) return "green"
  return "blue"
})

// Shared temperature update utilities
const updateTempValue = (targetPower, isIncreasing) => {
  if (isIncreasing) {
    reactorTemp.value = Math.min(targetPower, reactorTemp.peek() + 1)
  } else {
    reactorTemp.value = Math.max(targetPower, reactorTemp.peek() - 1)
  }
}

const hasReachedTarget = (targetPower, isIncreasing) => {
  const currentTemp = reactorTemp.peek()
  return isIncreasing ? currentTemp >= targetPower : currentTemp <= targetPower
}

// Effects
function setupTemperatureUpdates() {
  let tempUpdateInterval = null

  const clearTempInterval = () => {
    if (tempUpdateInterval) {
      clearTimeout(tempUpdateInterval)
      tempUpdateInterval = null
    }
  }

  const scheduleAcceleratingUpdates = (targetPower, isIncreasing) => {
    let intervalTime = TIMERS.TEMP_UPDATE_SPEED

    const scheduleNext = () => {
      tempUpdateInterval = setTimeout(() => {
        if (reactorOverride.value) {
          clearTempInterval()
          return
        }

        updateTempValue(targetPower, isIncreasing)

        if (hasReachedTarget(targetPower, isIncreasing)) {
          tempUpdateInterval = null
        } else {
          intervalTime = Math.max(
            TIMERS.TEMP_ACCELERATION_MIN,
            intervalTime * TEMP_ACCELERATION_RATE
          )
          scheduleNext()
        }
      }, intervalTime)
    }

    scheduleNext()
  }

  effect(() => {
    const power = reactorPower.value
    const override = reactorOverride.value

    if (override || isPhaseChangeActive()) return

    clearTempInterval()

    const currentTemp = reactorTemp.peek()
    const tempDifference = power - currentTemp

    if (tempDifference === 0) return

    if (reactorOverride.value) return

    const targetPower = reactorPower.value
    if (targetPower !== power) return

    if (targetPower > reactorTemp.peek()) {
      scheduleAcceleratingUpdates(targetPower, true)
    } else if (targetPower < reactorTemp.peek()) {
      scheduleAcceleratingUpdates(targetPower, false)
    }
  })
}

function setupExplosionTimer() {
  let timer = null

  effect(() => {
    const status = reactorStatus.value

    if (status === "danger") {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        reactorExploded.value = true
      }, TIMERS.EXPLOSION_DELAY)
    } else {
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }
  })
}

function setupPhaseProgression() {
  let progressTimer = null
  let demoteTimer = null

  const isStableAtThreshold = (temp, power, threshold) =>
    temp === power && power === threshold

  const shouldProgressPhase = (phase) => {
    const currentPhase = reactorPhase.value
    const currentThreshold = PHASE_THRESHOLDS[currentPhase]

    return (
      reactorTemp.value === reactorPower.value &&
      reactorPower.value === currentThreshold &&
      currentPhase === phase
    )
  }

  const resetReactor = () => {
    checkedSwitches.value = new Set()
    reactorPower.value = 0
    reactorPhase.value = 0
    lastPhaseChangeTime.value = Date.now()
  }

  effect(() => {
    const temp = reactorTemp.value
    const power = reactorPower.value
    const phase = reactorPhase.value
    const threshold = PHASE_THRESHOLDS[phase]
    const status = reactorStatus.value

    if (progressTimer) {
      clearTimeout(progressTimer)
      progressTimer = null
    }

    if (demoteTimer) {
      clearTimeout(demoteTimer)
      demoteTimer = null
    }

    if (isStableAtThreshold(temp, power, threshold) && phase < 3) {
      progressTimer = setTimeout(() => {
        if (shouldProgressPhase(phase)) {
          reactorPhase.value = phase + 1
          lastPhaseChangeTime.value = Date.now()
        }
      }, TIMERS.STABILITY_DELAY)
    } else if (status === "over powered" && phase === 1) {
      demoteTimer = setTimeout(() => {
        if (
          reactorStatus.value === "over powered" &&
          reactorPhase.value === 1
        ) {
          resetReactor()
        }
      }, TIMERS.OVERLOAD_DELAY)
    }
  })
}

function setupOverrideEffect() {
  let heatingInterval = null
  let coolingInterval = null

  const clearIntervalRef = (interval) => {
    if (interval) {
      clearTimeout(interval)
    }
    return null
  }

  const shouldStopUpdate = (isIncreasing) => {
    if (isIncreasing && !reactorOverride.value) return true
    if (!isIncreasing && reactorExploded.value) return true
    return false
  }

  const scheduleOverrideUpdates = (targetTemp, isIncreasing) => {
    let intervalTime = TIMERS.TEMP_UPDATE_SPEED

    const scheduleNext = () => {
      const timeout = setTimeout(() => {
        if (shouldStopUpdate(isIncreasing)) {
          if (isIncreasing) {
            heatingInterval = clearIntervalRef(heatingInterval)
          } else {
            coolingInterval = clearIntervalRef(coolingInterval)
          }
          return
        }

        updateTempValue(targetTemp, isIncreasing)

        if (hasReachedTarget(targetTemp, isIncreasing)) {
          if (isIncreasing) {
            heatingInterval = null
          } else {
            coolingInterval = null
          }
        } else {
          intervalTime = Math.max(
            TIMERS.TEMP_ACCELERATION_MIN,
            intervalTime * TEMP_ACCELERATION_RATE
          )
          if (isIncreasing) {
            heatingInterval = scheduleNext()
          } else {
            coolingInterval = scheduleNext()
          }
        }
      }, intervalTime)

      return timeout
    }

    return scheduleNext()
  }

  effect(() => {
    const override = reactorOverride.value
    const maxTemp = SWITCH_VALUES.reduce((sum, val) => sum + val, 0)

    if (override) {
      coolingInterval = clearIntervalRef(coolingInterval)

      if (!heatingInterval) {
        heatingInterval = scheduleOverrideUpdates(maxTemp, true)
      }
    } else {
      heatingInterval = clearIntervalRef(heatingInterval)

      const targetTemp = reactorPower.value
      if (!coolingInterval && reactorTemp.value > targetTemp) {
        coolingInterval = scheduleOverrideUpdates(targetTemp, false)
      }
    }
  })
}

// Initialize all effects
setupTemperatureUpdates()
setupExplosionTimer()
setupPhaseProgression()
setupOverrideEffect()
