import { Choice } from "./choice.jsx"
import { Range } from "./range.jsx"
import { Switch } from "./switch.jsx"
import {
  yaw,
  pitch,
  roll,
  stellar,
  artificial,
  unknown,
  fgk,
  ob,
  manom,
} from "../state/navigation.js"

import "../styles/navigation.css"

// Generate star field with positions and properties
function generateStars(count) {
  const stars = []
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * 800 - 400,
      y: Math.random() * 600 - 300,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.6 + 0.4,
      type: Math.random() > 0.8 ? "bright" : "normal",
    })
  }
  return stars
}

// Constellation patterns (navigation routes and distractors)
const constellations = [
  {
    name: "primary-route",
    points: [
      { x: -150, y: -80 },
      { x: -50, y: -140 },
      { x: 80, y: -40 },
      { x: 20, y: 100 },
      { x: -100, y: 70 },
    ],
    isPrimary: true,
  },
  {
    name: "secondary-route",
    points: [
      { x: -50, y: -140 },
      { x: 140, y: -160 },
      { x: 220, y: -40 },
    ],
    isPrimary: true,
  },
  {
    name: "tertiary-route",
    points: [
      { x: 20, y: 100 },
      { x: 220, y: 140 },
      { x: 300, y: 40 },
    ],
    isPrimary: true,
  },
  {
    name: "distractor-1",
    points: [
      { x: -240, y: 140 },
      { x: -80, y: 220 },
      { x: 80, y: 180 },
      { x: 180, y: 260 },
    ],
    isPrimary: false,
  },
  {
    name: "distractor-2",
    points: [
      { x: -220, y: -220 },
      { x: -60, y: -260 },
      { x: 100, y: -220 },
      { x: 220, y: -260 },
    ],
    isPrimary: false,
  },
]

const STAR_COUNT = 180
const TRANSFORM_SCALE = 0.5
const STAR_COLOR = "#a7ffb0"
const ROUTE_OPACITY = 0.5
const DISTRACTOR_OPACITY = 0.2

const stars = generateStars(STAR_COUNT)

function SVGFilters() {
  return (
    <defs>
      <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.65
                  0 0 0 0 1
                  0 0 0 0 0.69
                  0 0 0 1 0"
        />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>

      <filter
        id="star-glow-bright"
        x="-100%"
        y="-100%"
        width="300%"
        height="300%"
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
        <feColorMatrix
          type="matrix"
          values="0 0 0 0 0.65
                  0 0 0 0 1
                  0 0 0 0 0.69
                  0 0 0 1.2 0"
        />
        <feMerge>
          <feMergeNode />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  )
}

function ConstellationLine({ point, nextPoint, opacity }) {
  return (
    <line
      x1={point.x}
      y1={point.y}
      x2={nextPoint.x}
      y2={nextPoint.y}
      stroke={STAR_COLOR}
      strokeWidth="1"
      strokeOpacity={opacity}
      strokeDasharray="4 4"
    />
  )
}

function ConstellationNode({ point, opacity }) {
  return (
    <circle
      cx={point.x}
      cy={point.y}
      r="2.5"
      fill={STAR_COLOR}
      fillOpacity={opacity}
      filter="url(#star-glow-bright)"
    />
  )
}

function Constellation({ constellation, index }) {
  const opacity = constellation.isPrimary ? ROUTE_OPACITY : DISTRACTOR_OPACITY
  const nodeOpacity = constellation.isPrimary ? 0.9 : 0.5

  return (
    <g key={`constellation-${index}`} className={constellation.name}>
      {constellation.points.map((point, i) => {
        const nextPoint = constellation.points[i + 1]
        return (
          <g key={`segment-${i}`}>
            {nextPoint && (
              <ConstellationLine
                point={point}
                nextPoint={nextPoint}
                opacity={opacity}
              />
            )}
            <ConstellationNode point={point} opacity={nodeOpacity} />
          </g>
        )
      })}
    </g>
  )
}

function StarField() {
  const yawAngle = yaw.value
  const pitchSkew = pitch.value * TRANSFORM_SCALE
  const rollSkew = roll.value * TRANSFORM_SCALE

  const transform = `
    rotate(${yawAngle} 0 0)
    skewY(${pitchSkew})
    skewX(${rollSkew})
  `

  return (
    <svg
      viewBox="-400 -300 800 600"
      className="star-plotter"
      style={{ width: '100%', height: '100%' }}
    >
      <SVGFilters />

      <rect
        x="-400"
        y="-400"
        width="800"
        height="800"
        fill="#000"
        fillOpacity="0.9"
      />

      <g transform={transform}>
        {constellations.map((constellation, idx) => (
          <Constellation
            key={`constellation-${idx}`}
            constellation={constellation}
            index={idx}
          />
        ))}

        {stars.map((star, i) => (
          <circle
            key={`star-${i}`}
            cx={star.x}
            cy={star.y}
            r={star.size}
            fill={STAR_COLOR}
            fillOpacity={star.opacity}
            filter={
              star.type === "bright"
                ? "url(#star-glow-bright)"
                : "url(#star-glow)"
            }
          />
        ))}
      </g>
    </svg>
  )
}

export function Navigation() {
  return (
    <main id="nav">
      <section id="nav-filters" class="stack g3">
        <fieldset className="ctl-group flow g3">
          <legend>Object type</legend>
          <Switch
            value="stellar"
            checked={stellar.value}
            onChange={(e) => (stellar.value = e.target.checked)}
          />
          <Switch
            value="artificial"
            checked={artificial.value}
            onChange={(e) => (artificial.value = e.target.checked)}
          />
          <Switch
            value="unknown"
            checked={unknown.value}
            onChange={(e) => (unknown.value = e.target.checked)}
          />
        </fieldset>

        <fieldset className="ctl-group flow g3">
          <legend>Magnitude</legend>
          <Choice value="bright" name="magnitude" />
          <Choice value="mid" name="magnitude" />
          <Choice value="dim" name="magnitude" checked />
        </fieldset>

        <fieldset className="ctl-group flow g3">
          <legend>Spectral</legend>
          <Switch
            value="f/g/k"
            checked={fgk.value}
            onChange={(e) => (fgk.value = e.target.checked)}
          />
          <Switch
            value="o/b"
            checked={ob.value}
            onChange={(e) => (ob.value = e.target.checked)}
          />
          <Switch
            value="m/anom"
            checked={manom.value}
            onChange={(e) => (manom.value = e.target.checked)}
          />
        </fieldset>

        <fieldset className="ctl-group flow g3">
          <legend>Confidence</legend>
          <Choice value="raw" name="confidence" />
          <Choice value="probable" name="confidence" checked />
          <Choice value="verified" name="confidence" />
        </fieldset>
      </section>

      <section id="nav-plotter">
        <StarField />
      </section>

      <section id="nav-routing" class="stack g3">
        <fieldset className="ctl-group flow g3">
          <legend>Frame select</legend>
          <Choice value="ship-rel" name="frame-select" />
          <Choice value="galactic" name="frame-select" checked />
          <Choice value="eliptic" name="frame-select" />
        </fieldset>

        <fieldset className="ctl-group stack g3">
          <legend>Orientation</legend>
          <Range
            label="yaw"
            min="-20"
            max="20"
            defaultValue={yaw.value}
            onChange={(v) => (yaw.value = v)}
          />
          <Range
            label="pitch"
            min="-20"
            max="20"
            defaultValue={pitch.value}
            onChange={(v) => (pitch.value = v)}
          />
          <Range
            label="roll"
            min="-20"
            max="20"
            defaultValue={roll.value}
            onChange={(v) => (roll.value = v)}
          />
        </fieldset>
      </section>
    </main>
  )
}
