import Select from "react-select";

const customStyles = {
  control: (base, state) => ({
    ...base,
    background: "rgba(255, 255, 255, 0.08)",
    backdropFilter: "blur(6px)",
    border: state.isFocused
      ? "1px solid rgba(0, 255, 234, 0.5)"
      : "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow: "none",
    borderRadius: "6px",
    padding: "2px 4px",
    color: "#fff",
    cursor: "pointer",
  }),
  menu: (base) => ({
    ...base,
    background: "rgba(30, 30, 30, 0.95)",
    backdropFilter: "blur(6px)",
    borderRadius: "6px",
    overflow: "hidden",
    zIndex: 9999,
  }),
  singleValue: (base) => ({
    ...base,
    color: "#fff",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "rgba(0, 255, 234, 0.2)"
      : state.isFocused
      ? "rgba(255, 255, 255, 0.1)"
      : "transparent",
    color: "#fff",
    cursor: "pointer",
  }),
};

export default function GlassSelect({ options, value, onChange, placeholder }) {
  return (
    <Select
      options={options}
      value={options.find((o) => o.value === value)}
      onChange={(selected) => onChange(selected.value)}
      styles={customStyles}
      placeholder={placeholder}
      isSearchable={false}
    />
  );
}