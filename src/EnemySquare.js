export default function EnemySquare({ value, onClick, onMouseEnter }) {

  const displayValue = value != "X" && value != "O" ? '' : value;
  return (
    <button
      className="grid-square"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
    {displayValue}
    </button>
  );
}