import PlayerSquare from "./PlayerSquare";

export default function PlayerBoard({
  squares,
  onSquareClick,
  onSquareMouseEnter,
  onBoardMouseLeave,
}) {

  // UI Helper function
  const renderSquare = (i) => {
    return (
      <PlayerSquare
        key={i}
        value={squares[i]}
        onClick={() => onSquareClick(i)}
        onMouseEnter={() => onSquareMouseEnter(i)}
      />
    );
  };

  return (
    <div
      className="board-grid"
      onMouseLeave={onBoardMouseLeave}
    >
      {Array(100)
        .fill(null)
        .map((_, i) => renderSquare(i))}
    </div>
  );
}
