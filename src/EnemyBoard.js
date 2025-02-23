import EnemySquare from "./EnemySquare";

export default function EnemyBoard({ squares, onSquareClick, cheatMode }) {
  const renderSquare = (i) => {
    return (
      <EnemySquare
        key={i}
        value={squares[i]}
        onClick={() => onSquareClick(i)}
        cheatMode={cheatMode}
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
