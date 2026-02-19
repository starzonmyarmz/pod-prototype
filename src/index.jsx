import { render } from "preact"
import "./styles/main.css"
import { Reactor }     from "./components/reactor.jsx"
import { LifeSupport } from "./components/lifesupport.jsx"
import { Navigation }  from "./components/navigation.jsx"
import { Biometrics }  from "./components/biometrics.jsx"
import { Terminal }    from "./components/terminal.jsx"

function App() {
  return (
    <>
      <Reactor />
      <LifeSupport />
      <Navigation />
      <Biometrics />
      <Terminal />
    </>
  )
}

render(<App />, document.getElementById("app"))
