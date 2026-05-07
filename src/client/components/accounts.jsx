function formatGBP(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  return `${sign}£${abs.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function AccountRow({ account, onSelect }) {
  return (
    <div
      className={`accountCard accent-${account.accent}`}
      onClick={() => onSelect(account)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(account);
      }}
    >
      <div className="accountLeft">
        <div className="accountIcon">{account.icon}</div>

        <div className="accountText">
          <div className="accountName">{account.name}</div>

          <div className="accountDesc">
  {account.id !== "current" ? (
    <>
      For simulation display only
      {account.type === "Card" && account.last4 && (
        <>
          {" "}• <span className="mono">•••• {account.last4}</span>
        </>
      )}
    </>
  ) : (
    account.desc
  )}
</div>
        </div>
      </div>

      <div className="accountRight">
        <div className={`accountAmount ${account.amount < 0 ? "neg" : ""}`}>
          {formatGBP(account.amount)}
        </div>

        <div className="accountMeta">
          <span className="tag">{account.type}</span>
          <span className="chev">›</span>
        </div>
      </div>
    </div>
  );
}