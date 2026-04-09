import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import HomeScreen from "./home_screen";
import BudgetScreen from "./budget_screen";
import DetailScreen from "./detail_screen";
import PostPanel from "../components/post_panel";
import Payslip from "../components/payslip";

export default function StudyPage() {
  const [screen, setScreen] = useState("home");
  const [phonePage, setPhonePage] = useState("home");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openMailId, setOpenMailId] = useState(null);
  const [query, setQuery] = useState("");
  const [showPayslip, setShowPayslip] = useState(true);
  const [week, setWeek] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [spent, setSpent] = useState(0);
  const [initialBudget, setInitialBudget] = useState(null);
  const [budgetLocked, setBudgetLocked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showFinal, setShowFinal] = useState(false);

  const [grossIncome] = useState(
    () => Math.floor(Math.random() * (2000 - 1500 + 1)) + 1500
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
  ]);

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

  const leftToAllocate = Math.max(0, netIncome - totalAllocated - spent);
  const isBudgetComplete = budgetLocked;
  const moneyLeft = netIncome - spent;

  useEffect(() => {
    if (isBudgetComplete && !initialBudget) {
      setInitialBudget(budget);
    }
  }, [isBudgetComplete, budget, initialBudget]);

  useEffect(() => {
    if (netIncome > 0 && totalAllocated >= netIncome && !budgetLocked) {
      setBudgetLocked(true);
    }
  }, [totalAllocated, netIncome, budgetLocked]);

  const openDetail = (account) => {
    setSelectedAccount(account);
    setScreen("detail");
  };

  const goHome = () => {
    setSelectedAccount(null);
    setScreen("home");
  };

  const toggleMail = (mailId) => {
    if (!isBudgetComplete) return;
    setOpenMailId((current) => (current === mailId ? null : mailId));
  };

  const handleEvent = (mailId, amount) => {
    if (!selectedCategory) {
      alert("Select a category first");
      return;
    }

    let wasUpdated = false;

    setBudget((prev) => {
      const current = prev[selectedCategory];

      if (current < amount) {
        alert("Not enough in this category!");
        return prev;
      }

      wasUpdated = true;

      return {
        ...prev,
        [selectedCategory]: current - amount,
      };
    });

    if (!wasUpdated) return;

    const remainingMailCount = mailItems.length - 1;

    setSpent((prev) => prev + amount);
    setMailItems((prev) => prev.filter((mail) => mail.id !== mailId));
    setSelectedCategory(null);
    setOpenMailId(null);

    if (remainingMailCount === 0) {
      setTimeout(() => {
        setShowSummary(true);
      }, 300);
    }
  };

  const togglePhonePage = () => {
    setScreen("home");
    setPhonePage((current) => (current === "home" ? "budget" : "home"));
  };

  const acceptPayslip = (netPay) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === "current" ? { ...acc, amount: acc.amount + netPay } : acc
      )
    );

    setNetIncome(netPay);
    setShowPayslip(false);
  };

  const nextWeek = () => {
    setWeek((prev) => prev + 1);
    setSpent(0);
    setOpenMailId(null);

    setMailItems([
      {
        id: "mail-" + Date.now(),
        subject: "New weekly expense",
        message: "You have a new cost of £75.",
        amount: 75,
        date: "Today",
      },
    ]);
  };

  return (
    <div className="app-container">
      <div className="studyHeader">
  <div className="studyHeaderInner">
    <Link to="/" className="studyNavLink">Exit Simulation</Link>
  </div>
</div>

      {!started && (
        <div className="introOverlay">
          <div className="introCard">
            <h1>Welcome to Student Bank</h1>

            <p>
              You have just been paid. Your goal is to manage your money across
              4 weeks.
            </p>

            <ul>
              <li>Allocate your budget wisely</li>
              <li>Handle unexpected expenses</li>
              <li>Avoid running out of money</li>
            </ul>

            <button
              onClick={() => {
                setStarted(true);
                setShowPayslip(true);
              }}
            >
              Start Simulation
            </button>
          </div>
        </div>
      )}

      {started && showPayslip && (
        <Payslip income={grossIncome} onAccept={acceptPayslip} />
      )}

      {started && !showPayslip && (
        <div className="simulatorLayout">
          <div className="phone">
            <div className="screen">
              <div className="topbar">
                <div className="topbar-title">
                  <h2>Student Bank</h2>
                  <span className="topbar-sub">Prototype</span>
                </div>

                <div className="topbar-actions">
                  <button className="iconBtn" onClick={togglePhonePage}>
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
                  week={week}
                />
              )}

              {screen === "home" && phonePage === "budget" && (
                <BudgetScreen
                  netIncome={netIncome}
                  totalAllocated={totalAllocated}
                  moneyLeft={leftToAllocate}
                  budgetCategoryConfig={budgetCategoryConfig}
                  budget={budget}
                  changeBudget={changeBudget}
                  selectedCategory={selectedCategory}
                  setSelectedCategory={setSelectedCategory}
                />
              )}

              {screen === "detail" && selectedAccount && (
                <DetailScreen account={selectedAccount} onBack={goHome} />
              )}
            </div>
          </div>

          {showSummary && (
            <div className="summaryOverlay">
              <div className="summaryCard">
                <h2>Week {week} Summary</h2>

                <p>Total spent: £{spent.toFixed(2)}</p>
                <p>Money remaining: £{moneyLeft.toFixed(2)}</p>

                <h4>Remaining budget:</h4>
                <ul>
                  {Object.entries(budget).map(([key, value]) => (
                    <li key={key}>
                      {key}: £{value.toFixed(2)}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => {
                    setHistory((prev) => [
                      ...prev,
                      {
                        week,
                        spent,
                        remaining: moneyLeft,
                        budget: { ...budget },
                      },
                    ]);

                    setShowSummary(false);

                    if (week === 4) {
                      setShowFinal(true);
                    } else {
                      nextWeek();
                    }
                  }}
                >
                  {week === 4
                    ? "View Final Results"
                    : `Continue to Week ${week + 1}`}
                </button>
              </div>
            </div>
          )}

          {showFinal && (
            <div className="summaryOverlay">
              <div className="summaryCard">
                <h2>Simulation Complete 🎉</h2>

                <h3>Weekly Breakdown</h3>

                {history.map((weekData) => (
                  <div key={weekData.week} style={{ marginBottom: "12px" }}>
                    <strong>Week {weekData.week}</strong>
                    <div>Spent: £{weekData.spent.toFixed(2)}</div>
                    <div>Remaining: £{weekData.remaining.toFixed(2)}</div>
                  </div>
                ))}

                <hr />

                <h3>Final Result</h3>

                {moneyLeft > 0 ? (
                  <p>You managed your money well ✅</p>
                ) : (
                  <p>You ran out of money ⚠️</p>
                )}

                <p>Final balance: £{moneyLeft.toFixed(2)}</p>
              </div>
            </div>
          )}

          {!showSummary && !showFinal && (
            <PostPanel
              mailItems={mailItems}
              openMailId={openMailId}
              onToggle={toggleMail}
              onAction={handleEvent}
              onNextWeek={nextWeek}
              week={week}
              isBudgetComplete={isBudgetComplete}
            />
          )}
        </div>
      )}
    </div>
  );
}