import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";

import HomeScreen from "../inners/home_screen";
import BudgetScreen from "../inners/budget_screen";
import DetailScreen from "../inners/detail_screen";
import PostPanel from "../components/post_panel";
import Payslip from "../components/payslip";
import { mapModuleToStudyData } from "../components/module_mapper";

// StudyPage controls the full student simulation flow.
// It loads module data from the backend, manages budgeting,
// handles mail expenses, and controls week progression.
export default function StudyPage() {
  const location = useLocation();

  // Classroom/module info is passed in from the join flow
  const classroomCode =
  location.state?.classroomCode || sessionStorage.getItem("classroomCode");

const studentCode =
  location.state?.studentCode || sessionStorage.getItem("studentCode");

const moduleId =
  location.state?.moduleId || sessionStorage.getItem("moduleId");

  // Backend module loading state
  const [moduleData, setModuleData] = useState(null);
  const [loadingModule, setLoadingModule] = useState(true);
  const [moduleError, setModuleError] = useState("");

  // Core simulation UI state
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

  // Simulation data derived from backend module
  const [grossIncome, setGrossIncome] = useState(0);
  const [netIncome, setNetIncome] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [mailItems, setMailItems] = useState([]);
  const [budgetCategoryConfig, setBudgetCategoryConfig] = useState([]);

  // Current student budget allocations
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

  // Fetch module data from backend using moduleId from classroom join flow
  useEffect(() => {
    async function loadModule() {
      if (!moduleId) return;

      try {
        setLoadingModule(true);
        setModuleError("");

        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/module/data/${moduleId}`
        );

        if (!res.ok) {
          throw new Error(`Failed to load module (${res.status})`);
        }

        const rawModule = await res.json();
        setModuleData(mapModuleToStudyData(rawModule));
      } catch (err) {
        console.error(err);
        setModuleError(err.message || "Failed to load module");
      } finally {
        setLoadingModule(false);
      }
    }

    loadModule();
  }, [moduleId]);

  // Initialise simulation state from mapped module data
  useEffect(() => {
    if (!moduleData) return;

    setGrossIncome(moduleData.grossIncome || 1800);
    setAccounts(moduleData.startingAccounts || []);
    setBudgetCategoryConfig(moduleData.budgetCategories || []);
    setMailItems(moduleData.weeks?.[0]?.mailItems || []);
  }, [moduleData]);

  // Update mail items whenever the active week changes
  useEffect(() => {
    if (!moduleData) return;

    const weekData = moduleData.weeks?.[week - 1];
    setMailItems(weekData?.mailItems || []);
    setOpenMailId(null);
  }, [moduleData, week]);

  // Locks the budget once the full income has been allocated.
  // Prevents the student from reallocating after spending begins.
  useEffect(() => {
    if (netIncome > 0 && !budgetLocked) {
      const totalAllocated = Object.values(budget).reduce(
        (sum, value) => sum + value,
        0
      );

      if (totalAllocated >= netIncome) {
        setBudgetLocked(true);
      }
    }
  }, [budget, netIncome, budgetLocked]);

  // Updates an individual budget category by a given amount
  const changeBudget = (category, amount) => {
    setBudget((prev) => ({
      ...prev,
      [category]: Math.max(0, (prev[category] || 0) + amount),
    }));
  };

  // Total amount currently allocated across all budget categories
  const totalAllocated = Object.values(budget).reduce(
    (sum, value) => sum + value,
    0
  );

  // Remaining money not yet allocated.
  // Subtracting spent ensures paid expenses are not incorrectly
  // treated as money available to reallocate.
  const leftToAllocate = Math.max(0, netIncome - totalAllocated - spent);

  const isBudgetComplete = budgetLocked;
  const moneyLeft = netIncome - spent;
  const totalWeeks = moduleData?.weeks?.length || 4;

  // Opens account detail screen
  const openDetail = (account) => {
    setSelectedAccount(account);
    setScreen("detail");
  };

  // Returns from account detail view to the home screen
  const goHome = () => {
    setSelectedAccount(null);
    setScreen("home");
  };

  // Opens/closes a mail item, but only once the budget is fully allocated
  const toggleMail = (mailId) => {
    if (!isBudgetComplete) return;
    setOpenMailId((current) => (current === mailId ? null : mailId));
  };

  // Handles paying a mail item (expense)
  // - deducts from the selected category
  // - increases total spent
  // - removes the mail item
  // - triggers summary when no mail remains for the week
  const handleEvent = (mailId, amount) => {
    if (!selectedCategory) {
      alert("Select a category first");
      return;
    }

    const currentAmount = budget[selectedCategory] || 0;

    if (currentAmount < amount) {
      alert("Not enough in this category!");
      return;
    }

    setBudget((prev) => ({
      ...prev,
      [selectedCategory]: (prev[selectedCategory] || 0) - amount,
    }));

    setSpent((prev) => prev + amount);

    setMailItems((prev) => {
      const updatedMailItems = prev.filter((mail) => mail.id !== mailId);

      if (updatedMailItems.length === 0) {
        setTimeout(() => {
          setShowSummary(true);
        }, 300);
      }

      return updatedMailItems;
    });

    setSelectedCategory(null);
    setOpenMailId(null);
  };

  // Switches between the home and budget views inside the phone UI
  const togglePhonePage = () => {
    setScreen("home");
    setPhonePage((p) => (p === "home" ? "budget" : "home"));
  };

  // Accepts calculated net pay from the payslip step
  // and deposits it into the current account
  const acceptPayslip = (netPay) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === "current" ? { ...acc, amount: acc.amount + netPay } : acc
      )
    );

    setNetIncome(netPay);
    setShowPayslip(false);
  };

  // Moves simulation to next week or ends if there are no more weeks
  const nextWeek = () => {
    if (week + 1 > totalWeeks) {
      setShowFinal(true);
      return;
    }

    setWeek((w) => w + 1);
    setSpent(0);
    setShowSummary(false);
    setSelectedCategory(null);
  };

  // Block direct access unless student arrived through classroom join flow
  if (!classroomCode || !studentCode || !moduleId) {
    return <Navigate to="/join" replace />;
  }

  // Loading UI while module data is being fetched
  if (loadingModule) {
    return (
      <div className="routePage">
        <div className="routeCard">
          <h1 className="routeSectionTitle">Loading classroom simulation...</h1>
          <p className="routeSectionText">
            Preparing the module for classroom <strong>{classroomCode}</strong>.
          </p>
        </div>
      </div>
    );
  }

  // Error state if backend module fetch fails
  if (moduleError || !moduleData) {
    return (
      <div className="routePage">
        <div className="routeCard">
          <h1 className="routeSectionTitle">Could not load module</h1>
          <p className="routeSectionText">
            {moduleError || "No module data was returned."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {!started && (
        <div className="introOverlay">
          <div className="introCard">
            <h1>{moduleData.title}</h1>
            <p>{moduleData.brief}</p>
            <button
              onClick={() => {
                setStarted(true);
                setShowPayslip(true);
              }}
            >
              Start
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
                  <h2>{moduleData.title}</h2>
                  <span className="topbar-sub">
                    Classroom {classroomCode} · Student {studentCode}
                  </span>
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

          {!showSummary && !showFinal && (
            <PostPanel
              mailItems={mailItems}
              openMailId={openMailId}
              onToggle={toggleMail}
              onAction={handleEvent}
              isBudgetComplete={isBudgetComplete}
            />
          )}

          {/* Displays end of week summary before progressing */}
          {showSummary && (
            <div className="summaryOverlay">
              <div className="summaryCard">
                <h2>Week {week} Summary</h2>
                <p>Spent: £{spent.toFixed(2)}</p>
                <p>Remaining: £{moneyLeft.toFixed(2)}</p>

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

                    nextWeek();
                  }}
                >
                  {week === totalWeeks ? "View Final Results" : "Continue"}
                </button>
              </div>
            </div>
          )}

          {showFinal && (
            <div className="summaryOverlay">
              <div className="summaryCard">
                <h2>Finished</h2>
                <p>Final: £{moneyLeft.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}