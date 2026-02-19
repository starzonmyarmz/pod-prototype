import {
  auxPowerOnline, reactorPhase, busCStable, busBOnline,
  scrubbersPowered, lssConsolePowered, reactorCanStart,
  navCoreRepaired, log, envBaselineOk
} from "../state/game.js"

const PHASE_LABELS = [
  "OFFLINE",
  "IDLE / AUX",
  "PHASE II — MAIN",
  "PHASE III — FULL",
  "PHASE IV — MAX",
]

const PHASE_COLORS = ["var(--c-off)", "var(--c-dim)", "var(--c-ok)", "var(--c-warn)", "var(--c-danger)"]

function startAux() {
  if (auxPowerOnline.value) return
  auxPowerOnline.value = true
  lssConsolePowered.value = true
  log("AUX power restored — LSS console powered", "ok")
}

function advanceReactor() {
  const p = reactorPhase.value
  if (p === 0 && !reactorCanStart.value) {
    log("REACTOR START BLOCKED — stabilise hull first", "error")
    return
  }
  if (p >= 4) { log("Reactor at maximum phase", "warn"); return }
  if (p === 1 && !envBaselineOk.value) {
    log("Phase II requires environmental baseline — patch fracture + scrubbers first", "error")
    return
  }
  reactorPhase.value = p + 1
  log(`Reactor advanced to ${PHASE_LABELS[p + 1]}`, "ok")
}

function scram() {
  if (reactorPhase.value === 0) return
  reactorPhase.value = Math.max(0, reactorPhase.value - 1)
  log("Reactor stepped down", "warn")
}

function toggleScrubbers() {
  if (!busCStable.value) { log("BUS C offline — cannot power scrubbers", "error"); return }
  scrubbersPowered.value = !scrubbersPowered.value
  log(scrubbersPowered.value ? "Scrubbers ONLINE" : "Scrubbers OFFLINE", scrubbersPowered.value ? "ok" : "warn")
}

function toggleNavRepair() {
  if (!busBOnline.value) { log("BUS B offline — NAV core unavailable", "error"); return }
  navCoreRepaired.value = !navCoreRepaired.value
  log(navCoreRepaired.value ? "NAV core repaired" : "NAV core offline", navCoreRepaired.value ? "ok" : "warn")
}

export function Reactor() {
  const phase = reactorPhase.value
  const barWidth = `${(phase / 4) * 100}%`
  const barColor = PHASE_COLORS[phase]

  return (
    <section class="panel reactor-panel">
      <header class="panel-header">
        <span class="panel-title">REACTOR</span>
        <span class="status-badge" style={{ color: barColor }}>
          {PHASE_LABELS[phase]}
        </span>
      </header>

      <div class="reactor-bar-track">
        <div
          class="reactor-bar"
          style={{ width: barWidth, background: barColor, boxShadow: `0 0 12px ${barColor}` }}
        />
        {[1, 2, 3, 4].map(i => (
          <div key={i} class="reactor-bar-notch" style={{ left: `${i * 25}%` }} />
        ))}
      </div>

      <div class="control-row">
        <button class="btn" onClick={startAux} disabled={auxPowerOnline.value}>
          {auxPowerOnline.value ? "AUX ONLINE" : "CRANK AUX"}
        </button>
        <button class="btn btn-danger" onClick={scram} disabled={phase === 0}>
          SCRAM ▼
        </button>
        <button class="btn btn-primary" onClick={advanceReactor}>
          IGNITE ▲
        </button>
      </div>

      <div class="bus-row">
        <div class={`bus-indicator ${busCStable.value ? "bus-on" : ""}`}>
          <span>BUS C / ENV</span>
          <span class="bus-dot" />
        </div>
        <div class={`bus-indicator ${busBOnline.value ? "bus-on" : ""}`}>
          <span>BUS B / NAV</span>
          <span class="bus-dot" />
        </div>
      </div>

      <div class="control-row">
        <button
          class={`btn ${scrubbersPowered.value ? "btn-active" : ""}`}
          onClick={toggleScrubbers}
          disabled={!busCStable.value}
        >
          SCRUBBERS {scrubbersPowered.value ? "ON" : "OFF"}
        </button>
        <button
          class={`btn ${navCoreRepaired.value ? "btn-active" : ""}`}
          onClick={toggleNavRepair}
          disabled={!busBOnline.value}
        >
          NAV CORE {navCoreRepaired.value ? "REPAIRED" : "REPAIR"}
        </button>
      </div>
    </section>
  )
}
