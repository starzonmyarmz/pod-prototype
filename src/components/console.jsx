import { signal } from "@preact/signals"
import { useEffect, useRef } from "preact/hooks"
import { reactorPhase } from "../state/reactor.js"
import "../styles/console.css"

const consoleHistory = signal([])
const currentInput = signal("")

export function Console() {
  const inputRef = useRef(null)
  const outputRef = useRef(null)
  const phase = reactorPhase.value
  const active = phase >= 1

  useEffect(() => {
    // Auto-scroll to bottom when history updates
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight
    }
  }, [consoleHistory.value.length])

  const handleInput = (e) => {
    currentInput.value = e.target.value
  }

  const handleKeyDown = (e) => {
    if (!active) return

    if (e.key === "Enter" && currentInput.value.trim()) {
      const command = currentInput.value.trim().toLowerCase()

      // Add command to history
      consoleHistory.value = [
        ...consoleHistory.value,
        { type: "input", text: `> ${currentInput.value}` },
      ]

      // Process command
      if (command === "ping") {
        consoleHistory.value = [
          ...consoleHistory.value,
          { type: "output", text: "pong" },
        ]
      } else {
        consoleHistory.value = [
          ...consoleHistory.value,
          { type: "error", text: `Unknown command: ${command}` },
        ]
      }

      // Clear input
      currentInput.value = ""
    }
  }

  return (
    <main id="console" class={active ? "" : "inactive"}>
      <section id="console-display">
        <div id="console-output" ref={outputRef}>
          {!active ? (
            <></>
          ) : consoleHistory.value.length === 0 ? (
            <div class="console-line console-prompt">
              System ready. Type 'ping' to test.
            </div>
          ) : (
            consoleHistory.value.map((line, i) => (
              <div key={i} class={`console-line console-${line.type}`}>
                {line.text}
              </div>
            ))
          )}
        </div>
        {active && (
          <div id="console-input-line">
            <span class="console-cursor">&gt;</span>
            <input
              ref={inputRef}
              type="text"
              id="console-input"
              value={currentInput.value}
              onInput={handleInput}
              onKeyDown={handleKeyDown}
              autocomplete="off"
              spellcheck="false"
              disabled={!active}
            />
          </div>
        )}
      </section>
    </main>
  )
}
