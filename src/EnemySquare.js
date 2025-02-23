export default function EnemySquare({ value, onClick, onMouseEnter, cheatMode }) {
  let displayValue = '';
  let className = "grid-square";
  
  if (value === 'O') {
    displayValue = 'O';
  } else if (value?.startsWith('X-')) {
    displayValue = 'X';
  } else if (value?.startsWith('D-')) {
    displayValue = 'X';
    className += " destroyed-ship";
  } else if (cheatMode && value) {
    // Show ship value in cheat mode
    displayValue = value;
    className += " cheat-mode-ship";
  }

  return (
    <button
      className={className}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
    {displayValue}
    </button>
  );
}
