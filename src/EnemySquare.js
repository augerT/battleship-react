export default function EnemySquare({ value, onClick, onMouseEnter }) {
  return (
    <button
      className="grid-square"
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {value}
    </button>
  );
}