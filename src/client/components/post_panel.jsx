import MailLetterCard from "./mail";

export default function PostPanel({ mailItems, openMailId, onToggle, onAction, onNextWeek, week, isBudgetComplete }) {
  return (
    <aside className="postPanel">
      <div className="postPanelHeader">
        <div>
          <div className="postPanelTitle">Today’s Post</div>
          <div className="postPanelSub">
            Letters delivered to your address
          </div>
        </div>
      </div>

      {!isBudgetComplete && (
  <div className="budgetWarning">
    Please allocate your full budget before opening mail
  </div>
)}

      <div className="mailStack">
  {mailItems.map((mail) => (
    <MailLetterCard
      key={mail.id}
      mail={mail}
      open={openMailId === mail.id && isBudgetComplete}
      onToggle={() => isBudgetComplete && onToggle(mail.id)}
      onAction={onAction}
    />
  ))}
</div>
      {mailItems.length === 0 && (
  <div className="weekComplete">
    <p>You’ve completed the mail for this week!</p>

    <button onClick={onNextWeek}>
      Move to week {week + 1}
    </button>
  </div>
)}
    </aside>
  );
}