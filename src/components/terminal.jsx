import { terminalLog } from "../state/game.js"
import { useEffect, useRef } from "preact/hooks"

const TYPE_CLASS = {
  ok:    "log-ok",
  warn:  "log-warn",
  error: "log-error",
  info:  "log-info",
}

function formatTs(ts) {
  const d = new Date(ts)
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`
}

export function Terminal() {
  const logs = terminalLog.value
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs.length])

  return (
    <section class="panel terminal-panel">
      <header class="panel-header">
        <span class="panel-title">SYSTEM TERMINAL</span>
        <span class="terminal-blink">▌</span>
      </header>
      <div class="terminal-body">
        {logs.length === 0 && (
          <div class="log-info terminal-boot">
            {">"} BOOT SEQUENCE COMPLETE — AWAITING OPERATOR INPUT
          </div>
        )}
        {logs.map((entry, i) => (
          <div key={i} class={`log-line ${TYPE_CLASS[entry.type] || "log-info"}`}>
            <span class="log-ts">[{formatTs(entry.ts)}]</span>
            <span class="log-msg">{entry.msg}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </section>
  )
}
