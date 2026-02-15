import {
  oxygenLevel,
  hullIntegrity,
  shieldStatus,
  shipHealthStatus,
  vitalsActive,
} from "../state/shiphealth.js"
import { reactorPhase } from "../state/reactor.js"

import "../styles/shiphealth.css"

export function ShipHealth() {
  const active = vitalsActive.value
  const phase = reactorPhase.value

  return (
    <main id="ship-health" class={active ? "" : "inactive"}>
      <ShipHealthStatus active={active} />
      <ShipVitals active={active} phase={phase} />
    </main>
  )
}

function ShipHealthStatus({ active }) {
  const status = shipHealthStatus.value

  return (
    <section id="ship-status">
      SHIP VITALS:{" "}
      <output class={active ? status : "inactive"}>
        {active ? status.replace("-", " ") : "standby"}
      </output>
    </section>
  )
}

function ShipVitals({ active, phase }) {
  const oxygen = oxygenLevel.value
  const hull = hullIntegrity.value
  const shields = shieldStatus.value

  const getVitalClass = (value, threshold = 70) => {
    if (!active) return "inactive"
    if (value < 20) return "critical"
    if (value < 50) return "warning"
    if (value < threshold) return "caution"
    return "nominal"
  }

  return (
    <section id="ship-vitals" class="stack g3">
      <VitalReadout
        label="OXYGEN"
        value={oxygen}
        unit="%"
        active={active}
        vitalClass={getVitalClass(oxygen, 70)}
      />
      <VitalReadout
        label="HULL INTEGRITY"
        value={hull}
        unit="%"
        active={active}
        vitalClass={getVitalClass(hull)}
      />
      {phase >= 2 && (
        <VitalReadout
          label="SHIELD STATUS"
          value={shields}
          unit="%"
          active={active}
          vitalClass={getVitalClass(shields, 30)}
        />
      )}
    </section>
  )
}

function VitalReadout({ label, value, unit, active, vitalClass }) {
  return (
    <div class="vital-readout">
      <div class="vital-label">{label}</div>
      <div class={`vital-value ${vitalClass}`}>
        {active ? (
          <>
            <span class="vital-number">{value.toFixed(1)}</span>
            <span class="vital-unit">{unit}</span>
          </>
        ) : (
          <span class="vital-inactive">---.--</span>
        )}
      </div>
      <div class="vital-bar">
        <div
          class={`vital-bar-fill ${vitalClass}`}
          style={{ width: `${active ? value : 0}%` }}
        />
      </div>
    </div>
  )
}
