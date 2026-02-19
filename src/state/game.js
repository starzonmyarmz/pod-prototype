import { signal, computed, effect } from "@preact/signals"

// ── Power / Reactor ──────────────────────────────────────────────────────────
export const auxPowerOnline   = signal(false)
export const reactorPhase     = signal(0)          // 0‥4
export const busCStable       = signal(false)
export const busBOnline       = signal(false)

// ── Environment / Life Support ───────────────────────────────────────────────
export const o2Level          = signal(100)        // 0‥100 %
export const o2Depleting      = signal(true)       // starts true after vitals
export const o2LossRate       = signal(0)          // %/tick (negative = good)
export const pressure         = signal(100)        // 0‥100 %
export const microfracturePatch = signal(false)
export const scrubbersPowered = signal(false)
export const compartmentIsolated = signal(false)   // A5/A6
export const lssConsolePowered  = signal(false)

export const scrubbersActive  = computed(() => busCStable.value && scrubbersPowered.value)
export const envBaselineOk    = computed(() =>
  microfracturePatch.value &&
  scrubbersActive.value &&
  o2Level.value >= 40 &&
  pressure.value >= 60
)

// ── Access / Authority ───────────────────────────────────────────────────────
// "unresolved" | "deceased" | "confirmed_alive"
export const principalStatus          = signal("unresolved")
export const crewCount                = signal(3)
export const redundancyDegraded       = signal(false)
export const survivalModeEngaged      = signal(false)
export const compartmentUnlocked      = signal(false)
export const filesRead                = signal(false)
export const secondaryBiometricEnabled = signal(false)
export const identityFlipDone         = signal(false)

// ── Navigation / Comms ───────────────────────────────────────────────────────
export const navCoreRepaired    = signal(false)
export const commsPartialOnline = signal(false)

// ── Endings ──────────────────────────────────────────────────────────────────
export const redundancyRestored  = signal(false)
export const overlapMaintained   = signal(false)
export const collisionCourseSet  = signal(false)
export const ending              = signal(null)   // null | "pilot" | "usurp" | "contain"

// ── Terminal log ─────────────────────────────────────────────────────────────
export const terminalLog = signal([])

export function log(msg, type = "info") {
  terminalLog.value = [...terminalLog.value.slice(-80), { msg, type, ts: Date.now() }]
}

// ── Derived gate helpers ─────────────────────────────────────────────────────
export const lssAccessible = computed(() =>
  auxPowerOnline.value && lssConsolePowered.value
)

export const reactorCanStart = computed(() =>
  auxPowerOnline.value && microfracturePatch.value
)

// ── Automated side‑effects ───────────────────────────────────────────────────

// O₂ simulation tick (runs every second)
let tickId = null
function startTick() {
  if (tickId) return
  tickId = setInterval(() => {
    if (!o2Depleting.value) return

    const patchBonus    = microfracturePatch.value   ? 0.25 : 0
    const scrubberBonus = scrubbersActive.value       ? 0.40 : 0
    const isoBonus      = compartmentIsolated.value   ? 0.10 : 0
    const net = -(0.8 - patchBonus - scrubberBonus - isoBonus)
    // net < 0 means depleting; net ≥ 0 means recovering
    o2LossRate.value = net

    o2Level.value = Math.max(0, Math.min(100, o2Level.value + net))
    pressure.value = Math.max(0, Math.min(100, pressure.value + net * 0.3))

    // crew starts suffocating below 15%
    if (o2Level.value < 15 && crewCount.value > 0) {
      crewCount.value = Math.max(0, crewCount.value - 0.005)
    }
  }, 1000)
}
startTick()

// Survival mode auto‑engage
effect(() => {
  if (crewCount.value < 2 && redundancyDegraded.value) {
    if (!survivalModeEngaged.value) {
      survivalModeEngaged.value = true
      log("⚠ SURVIVAL MODE ENGAGED — authority structure compromised", "warn")
    }
  }
})

// Secondary biometric unlock
effect(() => {
  if (
    survivalModeEngaged.value &&
    compartmentUnlocked.value &&
    filesRead.value &&
    !secondaryBiometricEnabled.value
  ) {
    secondaryBiometricEnabled.value = true
    log("SECONDARY BIOMETRIC SOURCE ENABLED — scan when ready", "warn")
  }
})

// BUS C / scrubbers follow reactor phase
effect(() => {
  if (reactorPhase.value >= 1) {
    busCStable.value = true
  }
  if (reactorPhase.value >= 2) {
    busBOnline.value = true
  }
})

// Ending resolution
effect(() => {
  if (!identityFlipDone.value) return
  if (collisionCourseSet.value)  { ending.value = "contain"; return }
  if (overlapMaintained.value)   { ending.value = "usurp";   return }
  if (redundancyRestored.value)  { ending.value = "pilot";   return }
})
