export function Choice({ value, name, checked = false, onChange }) {
  return (
    <div class="ctl-choice">
      <input
        type="radio"
        id={`b_${value}`}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
      />
      <label htmlFor={`b_${value}`}>{value}</label>
    </div>
  )
}
