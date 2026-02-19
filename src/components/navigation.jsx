import {
  busBOnline, navCoreRepaired, commsPartialOnline,
  redundancyRestored, overlapMaintained, collisionCourseSet,
  identityFlipDone, ending, log
} from "../state/game.js"

const WAYPOINTS = ["DEPARTURE", "LAGRANGE L4", "EUROPA APPROACH", "EUROPA ORBIT"]
import { signal } from "@preact/signals"

const selectedWaypoint = signal(0)
const courseSet = signal(false)

function setWaypoint(i) {
  if (!navCoreRepaired.value) { log("NAV core offline", "error"); return }
  selectedWaypoint.value = i
  courseSet.value = false
  log(`Waypoint selected: ${WAYPOINTS[i]}`, "info")
}

function lockCourse() {
  if (!navCoreRepaired.value) { log("NAV core offline", "error"); return }
  courseSet.value = true
  log(`Course locked to ${WAYPOINTS[selectedWaypoint.value]}`, "ok")
}

function toggleComms() {
  if (!busBOnline.value) { log("BUS B offline", "error"); return }
  if (!navCoreRepaired.value) { log("NAV core required for comms routing", "error"); return }
  commsPartialOnline.value = !commsPartialOnline.value
  log(commsPartialOnline.value ? "COMMS partial uplink established" : "COMMS offline", commsPartialOnline.value ? "ok" : "warn")
}

function chooseEnding(choice) {
  if (!identityFlipDone.value) { log("Command access required", "error"); return }
  redundancyRestored.value  = choice === "pilot"
  overlapMaintained.value   = choice === "usurp"
  collisionCourseSet.value  = choice === "contain"
  log(`Final directive set: ${choice.toUpperCase()}`, "warn")
}

export function Navigation() {
  const active = busBOnline.value && navCoreRepaired.value
  const cmdActive = identityFlipDone.value

  return (
    <section class={`panel nav-panel ${active ? "" : "panel-locked"}`}>
      <header class="panel-header">
        <span class="panel-title">NAVIGATION</span>
        {!active && <span class="lock-badge">{!busBOnline.value ? "BUS B OFFLINE" : "NAV CORE DOWN"}</span>}
      </header>

      <div class="waypoint-list">
        {WAYPOINTS.map((wp, i) => (
          <button
            key={i}
            class={`waypoint-btn ${selectedWaypoint.value === i ? "waypoint-active" : ""} ${courseSet.value && selectedWaypoint.value === i ? "waypoint-locked" : ""}`}
            onClick={() => setWaypoint(i)}
            disabled={!active}
          >
            <span class="waypoint-idx">{String(i).padStart(2, "0")}</span>
            {wp}
            {courseSet.value && selectedWaypoint.value === i && <span class="waypoint-lock-icon">◈</span>}
          </button>
        ))}
      </div>

      <div class="control-row">
        <button class="btn btn-primary" onClick={lockCourse} disabled={!active || courseSet.value}>
          {courseSet.value ? "COURSE LOCKED ◈" : "LOCK COURSE"}
        </button>
        <button
          class={`btn ${commsPartialOnline.value ? "btn-active" : ""}`}
          onClick={toggleComms}
          disabled={!active}
        >
          COMMS {commsPartialOnline.value ? "UP" : "DOWN"}
        </button>
      </div>

      {cmdActive && (
        <div class="command-zone">
          <div class="command-zone-label">⚠ COMMAND OVERRIDE — SELECT FINAL DIRECTIVE</div>
          <div class="control-row">
            <button
              class={`btn ${ending.value === "pilot" ? "btn-active" : ""}`}
              onClick={() => chooseEnding("pilot")}
            >
              DELIVER
            </button>
            <button
              class={`btn btn-danger ${ending.value === "usurp" ? "btn-active" : ""}`}
              onClick={() => chooseEnding("usurp")}
            >
              USURP
            </button>
            <button
              class={`btn btn-danger ${ending.value === "contain" ? "btn-active" : ""}`}
              onClick={() => chooseEnding("contain")}
            >
              CONTAIN
            </button>
          </div>
          {ending.value && (
            <div class="ending-banner">
              FINAL DIRECTIVE: <strong>{ending.value.toUpperCase()}</strong>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
