import MailLetterCard from "./mail";

export default function PostPanel({ mailItems, openMailId, onToggle }) {
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

      <div className="mailStack">
        {mailItems.map((mail) => (
          <MailLetterCard
            key={mail.id}
            mail={mail}
            open={openMailId === mail.id}
            onToggle={() => onToggle(mail.id)}
          />
        ))}
      </div>
    </aside>
  );
}