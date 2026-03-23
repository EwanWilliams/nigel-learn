import { useMemo, useState } from "react";
import "./app.css";

import HomeScreen from "./screens/home_screen";
import BudgetScreen from "./screens/budget_screen";
import DetailScreen from "./screens/detail_screen";
import PostPanel from "./components/post_panel";
import Payslip from "./components/payslip";

export default function App() {

  const [screen, setScreen] = useState("home");
  const [phonePage, setPhonePage] = useState("home");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openMailId, setOpenMailId] = useState(null);
  const [query, setQuery] = useState("");
  const [showPayslip, setShowPayslip] = useState(true);
  const formatCurrency = (value) => `£${value.toFixed(2)}`;

 
  const [grossIncome] = useState(() =>
    Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500
  );

  const [netIncome, setNetIncome] = useState(0);

  
  const [budget, setBudget] = useState({
    rent: 0,
    travel: 0,
    food: 0,
    phone: 0,
    subscriptions: 0,
    savings: 0,
    fun: 0,
  });

  const changeBudget = (category, amount) => {
    setBudget((prev) => ({
      ...prev,
      [category]: Math.max(0, prev[category] + amount),
    }));
  };

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

  
  const [accounts, setAccounts] = useState([
    {
      id: "current",
      name: "Current Account",
      desc: "Main spending account",
      amount: 0,
      type: "Account",
      icon: "🏦",
      accent: "blue",
    },
    {
      id: "savings",
      name: "Savings Account",
      desc: "Buffer & goals",
      amount: 0,
      type: "Account",
      icon: "💰",
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
      amount: 0,
      type: "Card",
      icon: "🧾",
      last4: "1934",
      accent: "amber",
    },
  ]);

 
  const [mailItems, setMailItems] = useState([
    {
      id: "mail-1",
      subject: "Bike repair needed",
      message: "Your bike repair will cost £60.",
      amount: 60,
      date: "Today",
    },
    {
      id: "mail-2",
      subject: "Rent contribution increased",
      message: "Your rent has increased by £120.",
      amount: 120,
      date: "Yesterday",
    },
    {
      id: "mail-3",
      subject: "Phone screen cracked",
      message: "Phone repair will cost £90.",
      amount: 90,
      date: "Mon",
    },
  ], []);

  
  const openDetail = (account) => {
    setSelectedAccount(account);
    setScreen("detail");
  };

  const goHome = () => {
    setSelectedAccount(null);
    setScreen("home");
  };

  const toggleMail = (mailId) => {
    setOpenMailId((current) =>
      current === mailId ? null : mailId
    );
  };

  const handleEvent = (mailId, amount) => {
  setAccounts((prev) =>
    prev.map((acc) =>
      acc.id === "current"
        ? { ...acc, amount: acc.amount - amount }
        : acc
    )
  );

  setMailItems((prev) =>
    prev.filter((mail) => mail.id !== mailId)
  );
};

  const togglePhonePage = () => {
    setScreen("home");

    setPhonePage((current) =>
      current === "home" ? "budget" : "home"
    );
  };


  const acceptPayslip = (netPay) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === "current"
          ? { ...acc, amount: acc.amount + netPay }
          : acc
      )
    );

    setNetIncome(netPay);

    setShowPayslip(false);
  };

 

  return (
    <div className="app-container">

      {showPayslip && (
        <Payslip
          income={grossIncome}   
          onAccept={acceptPayslip}
        />
      )}

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
                  onClick={togglePhonePage}
                >
                  {phonePage === "home" ? "£" : "⌂"}
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
                changeBudget={changeBudget}
              />
            )}

            {screen === "detail" && selectedAccount && (
              <DetailScreen
                account={selectedAccount}
                onBack={goHome}
              />
            )}

          </div>

        </div>

        <PostPanel
          mailItems={mailItems}
          openMailId={openMailId}
          onToggle={toggleMail}
          onAction={handleEvent}
        />

      </div>

    </div>
  );
}