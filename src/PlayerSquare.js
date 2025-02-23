export default function PlayerSquare({ value, onClick, onMouseEnter }) {
  let displayValue = '';
  let className = "grid-square";
  
  if (value?.includes('-preview')) {
    className += " preview";
    displayValue = value.split("-")[0];
  } else if (value?.includes('-invalid')) {
    className += " invalid";
    displayValue = value.split("-")[0];
  } else if (value === 'O') {
    displayValue = 'O';
  } else if (value?.startsWith('X-')) {
    displayValue = 'X';
  } else if (value?.startsWith('D-')) {
    displayValue = 'X';
    className += " destroyed-ship";
  } else {
    displayValue = value;
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
