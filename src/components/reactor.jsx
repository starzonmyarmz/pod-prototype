import { Switch } from "./switch.jsx"
import {
  SWITCH_VALUES,
  checkedSwitches,
  reactorOverride,
  reactorPhase,
  reactorPower,
  reactorStatus,
  reactorTemp,
  reactorExploded,
  lastSwitchPressTime,
} from "../state/reactor.js"

import "../styles/reactor.css"

export function Reactor() {
  const toggleSwitch = async (value) => {
    const switches = new Set(checkedSwitches.value)

    switches.has(value) ? switches.delete(value) : switches.add(value)

    checkedSwitches.value = switches
    lastSwitchPressTime.value = Date.now()
    reactorPower.value = [...switches].reduce((sum, val) => sum + val, 0)
  }

  const handleOverridePress = () => (reactorOverride.value = true)
  const handleOverrideRelease = () => (reactorOverride.value = false)

  return (
    <main id="reactor">
      <ReactorStatus />
      <ReactorTemp />
      <ReactorSwitches onToggle={toggleSwitch} />
      <ReactorOverride
        onPress={handleOverridePress}
        onRelease={handleOverrideRelease}
      />
    </main>
  )
}

function ReactorStatus() {
  const phase = reactorPhase.value
  const status = reactorStatus.value

  return (
    <section id="reactor-status">
      REACTOR STATUS:{" "}
      <output>
        Phase {phase} {status && `— ${status}`}
      </output>
    </section>
  )
}

function ReactorTemp() {
  const temp = reactorTemp.value
  const exploded = reactorExploded.value
  const maxTemp = SWITCH_VALUES.reduce((sum, val) => sum + val, 0)

  // Calculate percentage and angle for the gauge
  const percentage = (temp / maxTemp) * 100
  const angle = (percentage / 100) * 180 - 90 // -90 to 90 degrees

  // Calculate color based on temperature (blue → green → yellow → orange → red)
  const getColor = (pct) => {
    if (pct < 25) return `hsl(${200 + pct * 1.6}, 80%, 60%)` // blue to cyan
    if (pct < 50) return `hsl(${240 - pct * 2.4}, 70%, 50%)` // cyan to green
    if (pct < 75) return `hsl(${120 - (pct - 50) * 2.4}, 80%, 50%)` // green to yellow/orange
    return `hsl(${60 - (pct - 75) * 2.4}, 90%, 55%)` // orange to red
  }

  const needleColor = getColor(percentage)

  return (
    <section id="reactor-temp" class="stack g2">
      CORE TEMP
      {exploded ? (
        <output class="temp-exploded">💥 EXPLODED</output>
      ) : (
        <div class="tachometer">
          <svg viewBox="0 0 200 120" class="tachometer-gauge">
            {/* Background arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#333"
              stroke-width="20"
              stroke-linecap="round"
            />
            {/* Colored progress arc */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={needleColor}
              stroke-width="20"
              stroke-linecap="round"
              stroke-dasharray={`${percentage * 2.51} 251`}
              class="tachometer-arc"
            />
            {/* Center dot */}
            <circle cx="100" cy="100" r="8" fill="#444" />
            {/* Needle */}
            <line
              x1="100"
              y1="100"
              x2="100"
              y2="30"
              stroke={needleColor}
              stroke-width="3"
              stroke-linecap="round"
              transform={`rotate(${angle}, 100, 100)`}
              class="tachometer-needle"
            />
            <circle cx="100" cy="100" r="6" fill={needleColor} />
          </svg>
        </div>
      )}
    </section>
  )
}

function ReactorSwitches({ onToggle }) {
  return (
    <section id="reactor-switches" class="flow g3">
      {SWITCH_VALUES.map((value) => (
        <Switch
          key={value}
          value={value}
          checked={checkedSwitches.value.has(value)}
          label={false}
          onChange={() => onToggle(value)}
        />
      ))}
    </section>
  )
}

function ReactorOverride({ onPress, onRelease }) {
  const isActive = reactorOverride.value

  return (
    <section id="reactor-buttons" class="stack g2">
      <button
        type="button"
        onPointerDown={onPress}
        onPointerUp={onRelease}
        class={`btn override ${isActive ? "down" : ""}`}
      />
      OVERRIDE
    </section>
  )
}
