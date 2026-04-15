import { useEffect, useState } from "react";

import HomeScreen from "../inners/home_screen";
import BudgetScreen from "../inners/budget_screen";
import DetailScreen from "../inners/detail_screen";
import PostPanel from "../components/post_panel";
import Payslip from "../components/payslip";
import { mapModuleToStudyData } from "../components/module_mapper";

const MOCK_MODULE = {
  title: "Student Bank",
  brief:
    "You have just been paid. Your goal is to manage your money across 4 weeks.",
  weekPool: [
    {
      dateStarting: new Date(),
      mailPool: [
        {
          label: "Bike repair",
          type: "expense",
          sender: "Nigel Learn",
          date: new Date(),
          subject: "Bike repair needed",
          body: "Your bike repair will cost £60.",
          amount: 60,
        },
        {
          label: "Rent change",
          type: "expense",
          sender: "Nigel Learn",
          date: new Date(),
          subject: "Rent contribution increased",
          body: "Your rent has increased by £120.",
          amount: 120,
        },
        {
          label: "Phone repair",
          type: "expense",
          sender: "Nigel Learn",
          date: new Date(),
          subject: "Phone screen cracked",
          body: "Phone repair will cost £90.",
          amount: 90,
        },
      ],
      incomePool: [
        {
          label: "Monthly pay",
          category: "paye",
          amount: 1800,
        },
      ],
      expensePool: [
        { label: "Rent", category: "rent", amount: 0 },
        { label: "Travel", category: "travel", amount: 0 },
        { label: "Food", category: "food", amount: 0 },
        { label: "Phone", category: "phone", amount: 0 },
        { label: "Subscriptions", category: "subscriptions", amount: 0 },
        { label: "Savings", category: "savings", amount: 0 },
        { label: "Fun", category: "fun", amount: 0 },
      ],
    },
    {
      dateStarting: new Date(),
      mailPool: [
        {
          label: "Weekly cost",
          type: "expense",
          sender: "Nigel Learn",
          date: new Date(),
          subject: "New weekly expense",
          body: "You have a new cost of £75.",
          amount: 75,
        },
      ],
      incomePool: [],
      expensePool: [],
    },
    {
      dateStarting: new Date(),
      mailPool: [
        {
          label: "Travel issue",
          type: "expense",
          sender: "Nigel Learn",
          date: new Date(),
          subject: "Travel disruption",
          body: "A replacement train ticket will cost £45.",
          amount: 45,
        },
      ],
      incomePool: [],
      expensePool: [],
    },
    {
      dateStarting: new Date(),
      mailPool: [
        {
          label: "Social plan",
          type: "expense",
          sender: "Nigel Learn",
          date: new Date(),
          subject: "Friends want to go out",
          body: "Joining the plan will cost £35.",
          amount: 35,
        },
      ],
      incomePool: [],
      expensePool: [],
    },
  ],
  quiz: [],
};

export default function StudyPage() {
  const [moduleData, setModuleData] = useState(null);
  const [loadingModule, setLoadingModule] = useState(true);
  const [moduleError, setModuleError] = useState("");

  const [screen, setScreen] = useState("home");
  const [phonePage, setPhonePage] = useState("home");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openMailId, setOpenMailId] = useState(null);
  const [query, setQuery] = useState("");
  const [showPayslip, setShowPayslip] = useState(true);
  const [week, setWeek] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [spent, setSpent] = useState(0);
  const [budgetLocked, setBudgetLocked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showFinal, setShowFinal] = useState(false);

  const [grossIncome, setGrossIncome] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [mailItems, setMailItems] = useState([]);
  const [budgetCategoryConfig, setBudgetCategoryConfig] = useState([]);

  const [budget, setBudget] = useState({
    rent: 0,
    travel: 0,
    food: 0,
    phone: 0,
    subscriptions: 0,
    savings: 0,
    fun: 0,
    other: 0,
  });

  useEffect(() => {
    async function loadModule() {
      try {
        setLoadingModule(true);
        setModuleError("");

        const USE_MOCK = true;

        if (USE_MOCK) {
          const mapped = mapModuleToStudyData(MOCK_MODULE);
          setModuleData(mapped);
          return;
        }

        const MODULE_ID = "REPLACE_ME";
        const res = await fetch(`/api/module/data/${MODULE_ID}`);

        if (!res.ok) {
          throw new Error(`Failed to load module (${res.status})`);
        }

        const rawModule = await res.json();
        const mapped = mapModuleToStudyData(rawModule);
        setModuleData(mapped);
      } catch (err) {
        console.error(err);
        setModuleError(err.message || "Failed to load module");
      } finally {
        setLoadingModule(false);
      }
    }

    loadModule();
  }, []);

  useEffect(() => {
    if (!moduleData) return;

    setGrossIncome(moduleData.grossIncome || 1800);
    setAccounts(moduleData.startingAccounts || []);
    setBudgetCategoryConfig(moduleData.budgetCategories || []);
    setMailItems(moduleData.weeks?.[0]?.mailItems || []);
  }, [moduleData]);

  useEffect(() => {
    if (!moduleData) return;

    const weekData = moduleData.weeks?.[week - 1];
    setMailItems(weekData?.mailItems || []);
    setOpenMailId(null);
  }, [moduleData, week]);

  useEffect(() => {
    if (netIncome > 0) {
      const totalAllocated = Object.values(budget).reduce(
        (sum, value) => sum + value,
        0
      );
      setBudgetLocked(totalAllocated >= netIncome);
    }
  }, [budget, netIncome]);

  const changeBudget = (category, amount) => {
    setBudget((prev) => ({
      ...prev,
      [category]: Math.max(0, (prev[category] || 0) + amount),
    }));
  };

  const totalAllocated = Object.values(budget).reduce(
    (sum, value) => sum + value,
    0
  );

  const leftToAllocate = Math.max(0, netIncome - totalAllocated - spent);
  const isBudgetComplete = budgetLocked;
  const moneyLeft = netIncome - spent;
  const totalWeeks = moduleData?.weeks?.length || 4;

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
      const current = prev[selectedCategory] || 0;

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
    const nextWeekNumber = week + 1;

    if (nextWeekNumber > totalWeeks) {
      setShowFinal(true);
      return;
    }

    setWeek(nextWeekNumber);
    setSpent(0);
    setShowSummary(false);
    setSelectedCategory(null);
  };

  if (loadingModule) {
    return (
      <div className="routePage">
        <div className="routeCard">
          <h1 className="routeSectionTitle">Loading module...</h1>
          <p className="routeSectionText">
            Preparing the study simulation.
          </p>
        </div>
      </div>
    );
  }

  if (moduleError) {
    return (
      <div className="routePage">
        <div className="routeCard">
          <h1 className="routeSectionTitle">Could not load module</h1>
          <p className="routeSectionText">{moduleError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {!started && (
        <div className="introOverlay">
          <div className="introCard">
            <h1>{moduleData?.title || "Welcome to Student Bank"}</h1>

            <p>
              {moduleData?.brief ||
                "You have just been paid. Your goal is to manage your money across 4 weeks."}
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
                  <h2>{moduleData?.title || "Student Bank"}</h2>
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

                    if (week === totalWeeks) {
                      setShowSummary(false);
                      setShowFinal(true);
                    } else {
                      nextWeek();
                    }
                  }}
                >
                  {week === totalWeeks
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