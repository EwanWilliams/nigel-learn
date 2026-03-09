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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(account);
      }}
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

function MailRow({ mail, onSelect }) {
  return (
    <div
      className={`mailCard ${mail.read ? "" : "mailUnread"}`}
      onClick={() => onSelect(mail)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(mail);
      }}
    >
      <div className="mailTop">
        <div className="mailSender">
          <span className="mailDot" />
          Nigel Learn
        </div>
        <div className="mailDate">{mail.date}</div>
      </div>

      <div className="mailSubject">{mail.subject}</div>
      <div className="mailPreview">{mail.preview}</div>

      <div className="mailMetaRow">
        <span className="tag">Expense</span>
        <span className="tag mailAmount">{formatGBP(mail.amount)}</span>
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

      <div className="noteCard">
        <div className="noteTitle">Next step</div>
        <div className="noteText">
          Later, Current Account can contain pots like Rent, Travel, Food and Fun.
        </div>
      </div>
    </div>
  );
}

function MailScreen({ mailItems, onSelect }) {
  return (
    <div className="mailPanelBody">
      <div className="sectionHeader">
        <h3>Inbox</h3>
        <span className="mutedSmall">{mailItems.length} messages</span>
      </div>

      <div className="mailList">
        {mailItems.map((mail) => (
          <MailRow key={mail.id} mail={mail} onSelect={onSelect} />
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

function MailDetailScreen({ mail, onBack }) {
  return (
    <div className="mailPanelBody">
      <button className="backBtn" onClick={onBack} aria-label="Back to inbox">
        ← Back
      </button>

      <div className="detailCard">
        <div className="mailDetailHeader">
          <div className="mailDetailSender">Nigel Learn</div>
          <div className="mailDetailDate">{mail.date}</div>
        </div>

        <div className="mailDetailSubject">{mail.subject}</div>

        <div className="detailTags">
          <span className="tag">Unexpected cost</span>
          <span className="tag mailAmount">{formatGBP(mail.amount)}</span>
        </div>

        <div className="mailDetailBody">{mail.message}</div>

        <div className="detailActions">
          <button className="btn primary" disabled>
            Adjust budget
          </button>
          <button className="btn" disabled>
            Mark as handled
          </button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("home");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [selectedMail, setSelectedMail] = useState(null);
  const [query, setQuery] = useState("");
  const [mailOpen, setMailOpen] = useState(false);

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

  const mailItems = useMemo(
    () => [
      {
        id: "mail-1",
        subject: "Bike repair needed",
        preview: "Your bike chain snapped and needs repairing this week.",
        message:
          "Your bike chain snapped on the way home. The repair shop has quoted £60 and payment is needed this week. You may need to adjust your budget to cover this unexpected travel expense.",
        amount: 60,
        date: "Today",
        read: false,
      },
      {
        id: "mail-2",
        subject: "Rent contribution increased",
        preview: "Household bills have gone up this month.",
        message:
          "Your household bills have increased this month, so your rent or board contribution needs to increase by £120. Review your budget and decide which areas you may need to reduce.",
        amount: 120,
        date: "Yesterday",
        read: true,
      },
      {
        id: "mail-3",
        subject: "Phone screen cracked",
        preview: "A repair is needed to keep using your phone safely.",
        message:
          "You dropped your phone and cracked the screen. The repair will cost £90. Think carefully about whether to use savings, reduce fun spending, or cut subscriptions.",
        amount: 90,
        date: "Mon",
        read: true,
      },
    ],
    []
  );

  const openDetail = (account) => {
    setSelectedAccount(account);
    setScreen("detail");
  };

  const openMail = (mail) => {
    setSelectedMail(mail);
  };

  const goHome = () => {
    setSelectedAccount(null);
    setScreen("home");
  };

  const toggleMailPanel = () => {
    setMailOpen((prev) => {
      const next = !prev;
      if (!next) {
        setSelectedMail(null);
      }
      return next;
    });
  };

  const closeMailPanel = () => {
    setMailOpen(false);
    setSelectedMail(null);
  };

  return (
    <div className="app-container">
      <div className={`simulatorLayout ${mailOpen ? "mailVisible" : ""}`}>
        <div className="phone">
          <div className="screen">
            <div className="topbar">
              <div className="topbar-title">
                <h2>Student Bank</h2>
                <span className="topbar-sub">Prototype</span>
              </div>

              <div className="topbar-actions">
                <button
                  className={`iconBtn ${mailOpen ? "activeIconBtn" : ""}`}
                  aria-label="Inbox"
                  title="Inbox"
                  onClick={toggleMailPanel}
                >
                  ✉️
                </button>
                <button
                  className="iconBtn"
                  aria-label="Home"
                  title="Home"
                  onClick={goHome}
                >
                  ⌂
                </button>
              </div>
            </div>

            {screen === "home" && (
              <HomeScreen
                accounts={accounts}
                query={query}
                setQuery={setQuery}
                onSelect={openDetail}
              />
            )}

            {screen === "detail" && selectedAccount && (
              <DetailScreen account={selectedAccount} onBack={goHome} />
            )}
          </div>
        </div>

        {mailOpen && (
          <aside className="mailPanel">
            <div className="mailPanelHeader">
              <div>
                <div className="mailPanelTitle">Inbox</div>
                <div className="mailPanelSub">Budget alerts and messages</div>
              </div>

              <button
                className="iconBtn"
                aria-label="Close inbox"
                title="Close inbox"
                onClick={closeMailPanel}
              >
                ✕
              </button>
            </div>

            {selectedMail ? (
              <MailDetailScreen
                mail={selectedMail}
                onBack={() => setSelectedMail(null)}
              />
            ) : (
              <MailScreen mailItems={mailItems} onSelect={openMail} />
            )}
          </aside>
        )}
      </div>
    </div>
  );
}