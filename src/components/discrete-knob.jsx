import { useRef, useState, useEffect } from "preact/hooks"

export function DiscreteKnob({ label, options, value, onChange }) {
  const knobRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startIndex, setStartIndex] = useState(0)

  // Find current index
  const currentIndex = options.findIndex((opt) => opt === value)

  // Calculate rotation angle from index
  const numOptions = options.length
  const anglePerOption = 300 / (numOptions - 1) // Spread across -150° to +150° range
  const rotation = currentIndex * anglePerOption - 150

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setStartY(e.clientY)
    setStartIndex(currentIndex)
  }

  const handleDoubleClick = () => {
    onChange?.(options[0])
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e) => {
      const deltaY = startY - e.clientY // Inverted: up increases, down decreases
      const sensitivity = 0.3 // Lower sensitivity for discrete steps
      const stepChange = Math.round((deltaY * sensitivity) / 50) // ~50px per step

      const newIndex = Math.max(
        0,
        Math.min(numOptions - 1, startIndex + stepChange)
      )

      if (newIndex !== currentIndex) {
        onChange?.(options[newIndex])
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, startY, startIndex, numOptions, currentIndex, options, onChange])

  return (
    <div className="ctl-discrete-knob">
      <div
        ref={knobRef}
        className={`discrete-knob ${isDragging ? "dragging" : ""}`}
        onMouseDown={handleMouseDown}
        onDblClick={handleDoubleClick}
        style={{ cursor: isDragging ? "grabbing" : "grab" }}
      >
        <svg viewBox="0 0 100 100" className="discrete-knob-svg">
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

          {/* Tick marks at discrete positions */}
          {options.map((_, i) => {
            const angle = ((i * anglePerOption - 150) * Math.PI) / 180
            const x1 = 50 + Math.cos(angle) * 35
            const y1 = 50 + Math.sin(angle) * 35
            const x2 = 50 + Math.cos(angle) * 40
            const y2 = 50 + Math.sin(angle) * 40
            const isActive = i === currentIndex
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="currentColor"
                strokeWidth={isActive ? "2.5" : "1.5"}
                opacity={isActive ? "1" : "0.5"}
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
              stroke="var(--crt)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Indicator dot */}
            <circle cx="50" cy="25" r="3" fill="var(--crt)" />
          </g>
        </svg>
      </div>
      <output>{value}</output>
    </div>
  )
}
