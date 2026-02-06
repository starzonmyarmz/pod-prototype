import { useRef, useState, useEffect } from "preact/hooks"
import "../styles/knob.css"

export function Knob({ label, min, max, value, onChange }) {
  const knobRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startValue, setStartValue] = useState(0)

  // Calculate rotation angle from value (-150° to +150° range)
  const range = max - min
  const normalizedValue = (value - min) / range
  const rotation = normalizedValue * 300 - 150 // -150° to +150°

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setStartY(e.clientY)
    setStartValue(value)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return

    const deltaY = startY - e.clientY // Inverted: up increases, down decreases
    const sensitivity = 0.5 // Adjust sensitivity
    const deltaValue = (deltaY * sensitivity * range) / 100

    const newValue = Math.max(min, Math.min(max, startValue + deltaValue))
    onChange?.(Math.round(newValue))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleDoubleClick = () => {
    onChange?.(0)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove)
      window.addEventListener("mouseup", handleMouseUp)
      return () => {
        window.removeEventListener("mousemove", handleMouseMove)
        window.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, startY, startValue])

  return (
    <div className="ctl-knob">
      <label>{label}</label>
      <div
        ref={knobRef}
        className={`knob ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onDblClick={handleDoubleClick}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <svg viewBox="0 0 100 100" className="knob-svg">
          {/* Outer ring */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            opacity="0.3"
          />

          {/* Tick marks */}
          {[...Array(11)].map((_, i) => {
            const angle = (i * 30 - 150) * (Math.PI / 180)
            const x1 = 50 + Math.cos(angle) * 35
            const y1 = 50 + Math.sin(angle) * 35
            const x2 = 50 + Math.cos(angle) * 40
            const y2 = 50 + Math.sin(angle) * 40
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth="1.5"
                opacity="0.5"
              />
            )
          })}

          {/* Knob body */}
          <circle cx="50" cy="50" r="32" fill="currentColor" opacity="0.8" />

          {/* Indicator line */}
          <g transform={`rotate(${rotation} 50 50)`}>
            <line
              x1="50"
              y1="50"
              x2="50"
              y2="25"
              stroke="var(--accent-color, #a7ffb0)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Indicator dot */}
            <circle
              cx="50"
              cy="25"
              r="3"
              fill="var(--accent-color, #a7ffb0)"
            />
          </g>
        </svg>
      </div>
      <output>{value}</output>
    </div>
  )
}
