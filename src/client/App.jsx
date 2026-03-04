import { useMemo, useState } from "react";
import "./app.css";

function formatGBP(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  return `${sign}£${abs.toLocaleString("en-GB", { maximumFractionDigits: 0 })}`;
}

function matchesQuery(account, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (
    account.name.toLowerCase().includes(q) ||
    account.desc.toLowerCase().includes(q) ||
    (account.last4 && account.last4.includes(q))
  );
}

function AccountRow({ account, onSelect }) {
  return (
    <div
      className={`accountCard accent-${account.accent}`}
      onClick={() => onSelect(account)}
      role="button"
      tabIndex={0}
    >
      <div className="accountLeft">
        <div className="accountIcon">{account.icon}</div>
        <div className="accountText">
          <div className="accountName">{account.name}</div>
          <div className="accountDesc">
            {account.type === "Card" && account.last4 ? (
              <>
                {account.desc} • <span className="mono">•••• {account.last4}</span>
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

function HomeScreen({ accounts, query, setQuery, onSelect }) {
  const filtered = useMemo(
    () => accounts.filter((a) => matchesQuery(a, query.trim())),
    [accounts, query]
  );

  return (
    <div className="phoneContent">
      <div className="quickRow">
        <div className="chip">Month: March</div>
        <div className="chip chipWarn">Left to allocate: £220</div>
      </div>

      <input
        className="search"
        placeholder="Search accounts (e.g. savings, 4821)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="sectionHeader">
        <h3>Your accounts</h3>
        <span className="mutedSmall">Tap to view</span>
      </div>

      <div className="account-list">
        {filtered.map((account) => (
          <AccountRow key={account.id} account={account} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function DetailScreen({ account, onBack }) {
  return (
    <div className="detail">
      <button className="backBtn" onClick={onBack} aria-label="Back">
        ← Back
      </button>

      <div className={`detailCard accent-${account.accent}`}>
        <div className="detailTop">
          <div className="detailIcon">{account.icon}</div>
          <div>
            <div className="detailName">{account.name}</div>
            <div className="detailDesc">
              {account.type === "Card" && account.last4 ? (
                <>
                  {account.desc} • <span className="mono">•••• {account.last4}</span>
                </>
              ) : (
                account.desc
              )}
            </div>
          </div>
        </div>

        <div className="detailAmount">{formatGBP(account.amount)}</div>

        <div className="detailTags">
          <span className="tag">{account.type}</span>
          <span className="tag">
            {account.type === "Card" ? "No features yet" : "No transactions yet"}
          </span>
        </div>

        <div className="detailActions">
          <button className="btn primary" disabled>
            Move money
          </button>
          <button className="btn" disabled>
            View activity
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selected, setSelected] = useState(null);
  const [query, setQuery] = useState("");

  const accounts = useMemo(
    () => [
      {
        id: "current",
        name: "Current Account",
        desc: "Main spending account",
        amount: 620,
        type: "Account",
        icon: "🏦",
        last4: null,
        accent: "blue",
      },
      {
        id: "savings",
        name: "Savings Account",
        desc: "Buffer & goals",
        amount: 150,
        type: "Account",
        icon: "💰",
        last4: null,
        accent: "green",
      },
      {
        id: "debit",
        name: "Debit Card",
        desc: "Linked to Current Account",
        amount: 0,
        type: "Card",
        icon: "💳",
        last4: "4821",
        accent: "purple",
      },
      {
        id: "credit",
        name: "Credit Card",
        desc: "Borrow now, pay later",
        amount: -80,
        type: "Card",
        icon: "🧾",
        last4: "1934",
        accent: "amber",
      },
    ],
    []
  );

  const goHome = () => {
    setScreen("home");
    setSelected(null);
  };

  const openDetail = (account) => {
    setSelected(account);
    setScreen("detail");
  };

  return (
    <div className="app-container">
      <div className="phone">
        <div className="screen">
          <div className="topbar">
            <div className="topbar-title">
              <h2>Student Bank</h2>
              <span className="topbar-sub">Prototype (static UI)</span>
            </div>
            <div className="topbar-actions">
              <button className="iconBtn" aria-label="Notifications" title="Notifications">
                🔔
              </button>
              <button className="iconBtn" aria-label="Settings" title="Settings">
                ⚙️
              </button>
            </div>
          </div>

          {screen === "home" && (
            <HomeScreen accounts={accounts} query={query} setQuery={setQuery} onSelect={openDetail} />
          )}

          {screen === "detail" && selected && (
            <DetailScreen account={selected} onBack={goHome} />
          )}
        </div>
      </div>
    </div>
  );
}