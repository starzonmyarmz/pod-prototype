export function Choice({ value, name, checked = false }) {
  return (
    <div class="ctl-choice">
      <input type="radio" id={`b_${value}`} name={name} checked={checked} />
      <label htmlFor={`b_${value}`}>{value}</label>
    </div>
  )
}
