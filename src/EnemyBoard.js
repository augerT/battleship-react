import EnemySquare from "./EnemySquare";

export default function EnemyBoard({ squares, onSquareClick }) {
  const renderSquare = (i) => {
    return (
      <EnemySquare
        key={i}
        value={squares[i]}
        onClick={() => onSquareClick(i)}
      />
    );
  };

  return (
    <div className="board-grid">
      {Array(100)
        .fill(null)
        .map((_, i) => renderSquare(i))}
    </div>
  );
}
