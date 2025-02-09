export default function PlayerSquare({ value, onClick, onMouseEnter }) {

  const displayValue = value?.split("-")[0] || null;
  const isPreview = value?.includes('-preview');
  const isInvalid = value?.includes('-invalid');

  return (
    <button
      className={`grid-square ${isPreview ? 'preview' : ''} ${isInvalid ? 'invalid' : ''}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
    >
      {displayValue}
    </button>
  );
}