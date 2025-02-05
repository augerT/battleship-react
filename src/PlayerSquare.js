export default function PlayerSquare({ value, onClick, onMouseEnter }) {

  const displayValue = value?.split("-")[0] || null;
  const isPreview = value?.endsWith('-preview');

  return (
    <button
      className={`grid-square ${isPreview ? 'preview' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {displayValue}
    </button>
  );
}