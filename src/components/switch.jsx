export function Switch({ value, checked, label = true, onChange, disabled = false }) {
  return (
    <div class="ctl-switch">
      <div class="led" data-lit={checked && !disabled} data-disabled={disabled}></div>
      <div class="switch-housing">
        <input
          type="checkbox"
          id={`b_${value}`}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <label htmlFor={`b_${value}`} class="toggle-handle"></label>
      </div>
      {label && <div class="switch-label">{value}</div>}
    </div>
  )
}
