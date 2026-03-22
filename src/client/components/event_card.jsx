export default function EventCard({
  item,
  isOpen,
  onToggle,
  onAccept,
  onIgnore,
}) {
  return (
    <div className="mailPiece">

      <div onClick={onToggle}>
        <div className="envelopeShell">
          <div className="envelopeFlapTop" />
          <div className="envelopeFrontLeft" />
          <div className="envelopeFrontRight" />

          <div className="envelopeStamp">£</div>
        </div>
      </div>

      {isOpen && (
        <div className="letterShell">
          <h3>{item.subject}</h3>

          <p>Cost: £{item.amount}</p>

          <div className="letterActions">
            <button onClick={() => onAccept(item)}>
              Pay £{item.amount}
            </button>

            <button onClick={() => onIgnore(item)}>
              Ignore
            </button>
          </div>
        </div>
      )}
    </div>
  );
}