import { computed } from "@preact/signals"
import { Knob } from "./knob.jsx"
import { DiscreteKnob } from "./discrete-knob.jsx"
import { Switch } from "./switch.jsx"
import {
  yaw,
  pitch,
  roll,
  stellar,
  artificial,
  unknown,
  magnitude,
  fgk,
  ob,
  anom,
  confidence,
  frameSelect,
  sensorStatus,
  driftStatus,
  routeCoherence,
  STELLAR_COUNT,
  ARTIFICIAL_COUNT,
  UNKNOWN_COUNT,
  TRANSFORM_SCALE,
  STAR_COLOR,
  ROUTE_OPACITY,
  DISTRACTOR_OPACITY,
  REACTOR_MAX,
  ECLIPTIC_SKEW_X,
  ECLIPTIC_SKEW_Y,
  SHIP_REL_WOBBLE_SPEED,
  SHIP_REL_WOBBLE_MAGNITUDE,
  BLUR_BASE,
  BLUR_TEMP_FACTOR,
  BLUR_BRIGHT_BASE,
  BLUR_BRIGHT_FACTOR,
  SATURATION_BASE,
  SATURATION_POWER_FACTOR,
} from "../state/navigation.js"
import { reactorTemp, reactorPower } from "../state/reactor.js"

import "../styles/navigation.css"

// Star generation - 1.5x viewport size to prevent gaps during rotation
function generateStars(count, objectType) {
  const stars = []
  const size = 1200
  const offset = size / 2
  const typeConfig = {
    stellar: {
      sizeRange: [0.5, 2.5],
      opacityRange: [0.4, 0.9],
      brightChance: 0.15,
    },
    artificial: {
      sizeRange: [1, 1.5],
      opacityRange: [0.6, 1],
      brightChance: 0.3,
    },
    unknown: {
      sizeRange: [0.3, 1.8],
      opacityRange: [0.2, 0.7],
      brightChance: 0.1,
    },
  }

  const config = typeConfig[objectType]

  for (let i = 0; i < count; i++) {
    const sizeMin = config.sizeRange[0]
    const sizeMax = config.sizeRange[1]
    const opacityMin = config.opacityRange[0]
    const opacityMax = config.opacityRange[1]

    const magnitudeValue = Math.random() * 99 + 1
    const spectralRandom = Math.random()
    let spectralType
    if (spectralRandom < 0.5) {
      spectralType = "fgk"
    } else if (spectralRandom < 0.75) {
      spectralType = "anom"
    } else {
      spectralType = "ob"
    }
    const confidenceRandom = Math.random()
    let confidenceLevel
    if (objectType === "stellar") {
      if (confidenceRandom < 0.6) confidenceLevel = "verified"
      else if (confidenceRandom < 0.9) confidenceLevel = "probable"
      else confidenceLevel = "raw"
    } else if (objectType === "artificial") {
      if (confidenceRandom < 0.8) confidenceLevel = "verified"
      else confidenceLevel = "probable"
    } else {
      if (confidenceRandom < 0.2) confidenceLevel = "verified"
      else if (confidenceRandom < 0.5) confidenceLevel = "probable"
      else confidenceLevel = "raw"
    }

    stars.push({
      x: Math.random() * size - offset,
      y: Math.random() * size - offset,
      size: Math.random() * (sizeMax - sizeMin) + sizeMin,
      opacity: Math.random() * (opacityMax - opacityMin) + opacityMin,
      type: Math.random() < config.brightChance ? "bright" : "normal",
      magnitude: magnitudeValue,
      spectralType,
      confidenceLevel,
      objectType,
    })
  }
  return stars
}

// Constellation patterns
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

const stellarStars = generateStars(STELLAR_COUNT, "stellar")
const artificialStars = generateStars(ARTIFICIAL_COUNT, "artificial")
const unknownStars = generateStars(UNKNOWN_COUNT, "unknown")

// SVG filters affected by reactor state
function SVGFilters() {
  const tempNormalized = (reactorTemp.value / REACTOR_MAX) * 100
  const baseBlur = BLUR_BASE + (tempNormalized / 100) * BLUR_TEMP_FACTOR
  const brightBlur =
    BLUR_BRIGHT_BASE + (tempNormalized / 100) * BLUR_BRIGHT_FACTOR

  const powerNormalized = (reactorPower.value / REACTOR_MAX) * 100
  const saturationBoost =
    SATURATION_BASE + (powerNormalized / 100) * SATURATION_POWER_FACTOR

  return (
    <defs>
      <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation={baseBlur} />
        <feColorMatrix
          type="matrix"
          values={`0 0 0 0 0.65
                  0 0 0 0 1
                  0 0 0 0 0.69
                  0 0 0 ${saturationBoost} 0`}
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
        <feGaussianBlur in="SourceGraphic" stdDeviation={brightBlur} />
        <feColorMatrix
          type="matrix"
          values={`0 0 0 0 0.65
                  0 0 0 0 1
                  0 0 0 0 0.69
                  0 0 0 ${1.2 * saturationBoost} 0`}
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
      stroke-width="1"
      stroke-opacity={opacity}
      stroke-dasharray="4 4"
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

function Grid() {
  const gridSpacing = 50
  const gridLines = []

  // Vertical lines
  for (let x = -400; x <= 400; x += gridSpacing) {
    gridLines.push(
      <line
        key={`v-${x}`}
        x1={x}
        y1={-400}
        x2={x}
        y2={400}
        stroke={STAR_COLOR}
        stroke-width="0.5"
        stroke-opacity="0.25"
      />
    )
  }

  // Horizontal lines
  for (let y = -400; y <= 400; y += gridSpacing) {
    gridLines.push(
      <line
        key={`h-${y}`}
        x1={-400}
        y1={y}
        x2={400}
        y2={y}
        stroke={STAR_COLOR}
        stroke-width="0.5"
        stroke-opacity="0.25"
      />
    )
  }

  // Center crosshair
  return (
    <g className="grid-overlay">
      {gridLines}
      {/* Center lines */}
      <line
        x1={0}
        y1={-400}
        x2={0}
        y2={400}
        stroke={STAR_COLOR}
        stroke-width="1"
        stroke-opacity="0.3"
      />
      <line
        x1={-400}
        y1={0}
        x2={400}
        y2={0}
        stroke={STAR_COLOR}
        stroke-width="1"
        stroke-opacity="0.3"
      />
    </g>
  )
}

// Frame transformations
function getFrameTransform(frame) {
  switch (frame) {
    case "ship-rel":
      const wobble =
        Math.sin(Date.now() / SHIP_REL_WOBBLE_SPEED) * SHIP_REL_WOBBLE_MAGNITUDE
      return `rotate(${wobble} 0 0)`
    case "eliptic":
      return `skewX(${ECLIPTIC_SKEW_X}) skewY(${ECLIPTIC_SKEW_Y})`
    case "galactic":
    default:
      return ""
  }
}

// Star filtering
function getVisibleStars() {
  const layers = []
  if (stellar.value) layers.push(stellarStars)
  if (artificial.value) layers.push(artificialStars)
  if (unknown.value) layers.push(unknownStars)
  return layers.flat()
}

function passesSpectralFilter(star) {
  const spectralFilters = {
    fgk: fgk.value,
    ob: ob.value,
    anom: anom.value,
  }
  return spectralFilters[star.spectralType] !== false
}

function passesConfidenceFilter(star) {
  if (confidence.value === "raw") return true
  if (confidence.value === "probable") return star.confidenceLevel !== "raw"
  if (confidence.value === "verified")
    return star.confidenceLevel === "verified"
  return true
}

function filterStars(stars) {
  return stars.filter((star) => {
    if (star.magnitude > magnitude.value) return false
    if (!passesSpectralFilter(star)) return false
    if (!passesConfidenceFilter(star)) return false
    return true
  })
}

const filteredStars = computed(() => {
  const visibleStars = getVisibleStars()
  return filterStars(visibleStars)
})

// Components
function StarField({ active }) {
  const yawAngle = yaw.value
  const pitchSkew = pitch.value * TRANSFORM_SCALE
  const rollSkew = roll.value * TRANSFORM_SCALE
  const frameTransform = getFrameTransform(frameSelect.value)

  const transform = `
    rotate(${yawAngle} 0 0)
    skewY(${pitchSkew})
    skewX(${rollSkew})
    ${frameTransform}
  `

  return (
    <svg viewBox="-400 -400 800 800" className={`star-plotter ${active ? "" : "inactive"}`}>
      <SVGFilters />

      <rect
        x="-400"
        y="-400"
        width="800"
        height="800"
        fill="#000"
        fillOpacity="0.9"
      />

      <Grid />

      <g transform={transform}>
        {active && constellations.map((constellation, idx) => (
          <Constellation
            key={`constellation-${idx}`}
            constellation={constellation}
            index={idx}
          />
        ))}

        {active && filteredStars.value.map((star, i) => (
          <circle
            key={`star-${star.objectType}-${i}`}
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

function StatusItem({ label, value, active }) {
  return (
    <div className="status-item">
      <span className="status-label">{label}:</span>
      <span className={`status-value ${active ? "" : "inactive"}`}>
        {active ? value : "---"}
      </span>
    </div>
  )
}

function NavStatus({ active }) {
  return (
    <div className="nav-status">
      <StatusItem label="FRAME" value={frameSelect.value.toUpperCase()} active={active} />
      <StatusItem label="SENSOR" value={sensorStatus.value} active={active} />
      <StatusItem label="ROUTE" value={routeCoherence.value} active={active} />
      <StatusItem label="DRIFT" value={driftStatus.value} active={active} />
      <StatusItem label="CORE POWER" value={reactorPower.value} active={active} />
      <StatusItem label="CORE TEMP" value={`${reactorTemp.value}°`} active={active} />
    </div>
  )
}

function ObjectTypeFilters({ active }) {
  return (
    <fieldset className="ctl-group">
      <legend>Object type</legend>
      <div class="flow fill">
        <Switch
          value="stlr"
          checked={stellar.value}
          onChange={(e) => (stellar.value = e.target.checked)}
          disabled={!active}
        />
        <Switch
          value="artf"
          checked={artificial.value}
          onChange={(e) => (artificial.value = e.target.checked)}
          disabled={!active}
        />
        <Switch
          value="unkn"
          checked={unknown.value}
          onChange={(e) => (unknown.value = e.target.checked)}
          disabled={!active}
        />
      </div>
    </fieldset>
  )
}

function MagnitudeFilter({ active }) {
  return (
    <fieldset className="ctl-group">
      <legend>Magnitude</legend>
      <Knob
        label=""
        min={1}
        max={100}
        value={magnitude.value}
        onChange={(v) => (magnitude.value = v)}
        disabled={!active}
      />
    </fieldset>
  )
}

function SpectralFilters({ active }) {
  return (
    <fieldset className="ctl-group">
      <legend>Spectral</legend>
      <div class="flow fill">
        <Switch
          value="fgk"
          checked={fgk.value}
          onChange={(e) => (fgk.value = e.target.checked)}
          disabled={!active}
        />
        <Switch
          value="ob"
          checked={ob.value}
          onChange={(e) => (ob.value = e.target.checked)}
          disabled={!active}
        />
        <Switch
          value="anom"
          checked={anom.value}
          onChange={(e) => (anom.value = e.target.checked)}
          disabled={!active}
        />
      </div>
    </fieldset>
  )
}

function ConfidenceFilters({ active }) {
  const confidenceMap = {
    raw: "raw",
    prob: "probable",
    vrfd: "verified",
  }
  const reverseMap = {
    raw: "raw",
    probable: "prob",
    verified: "vrfd",
  }
  return (
    <fieldset className="ctl-group">
      <legend>Confidence</legend>
      <DiscreteKnob
        label=""
        options={["raw", "prob", "vrfd"]}
        value={reverseMap[confidence.value]}
        onChange={(v) => (confidence.value = confidenceMap[v])}
        disabled={!active}
      />
    </fieldset>
  )
}

function FrameSelectionFilters({ active }) {
  const frameMap = {
    ship: "ship-rel",
    glct: "galactic",
    elpt: "eliptic",
  }
  const reverseMap = {
    "ship-rel": "ship",
    galactic: "glct",
    eliptic: "elpt",
  }
  return (
    <fieldset className="ctl-group">
      <legend>Frame select</legend>
      <DiscreteKnob
        label=""
        options={["ship", "glct", "elpt"]}
        value={reverseMap[frameSelect.value]}
        onChange={(v) => (frameSelect.value = frameMap[v])}
        disabled={!active}
      />
    </fieldset>
  )
}

function OrientationControls({ active }) {
  return (
    <fieldset className="ctl-group">
      <legend>Orientation</legend>
      <div className="knob-group">
        <Knob
          label="yaw"
          min={-180}
          max={180}
          value={yaw.value}
          onChange={(v) => (yaw.value = v)}
          disabled={!active}
        />
        <Knob
          label="pitch"
          min={-45}
          max={45}
          value={pitch.value}
          onChange={(v) => (pitch.value = v)}
          disabled={!active}
        />
        <Knob
          label="roll"
          min={-45}
          max={45}
          value={roll.value}
          onChange={(v) => (roll.value = v)}
          disabled={!active}
        />
      </div>
    </fieldset>
  )
}

function NavFilters({ active }) {
  return (
    <section id="nav-filters" class="stack g3">
      <div className="flow fill g3">
        <ObjectTypeFilters active={active} />
        <SpectralFilters active={active} />
      </div>
      <div class="flow g3">
        <MagnitudeFilter active={active} />
        <ConfidenceFilters active={active} />
        <FrameSelectionFilters active={active} />
      </div>
      <OrientationControls active={active} />
      <button id="nav-confirm" className="btn-confirm" disabled={!active}>
        CONFIRM
      </button>
    </section>
  )
}

function NavPlotter({ active }) {
  return (
    <>
      <section id="nav-plotter">
        <StarField active={active} />
      </section>
      <section id="nav-readout">
        <NavStatus active={active} />
      </section>
    </>
  )
}

export function Navigation({ active = true }) {
  return (
    <main id="nav" class={active ? "" : "inactive"}>
      <NavFilters active={active} />
      <NavPlotter active={active} />
    </main>
  )
}
