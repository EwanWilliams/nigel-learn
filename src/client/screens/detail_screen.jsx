function formatGBP(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  return `${sign}£${abs.toLocaleString("en-GB", {
    maximumFractionDigits: 0,
  })}`;
}

export default function DetailScreen({ account, onBack }) {

  return (
    <div className="detail">

      <button className="backBtn" onClick={onBack}>
        ← Back
      </button>

      <div className={`detailCard accent-${account.accent}`}>

        <div className="detailTop">

          <div className="detailIcon">
            {account.icon}
          </div>

          <div>
            <div className="detailName">
              {account.name}
            </div>

            <div className="detailDesc">
              {account.desc}
            </div>
          </div>

        </div>

        <div className="detailAmount">
          {formatGBP(account.amount.toFixed(2))}
        </div>

      </div>

    </div>
  );
}