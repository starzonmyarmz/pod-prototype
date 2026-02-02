export function Range({ label, min, max, defaultValue, onChange }) {
  return (
    <div class="ctl-range">
      <label htmlFor={label}>{label}</label>
      <input
        type="range"
        id={label}
        min={min}
        max={max}
        defaultValue={defaultValue}
        onInput={({ target }) => {
          onChange?.(Number(target.value))
        }}
      />
      <output>{defaultValue}</output>
    </div>
  )
}
