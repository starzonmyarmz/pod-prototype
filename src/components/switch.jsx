export function Switch({ value, checked, label = true, onChange }) {
  return (
    <div class="ctl-switch">
      <div class="led" data-lit={checked}></div>
      <div class="switch-housing">
        <input
          type="checkbox"
          id={`b_${value}`}
          checked={checked}
          onChange={onChange}
        />
        <label htmlFor={`b_${value}`} class="toggle-handle"></label>
      </div>
      {label && <div class="switch-label">{value}</div>}
    </div>
  )
}
