import {
  o2Level, pressure, o2LossRate, o2Depleting,
  microfracturePatch, compartmentIsolated,
  scrubbersActive, lssAccessible, crewCount,
  redundancyDegraded, log
} from "../state/game.js"

function patchFracture() {
  if (!lssAccessible.value) { log("LSS console not powered", "error"); return }
  if (microfracturePatch.value) { log("Fracture already patched", "warn"); return }
  microfracturePatch.value = true
  log("Microfracture PATCHED — hull integrity restored", "ok")
}

function toggleIsolate() {
  if (!lssAccessible.value) { log("LSS console not powered", "error"); return }
  compartmentIsolated.value = !compartmentIsolated.value
  log(compartmentIsolated.value ? "Compartment ISOLATED — monitoring O₂ shift" : "Compartment doors OPENED", compartmentIsolated.value ? "ok" : "warn")
}

function toggleRedundancy() {
  redundancyDegraded.value = !redundancyDegraded.value
  log(
    redundancyDegraded.value ? "Life support redundancy DEGRADED" : "Redundancy systems RESTORED",
    redundancyDegraded.value ? "warn" : "ok"
  )
}

function gauge(val, low = 30, high = 60) {
  if (val <= low) return "gauge-danger"
  if (val <= high) return "gauge-warn"
  return "gauge-ok"
}

export function LifeSupport() {
  const o2 = Math.round(o2Level.value)
  const pres = Math.round(pressure.value)
  const crew = Math.round(crewCount.value * 10) / 10
  const lossDir = o2LossRate.value >= 0 ? "+" : ""
  const accessible = lssAccessible.value

  return (
    <section class={`panel lss-panel ${accessible ? "" : "panel-locked"}`}>
      <header class="panel-header">
        <span class="panel-title">LIFE SUPPORT</span>
        {!accessible && <span class="lock-badge">NO POWER</span>}
      </header>

      <div class="gauge-grid">
        <div class="gauge-block">
          <div class="gauge-label">O₂</div>
          <div class={`gauge-bar-track ${gauge(o2)}`}>
            <div class="gauge-fill" style={{ width: `${o2}%` }} />
          </div>
          <div class="gauge-value">{o2}%</div>
          <div class="gauge-sub">{lossDir}{(o2LossRate.value).toFixed(2)}/s</div>
        </div>

        <div class="gauge-block">
          <div class="gauge-label">PRESSURE</div>
          <div class={`gauge-bar-track ${gauge(pres)}`}>
            <div class="gauge-fill" style={{ width: `${pres}%` }} />
          </div>
          <div class="gauge-value">{pres}%</div>
        </div>

        <div class="gauge-block">
          <div class="gauge-label">CREW</div>
          <div class={`gauge-bar-track ${gauge(crew, 1, 2)}`}>
            <div class="gauge-fill" style={{ width: `${(crew / 3) * 100}%` }} />
          </div>
          <div class="gauge-value">{Math.ceil(crew)}</div>
        </div>
      </div>

      <div class="status-chips">
        <span class={`chip ${microfracturePatch.value ? "chip-ok" : "chip-bad"}`}>
          HULL {microfracturePatch.value ? "SEALED" : "BREACH"}
        </span>
        <span class={`chip ${scrubbersActive.value ? "chip-ok" : "chip-bad"}`}>
          SCRUB {scrubbersActive.value ? "ON" : "OFF"}
        </span>
        <span class={`chip ${compartmentIsolated.value ? "chip-ok" : "chip-off"}`}>
          ISO {compartmentIsolated.value ? "ON" : "OFF"}
        </span>
        <span class={`chip ${redundancyDegraded.value ? "chip-bad" : "chip-ok"}`}>
          REDUN {redundancyDegraded.value ? "FAIL" : "OK"}
        </span>
      </div>

      <div class="control-row">
        <button class="btn" onClick={toggleIsolate} disabled={!accessible}>
          {compartmentIsolated.value ? "OPEN DOORS" : "ISOLATE COMP"}
        </button>
        <button
          class={`btn ${microfracturePatch.value ? "btn-active" : "btn-primary"}`}
          onClick={patchFracture}
          disabled={!accessible || microfracturePatch.value}
        >
          {microfracturePatch.value ? "SEALED ✓" : "PATCH FRACTURE"}
        </button>
      </div>

      <div class="control-row">
        <button
          class={`btn ${redundancyDegraded.value ? "btn-danger" : ""}`}
          onClick={toggleRedundancy}
          disabled={!accessible}
        >
          {redundancyDegraded.value ? "DEGRADE: ON" : "DEGRADE REDUN"}
        </button>
      </div>
    </section>
  )
}
