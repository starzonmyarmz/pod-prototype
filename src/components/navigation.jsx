import { signal } from "@preact/signals"
import { Choice } from "./choice.jsx"
import { Range } from "./range.jsx"
import { Switch } from "./switch.jsx"

import "../styles/navigation.css"

const yaw = signal(0)
const pitch = signal(0)
const roll = signal(0)

export function Navigation() {
  return (
    <main id="nav">
      <section id="nav-filters" class="stack g3">
        <fieldset className="ctl-group flow g3">
          <legend>Object type</legend>
          <Switch value="stellar" />
          <Switch value="artificial" />
          <Switch value="unknown" />
        </fieldset>

        <fieldset className="ctl-group flow g3">
          <legend>Magnitude</legend>
          <Choice value="bright" name="magnitude" checked />
          <Choice value="mid" name="magnitude" />
          <Choice value="dim" name="magnitude" />
        </fieldset>

        <fieldset className="ctl-group flow g3">
          <legend>Spectral</legend>
          <Switch value="f/g/k" />
          <Switch value="o/b" />
          <Switch value="m/anom" />
        </fieldset>

        <fieldset className="ctl-group flow g3">
          <legend>Confidence</legend>
          <Choice value="raw" name="confidence" checked />
          <Choice value="probable" name="confidence" />
          <Choice value="verified" name="confidence" />
        </fieldset>
      </section>

      <section id="nav-plotter"></section>

      <section id="nav-routing" class="stack g3">
        <fieldset className="ctl-group flow g3">
          <legend>Frame select</legend>
          <Choice value="ship-rel" name="frame-select" checked />
          <Choice value="galactic" name="frame-select" />
          <Choice value="eliptic" name="frame-select" />
        </fieldset>

        <fieldset className="ctl-group stack g3">
          <legend>Something</legend>
          <Range label="yaw" min="-20" max="20" defaultValue={yaw.value} onChange={(v) => yaw.value = v} />
          <Range label="pitch" min="-20" max="20" defaultValue={pitch.value} onChange={(v) => pitch.value = v} />
          <Range label="roll" min="-20" max="20" defaultValue={roll.value} onChange={(v) => roll.value = v} />
        </fieldset>
      </section>
    </main>
  )
}
