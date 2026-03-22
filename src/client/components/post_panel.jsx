import EventCard from "./event_card";

export default function PostPanel({
  mailItems,
  openMailId,
  onToggle,
  onAccept,
  onIgnore,
}) {
  return (
    <div className="postPanel">
      <h2>Post</h2>

      <div className="mailStack">
        {mailItems.map((item) => (
          <EventCard
            key={item.id}
            item={item}
            isOpen={openMailId === item.id}
            onToggle={() =>
              onToggle(openMailId === item.id ? null : item.id)
            }
            onAccept={onAccept}
            onIgnore={onIgnore}
          />
        ))}
      </div>
    </div>
  );
}