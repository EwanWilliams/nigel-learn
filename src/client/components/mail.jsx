function formatGBP(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  return `${sign}£${abs.toLocaleString("en-GB", {
    maximumFractionDigits: 0,
  })}`;
}

export default function MailLetterCard({ mail, open, onToggle, onAction, isBudgetComplete }) {
  return (
    <div
      className={`mailPiece ${open ? "mailPieceOpen" : ""}`}
      onClick={!open ? onToggle : undefined}
    >
      {!open ? (
        <div className="envelopeShell">
          <div className="envelopeFlapTop" />

          <div className="envelopeFront">
            <div className="envelopeFrontLeft" />
            <div className="envelopeFrontRight" />
          </div>

          <div className="envelopeStamp">£</div>

          <div className="envelopeFooter" />
        </div>
      ) : (
        <div className="letterShell">
          <div className="letterHeader">
            <div>
              <div className="letterOrg">Nigel Learn</div>
              <div className="letterMeta">Financial Life Admin</div>
            </div>

            <div className="letterDate">{mail.date}</div>
          </div>

          <div className="letterDivider" />

          <div className="letterGreeting">Dear Student,</div>

          <h3 className="letterSubject">{mail.subject}</h3>

          <p className="letterBody">{mail.message}</p>

          <div className="letterCostBox">
            <span className="letterCostLabel">Amount due</span>
            <span className="letterCostValue">
              {formatGBP(mail.amount)}
            </span>
          </div>

          <div className="letterActions">
            <button
  disabled={!isBudgetComplete}
  onClick={(e) => {
    e.stopPropagation();
    onAction(mail.id, mail.amount);
  }}
>
  Pay £{mail.amount}
</button>
          </div>
        </div>
      )}
    </div>
  );
}