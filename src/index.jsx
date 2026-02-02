import { render } from "preact"

import { Reactor } from "./components/reactor.jsx"
import { Navigation } from "./components/navigation.jsx"
import { reactorPhase } from "./state/reactor.js"

import "./styles/button.css"
import "./styles/choice.css"
import "./styles/range.css"
import "./styles/switch.css"
import "./styles/style.css"

export function App() {
  const phase = reactorPhase.value

  return (
    <>
      <Reactor />
      {phase >= 0 && <Navigation />}
    </>
  )
}

render(<App />, document.getElementById("app"))
