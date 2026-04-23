import MailLetterCard from "./mail";

export default function PostPanel({
  mailItems,
  openMailId,
  onToggle,
  onAction,
  isBudgetComplete,
}) {
  return (
    <aside className="postPanel">
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
            open={openMailId === mail.id}
            onToggle={() => onToggle(mail.id)}
            onAction={onAction}
            isBudgetComplete={isBudgetComplete}
          />
        ))}
      </div>
    </aside>
  );
}