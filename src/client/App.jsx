import { useMemo, useState } from "react";
import "./app.css";

function formatGBP(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  return `${sign}£${abs.toLocaleString("en-GB", {
    maximumFractionDigits: 0,
  })}`;
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

function MailLetterCard({ mail, open, onToggle }) {
  return (
    <button
      type="button"
      className={`mailPiece ${open ? "mailPieceOpen" : ""}`}
      onClick={onToggle}
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
            <span className="letterCostValue">{formatGBP(mail.amount)}</span>
          </div>

          <div className="letterActions">
            <button className="btn primary" disabled>
              Pay {formatGBP(mail.amount)}
            </button>
          </div>
        </div>
      )}
    </button>
  );
}

function HomeScreen({ accounts, query, setQuery, onSelect, moneyLeft }) {
  const filtered = useMemo(
    () => accounts.filter((account) => matchesQuery(account, query.trim())),
    [accounts, query]
  );

  return (
    <div className="phoneContent">
      <div className="quickRow">
        <div className="chip">Month: March</div>
        <div className="chip chipWarn">
          Left to allocate: {formatGBP(moneyLeft)}
        </div>
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

function BudgetScreen({
  netIncome,
  totalAllocated,
  moneyLeft,
  budgetCategoryConfig,
  budget,
}) {
  return (
    <div className="phoneContent">
      <div className="quickRow">
        <div className="chip">Take-home pay: {formatGBP(netIncome)}</div>
        <div className="chip chipWarn">Remaining: {formatGBP(moneyLeft)}</div>
      </div>

      <div className="noteCard">
        <div className="noteTitle">Monthly budget</div>
        <div className="noteText">Take-home pay: {formatGBP(netIncome)}</div>
        <div className="noteText">
          Total allocated: {formatGBP(totalAllocated)}
        </div>
        <div className="noteText">Left to allocate: {formatGBP(moneyLeft)}</div>
      </div>

      <div className="sectionHeader">
        <h3>Budget categories</h3>
        <span className="mutedSmall">Current plan</span>
      </div>

      <div className="noteCard">
        {budgetCategoryConfig.map((category) => (
          <div key={category.id} className="budgetRow">
            <span>{category.label}</span>
            <span className="budgetAmount">
              {formatGBP(budget[category.id])}
            </span>
          </div>
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

function PostPanel({ mailItems, openMailId, onToggle }) {
  return (
    <aside className="postPanel">
      <div className="postPanelHeader">
        <div>
          <div className="postPanelTitle">Today’s Post</div>
          <div className="postPanelSub">Letters delivered to your address</div>
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

export default function App() {
  const [screen, setScreen] = useState("home");
  const [phonePage, setPhonePage] = useState("home");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openMailId, setOpenMailId] = useState(null);
  const [query, setQuery] = useState("");

  const netIncome = 1270;

  const [budget] = useState({
    rent: 350,
    travel: 120,
    food: 180,
    phone: 25,
    subscriptions: 20,
    savings: 150,
    fun: 205,
  });

  const budgetCategoryConfig = [
    { id: "rent", label: "Rent / Board" },
    { id: "travel", label: "Travel" },
    { id: "food", label: "Food" },
    { id: "phone", label: "Phone" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "savings", label: "Savings" },
    { id: "fun", label: "Fun" },
  ];

  const totalAllocated = Object.values(budget).reduce(
    (sum, value) => sum + value,
    0
  );

  const moneyLeft = netIncome - totalAllocated;

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
        message:
          "Your bike chain snapped on the way home. The repair shop has quoted £60 and payment is needed this week. You may need to adjust your budget to cover this unexpected travel expense.",
        amount: 60,
        date: "Today",
      },
      {
        id: "mail-2",
        subject: "Rent contribution increased",
        message:
          "Your household bills have increased this month, so your rent or board contribution needs to increase by £120. Review your budget and decide which areas you may need to reduce.",
        amount: 120,
        date: "Yesterday",
      },
      {
        id: "mail-3",
        subject: "Phone screen cracked",
        message:
          "You dropped your phone and cracked the screen. The repair will cost £90. Think carefully about whether to use savings, reduce fun spending, or cut subscriptions.",
        amount: 90,
        date: "Mon",
      },
    ],
    []
  );

  const openDetail = (account) => {
    setSelectedAccount(account);
    setScreen("detail");
  };

  const goHome = () => {
    setSelectedAccount(null);
    setScreen("home");
  };

  const toggleMail = (mailId) => {
    setOpenMailId((current) => (current === mailId ? null : mailId));
  };

  const togglePhonePage = () => {
    setScreen("home");
    setPhonePage((current) => (current === "home" ? "budget" : "home"));
  };

  return (
    <div className="app-container">
      <div className="simulatorLayout">
        <div className="phone">
          <div className="screen">
            <div className="topbar">
              <div className="topbar-title">
                <h2>Student Bank</h2>
                <span className="topbar-sub">Prototype</span>
              </div>

              <div className="topbar-actions">
                <button
                  className="iconBtn"
                  aria-label="Budget"
                  title="Budget"
                  onClick={togglePhonePage}
                >
                  {phonePage === "home" ? "£" : "⌂"}
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

            {screen === "home" && phonePage === "home" && (
              <HomeScreen
                accounts={accounts}
                query={query}
                setQuery={setQuery}
                onSelect={openDetail}
                moneyLeft={moneyLeft}
              />
            )}

            {screen === "home" && phonePage === "budget" && (
              <BudgetScreen
                netIncome={netIncome}
                totalAllocated={totalAllocated}
                moneyLeft={moneyLeft}
                budgetCategoryConfig={budgetCategoryConfig}
                budget={budget}
              />
            )}

            {screen === "detail" && selectedAccount && (
              <DetailScreen account={selectedAccount} onBack={goHome} />
            )}
          </div>
        </div>

        <PostPanel
          mailItems={mailItems}
          openMailId={openMailId}
          onToggle={toggleMail}
        />
      </div>
    </div>
  );
}