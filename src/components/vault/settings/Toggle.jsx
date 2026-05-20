// src/components/vault/settings/Toggle.jsx
export default function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative flex-none w-[46px] h-[27px] rounded-full transition-colors ${
        checked ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'
      }`}
    >
      <span
        className={`absolute top-[3px] h-[21px] w-[21px] rounded-full bg-white shadow transition-all duration-200 ${
          checked ? 'left-[22px]' : 'left-[3px]'
        }`}
      />
    </button>
  )
}
