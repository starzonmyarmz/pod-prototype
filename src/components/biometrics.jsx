import {
  secondaryBiometricEnabled, identityFlipDone,
  principalStatus, survivalModeEngaged, compartmentUnlocked,
  filesRead, reactorPhase, log
} from "../state/game.js"

const UNLOCK_HINT_FILES = [
  "FLIGHT_PLAN_AMENDMENT_7.log",
  "COALITION_BRIEF_REDACTED.enc",
  "MANIFEST_DISCREPANCY.txt",
  "COMM_INTERCEPT_2287-04-11.raw",
]

function unlockCompartment() {
  if (reactorPhase.value < 2) { log("Compartment lock requires Phase II reactor", "error"); return }
  if (compartmentUnlocked.value) return
  compartmentUnlocked.value = true
  log("Concealed compartment UNLOCKED — files accessible", "warn")
}

function readFiles() {
  if (!compartmentUnlocked.value) { log("Compartment still locked", "error"); return }
  filesRead.value = true
  log("Principal documents reviewed — flight plan discrepancy confirmed", "warn")
  log("Coalition double-cross evidence found in COMM_INTERCEPT", "warn")
}

function scanPrimary() {
  if (principalStatus.value === "confirmed_alive") return
  principalStatus.value = "unresolved"
  log("PRIMARY BIOMETRIC SCAN — Principal status: UNRESOLVED (no response)", "error")
}

function scanSecondary() {
  if (!secondaryBiometricEnabled.value) {
    if (survivalModeEngaged.value && compartmentUnlocked.value && !filesRead.value) {
      log("SECONDARY SOURCE DETECTED — JUSTIFICATION TOKEN REQUIRED (read the files)", "warn")
    } else if (!survivalModeEngaged.value) {
      log("SECONDARY SOURCE DISABLED: POWER CONSERVATION / SECURITY LOCK", "error")
      log("SECONDARY INPUT REJECTED — JUSTIFICATION TOKEN REQUIRED", "error")
    } else {
      log("SECONDARY SOURCE LOCKED — conditions not met", "error")
    }
    return
  }
  identityFlipDone.value = true
  principalStatus.value = "deceased"
  log("DEAD-HAND SCAN ACCEPTED — Principal status: DECEASED", "warn")
  log("COMMAND-LEVEL ACCESS GRANTED", "ok")
}

export function Biometrics() {
  const enabled = secondaryBiometricEnabled.value
  const flipped = identityFlipDone.value
  const unlocked = compartmentUnlocked.value

  return (
    <section class="panel bio-panel">
      <header class="panel-header">
        <span class="panel-title">BIOMETRICS / AUTHORITY</span>
        <span class={`status-badge ${flipped ? "status-warn" : ""}`}>
          {flipped ? "COMMAND ACCESS" : principalStatus.value.toUpperCase()}
        </span>
      </header>

      <div class="bio-grid">
        <div class="bio-cell">
          <div class="bio-label">PRIMARY SOURCE</div>
          <div class="bio-scan-area" onClick={scanPrimary}>
            <div class="scan-ring scan-ring-primary">
              <div class="scan-pulse" />
              SCAN
            </div>
          </div>
          <div class="bio-status">
            {principalStatus.value === "unresolved" ? "NO RESPONSE" :
             principalStatus.value === "deceased"   ? "DECEASED" :
             "VERIFIED"}
          </div>
        </div>

        <div class={`bio-cell ${!enabled && !flipped ? "bio-locked" : ""}`}>
          <div class="bio-label">
            SECONDARY SOURCE
            {!enabled && !flipped && <span class="lock-badge">LOCKED</span>}
          </div>
          <div
            class={`bio-scan-area ${enabled || flipped ? "bio-scan-ready" : ""}`}
            onClick={scanSecondary}
          >
            <div class={`scan-ring ${flipped ? "scan-ring-danger" : enabled ? "scan-ring-warn" : "scan-ring-off"}`}>
              <div class="scan-pulse" />
              {flipped ? "◈ DEAD HAND" : enabled ? "SCAN" : "LOCKED"}
            </div>
          </div>
          <div class="bio-status">
            {flipped ? "DECEASED — COMMAND GRANTED" : enabled ? "READY" : "DISABLED"}
          </div>
        </div>
      </div>

      <div class="file-section">
        <div class="file-section-label">CONCEALED COMPARTMENT</div>
        <div class="control-row">
          <button
            class={`btn ${unlocked ? "btn-active" : "btn-primary"}`}
            onClick={unlockCompartment}
            disabled={unlocked || reactorPhase.value < 2}
          >
            {unlocked ? "OPEN ✓" : "UNLOCK"}
          </button>
          <button
            class={`btn ${filesRead.value ? "btn-active" : ""}`}
            onClick={readFiles}
            disabled={!unlocked || filesRead.value}
          >
            {filesRead.value ? "READ ✓" : "READ FILES"}
          </button>
        </div>
        {unlocked && (
          <div class="file-list">
            {UNLOCK_HINT_FILES.map(f => (
              <div key={f} class={`file-entry ${filesRead.value ? "file-read" : ""}`}>
                {filesRead.value ? "▣" : "▢"} {f}
              </div>
            ))}
          </div>
        )}
      </div>

      {survivalModeEngaged.value && (
        <div class="survival-banner">⚠ SURVIVAL MODE — authority structure compromised</div>
      )}
    </section>
  )
}
