import { useMemo } from "react";
import AccountRow from "../components/accounts";

function matchesQuery(account, query) {
  if (!query) return true;

  const q = query.toLowerCase();

  return (
    account.name.toLowerCase().includes(q) ||
    account.desc.toLowerCase().includes(q) ||
    (account.last4 && account.last4.includes(q))
  );
}

function formatGBP(value) {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);

  return `${sign}£${abs.toLocaleString("en-GB", {
    maximumFractionDigits: 0,
  })}`;
}

export default function HomeScreen({
  accounts,
  query,
  setQuery,
  onSelect,
  moneyLeft
}) {

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
          <AccountRow
            key={account.id}
            account={account}
            onSelect={onSelect}
          />
        ))}
      </div>

    </div>
  );
}