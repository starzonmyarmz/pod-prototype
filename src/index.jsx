import { render } from "preact"

import { Reactor } from "./components/reactor.jsx"
import { ShipHealth } from "./components/shiphealth.jsx"
import { Navigation } from "./components/navigation.jsx"
import { reactorPhase } from "./state/reactor.js"

import "./styles/knob.css"
import "./styles/switch.css"
import "./styles/style.css"

export function App() {
  const phase = reactorPhase.value

  return (
    <>
      <Reactor />
      <ShipHealth />
      <Navigation active={phase >= 2} />
    </>
  )
}

render(<App />, document.getElementById("app"))
