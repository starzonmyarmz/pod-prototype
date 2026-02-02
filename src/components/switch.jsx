export function Switch({ value, checked, label = true, onChange }) {
  return (
    <div class="ctl-switch">
      <input
        type="checkbox"
        id={`b_${value}`}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={`b_${value}`}>{label ? value : ""}</label>
    </div>
  )
}
