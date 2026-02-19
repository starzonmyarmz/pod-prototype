import { Knob } from "./knob.jsx"
import { Switch } from "./switch.jsx"
import {
  cockpitSealed,
  crewQuartersSealed,
  serviceBaySealed,
  fracturePatched,
  intakeRatio,
  purgeInterval,
  scrubberEfficiency,
  co2Saturation,
  cabinPressure,
  oxygenLossRate,
  airflowBalance,
} from "../state/lifesupport.js"
import {
  oxygenLevel,
  hullIntegrity,
  shieldStatus,
} from "../state/shiphealth.js"
import { reactorPhase } from "../state/reactor.js"

import "../styles/lifesupport.css"

export function LifeSupport() {
  const phase = reactorPhase.value
  const active = phase >= 1

  return (
    <main id="life-support" class={active ? "" : "inactive"}>
      <LifeSupportStatus active={active} />
      <LifeSupportReadouts active={active} phase={phase} />
      <CompartmentIsolation active={active} />
      <ScrubberControl active={active} />
    </main>
  )
}

function LifeSupportStatus({ active }) {
  const rate = oxygenLossRate.value
  const label = !active
    ? "standby"
    : rate > 0.05
      ? "depleting"
      : rate < -0.05
        ? "recovering"
        : "stable"
  const cls = active ? label : "inactive"

  return (
    <section id="ls-status">
      LIFE SUPPORT: <output class={cls}>{label}</output>
    </section>
  )
}

function LifeSupportReadouts({ active, phase }) {
  const o2 = oxygenLevel.value
  const co2 = co2Saturation.value
  const pressure = cabinPressure.value
  const efficiency = scrubberEfficiency.value
  const airflow = airflowBalance.value
  const lossRate = oxygenLossRate.value
  const hull = hullIntegrity.value
  const shields = shieldStatus.value

  const getO2Class = (v) => {
    if (!active) return "inactive"
    if (v < 30) return "critical"
    if (v < 50) return "warning"
    if (v < 70) return "caution"
    return "nominal"
  }

  const getCo2Class = (v) => {
    if (!active) return "inactive"
    if (v >= 35) return "critical"
    if (v >= 25) return "warning"
    if (v >= 15) return "caution"
    return "nominal"
  }

  const getPressureClass = (v) => {
    if (!active) return "inactive"
    if (v < 0.9) return "critical"
    if (v < 0.95) return "warning"
    if (v < 0.99) return "caution"
    return "nominal"
  }

  const getEfficiencyClass = (v) => {
    if (!active) return "inactive"
    if (v < 65) return "critical"
    if (v < 75) return "warning"
    if (v < 85) return "caution"
    return "nominal"
  }

  const getLossRateClass = (v) => {
    if (!active) return "inactive"
    if (v > 0.8) return "alarm"
    if (v > 0.3) return "warning"
    if (v > 0) return "caution"
    return "ok"
  }

  const getHullClass = (v) => {
    if (!active) return "inactive"
    if (v < 20) return "critical"
    if (v < 50) return "warning"
    if (v < 70) return "caution"
    return "nominal"
  }

  const getShieldClass = (v) => {
    if (!active) return "inactive"
    if (v < 20) return "critical"
    if (v < 30) return "warning"
    if (v < 50) return "caution"
    return "nominal"
  }

  const formatLossRate = (v) => {
    const sign = v <= 0 ? "\u2212" : "+"
    return `${sign}${Math.abs(v).toFixed(2)} %/s`
  }

  return (
    <section id="ls-readouts">
      <ReadoutRow
        label="O₂ RESERVE"
        value={active ? `${o2.toFixed(1)}%` : "---.--"}
        barValue={o2}
        barClass={getO2Class(o2)}
        active={active}
      />
      <ReadoutRow
        label="CO₂ SATURATION"
        value={active ? `${co2.toFixed(1)}%` : "---.--"}
        barValue={co2}
        barClass={getCo2Class(co2)}
        active={active}
      />
      <ReadoutRow
        label="CABIN PRESSURE"
        value={active ? `${pressure.toFixed(3)} ATM` : "---.--"}
        barValue={pressure * 100}
        barClass={getPressureClass(pressure)}
        active={active}
      />
      <ReadoutRow
        label="SCRUBBER EFF"
        value={active ? `${efficiency.toFixed(1)}%` : "---.--"}
        barValue={efficiency}
        barClass={getEfficiencyClass(efficiency)}
        active={active}
      />
      <ReadoutRow
        label="AIRFLOW"
        value={active ? airflow : "---"}
        barValue={null}
        barClass={
          active ? (airflow === "BALANCED" ? "nominal" : "caution") : "inactive"
        }
        active={active}
      />
      <ReadoutRow
        label="O₂ LOSS RATE"
        value={active ? formatLossRate(lossRate) : "---.--"}
        barValue={null}
        barClass={getLossRateClass(lossRate)}
        active={active}
        valueClass={`ls-loss-rate ${getLossRateClass(lossRate)}`}
      />
      <ReadoutRow
        label="HULL INTEGRITY"
        value={active ? `${hull.toFixed(1)}%` : "---.--"}
        barValue={hull}
        barClass={getHullClass(hull)}
        active={active}
      />
      {phase >= 2 && (
        <ReadoutRow
          label="SHIELD STATUS"
          value={active ? `${shields.toFixed(1)}%` : "---.--"}
          barValue={shields}
          barClass={getShieldClass(shields)}
          active={active}
        />
      )}
    </section>
  )
}

function ReadoutRow({ label, value, barValue, barClass, active, valueClass }) {
  return (
    <div class="vital-readout">
      <div class="vital-label">{label}</div>
      <div class={`vital-value ${valueClass ?? barClass}`}>
        {active ? (
          <span class="vital-number">{value}</span>
        ) : (
          <span class="vital-inactive">---.--</span>
        )}
      </div>
      {barValue !== null && (
        <div class="vital-bar">
          <div
            class={`vital-bar-fill ${barClass}`}
            style={{ width: `${active ? barValue : 0}%` }}
          />
        </div>
      )}
    </div>
  )
}

function CompartmentIsolation({ active }) {
  const patched = fracturePatched.value

  return (
    <fieldset id="ls-isolation" disabled={!active}>
      <legend>[1] COMPARTMENT ISOLATION</legend>
      <div class="ls-isolation-switches">
        <Switch
          value="CKPT"
          label={true}
          checked={cockpitSealed.value}
          onChange={(e) => (cockpitSealed.value = e.target.checked)}
        />
        <Switch
          value="CREW"
          label={true}
          checked={crewQuartersSealed.value}
          onChange={(e) => (crewQuartersSealed.value = e.target.checked)}
        />
        <Switch
          value="SVC"
          label={true}
          checked={serviceBaySealed.value}
          onChange={(e) => (serviceBaySealed.value = e.target.checked)}
        />
      </div>
      <div class={`ls-fracture-status ${patched ? "patched" : "unpatched"}`}>
        FRACTURE: {patched ? "SEALED" : "UNPATCHED"}
      </div>
    </fieldset>
  )
}

function ScrubberControl({ active }) {
  const efficiency = scrubberEfficiency.value

  return (
    <fieldset id="ls-scrubber" disabled={!active}>
      <legend>[2] SCRUBBER CONTROL</legend>
      <div class="ls-scrubber-controls">
        <div class="ls-knob-group">
          <Knob
            label="Intake Ratio"
            min={0}
            max={100}
            value={intakeRatio.value}
            onChange={(v) => (intakeRatio.value = v)}
          />
          <span class="ls-knob-label">INTAKE</span>
        </div>
        <div class="ls-knob-group">
          <Knob
            label="Purge Interval"
            min={0}
            max={100}
            value={purgeInterval.value}
            onChange={(v) => (purgeInterval.value = v)}
          />
          <span class="ls-knob-label">PURGE</span>
        </div>
      </div>
      <output class="ls-efficiency-readout">
        SCRUBBER EFF: {efficiency.toFixed(1)}%
      </output>
      <div class="ls-manual-notice">
        MANUAL TUNING MODE — OPERATOR TRAINING REQUIRED
      </div>
    </fieldset>
  )
}
