import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

import HomeScreen from "../inners/home_screen";
import BudgetScreen from "../inners/budget_screen";
import DetailScreen from "../inners/detail_screen";
import PostPanel from "../components/post_panel";
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

const saveKey =
  classroomCode && studentCode ? `study_${classroomCode}_${studentCode}` : "";

const navigate = useNavigate();

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
  const [week, setWeek] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [spent, setSpent] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [budgetLocked, setBudgetLocked] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [started, setStarted] = useState(false);
  const [history, setHistory] = useState([]);
  const [showFinal, setShowFinal] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPercentage, setQuizPercentage] = useState(0);
  const [showBudgetBreakdown, setShowBudgetBreakdown] = useState(false);
  const [categorySpent, setCategorySpent] = useState({});
  const [tutorialStep, setTutorialStep] = useState(0);
  

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

  useEffect(() => {
  if (!saveKey) return;

  const raw = sessionStorage.getItem(saveKey);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);

    setWeek(parsed.week ?? 1);
    setBudget(parsed.budget ?? {
      rent: 0,
      travel: 0,
      food: 0,
      phone: 0,
      subscriptions: 0,
      savings: 0,
      fun: 0,
      other: 0,
    });
    setTotalSpent(parsed.totalSpent ?? 0);
    setSpent(parsed.spent ?? 0);
    setBudgetLocked(parsed.budgetLocked ?? false);
    setShowSummary(parsed.showSummary ?? false);
    setStarted(parsed.started ?? false);
    setHistory(parsed.history ?? []);
    setShowFinal(parsed.showFinal ?? false);
    setNetIncome(parsed.netIncome ?? 0);
    setAccounts(parsed.accounts ?? []);
  } catch (err) {
    console.error("Failed to restore study progress", err);
  }
}, [saveKey]);

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
        console.log("RAW MODULE:", rawModule);
console.log("MAPPED MODULE:", mapModuleToStudyData(rawModule));
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
  setBudgetCategoryConfig(moduleData.budgetCategories || []);

  setAccounts((prev) =>
    prev.length > 0 ? prev : moduleData.startingAccounts || []
  );

  setMailItems(moduleData.weeks?.[week - 1]?.mailItems || []);
}, [moduleData, week]);

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

  useEffect(() => {
  if (!saveKey || !started) return;

  const saveData = {
    week,
    budget,
    spent,
    totalSpent,
    budgetLocked,
    showSummary,
    started,
    history,
    showFinal,
    netIncome,
    accounts,
  };

  sessionStorage.setItem(saveKey, JSON.stringify(saveData));
}, [
  saveKey,
  week,
  budget,
  spent,
  totalSpent,
  budgetLocked,
  showSummary,
  started,
  history,
  showFinal,
  netIncome,
  accounts,
]);

  // Updates an individual budget category by a given amount
  const changeBudget = (category, amount) => {
  setBudget((prev) => {
    const currentValue = prev[category] || 0;
    const newValue = Math.max(0, currentValue + amount);

    const currentTotal = Object.values(prev).reduce(
      (sum, value) => sum + value,
      0
    );

    const newTotal = currentTotal - currentValue + newValue;

    // Prevent allocating more than net income
    if (newTotal > netIncome) {
      alert("You cannot allocate more than your available net pay.");
      return prev;
    }

    return {
      ...prev,
      [category]: newValue,
    };
  });
};

  // Total amount currently allocated across all budget categories
  const totalAllocated = Object.values(budget).reduce(
    (sum, value) => sum + value,
    0
  );

  // Remaining money not yet allocated.
  // Subtracting spent ensures paid expenses are not incorrectly
  // treated as money available to reallocate.
  const leftToAllocate = Math.max(0, netIncome - totalAllocated - totalSpent);

  const isBudgetComplete = true;
  const moneyLeft = netIncome - totalSpent;
  const totalWeeks = moduleData?.weeks?.length || 4;

  // Opens account detail screen
  const openDetail = (account) => {
    if (account.id !== "current") return;

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
    setTotalSpent((prev) => prev + amount);
    setAccounts((prev) =>
  prev.map((acc) =>
    acc.id === "current"
      ? { ...acc, amount: Math.max(0, acc.amount - amount) }
      : acc
  )
);
    setCategorySpent((prev) => ({
  ...prev,
  [selectedCategory]: (prev[selectedCategory] || 0) + amount,
}));

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


  // Moves simulation to next week or ends if there are no more weeks
  const nextWeek = () => {
    if (week + 1 > totalWeeks) {
      setShowBudgetBreakdown(true);
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

  const submitQuiz = async () => {
  const questions = moduleData.quiz || [];

  const unanswered = questions.some(
    (_, index) => quizAnswers[index] === undefined
  );

  if (unanswered) {
    alert("Please answer all quiz questions before submitting.");
    return;
  }

  const score = questions.reduce((total, q, questionIndex) => {
    const selectedIndex = quizAnswers[questionIndex];
    const selectedOption = q.options?.[selectedIndex];

    return selectedOption?.isCorrect ? total + 1 : total;
  }, 0);

  const percentage =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    setQuizScore(score);
    setQuizPercentage(percentage);

  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/classroom/study/complete`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          classroomCode,
          studentCode,
          moduleId,
          mark: percentage,
          score,
          totalQuestions: questions.length,
          percentage,
          completed: true,
        }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to save quiz result");
    }

    setQuizSubmitted(true);
  } catch (err) {
    console.error(err);
    alert("Quiz submitted, but the result could not be saved.");
  }
};

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
              setTutorialStep(1);

              setNetIncome(grossIncome);

              setAccounts((prev) =>
                prev.map((acc) =>
                  acc.id === "current"
                    ? { ...acc, amount: grossIncome }
                    : acc
                )
              );
            }}
          >
            Start
          </button>
        </div>
      </div>
    )}

    {started && tutorialStep > 0 && (
      <div className="tutorialOverlay">
        <div className="tutorialCard">
          {tutorialStep === 1 && (
            <>
              <h2>Welcome</h2>
              <p>
                You will manage your money across several weeks.
              </p>
            </>
          )}

          {tutorialStep === 2 && (
            <>
              <h2>Budget</h2>
              <p>
                Press the £ button to allocate money into
                budget categories.
              </p>
            </>
          )}

         {tutorialStep === 3 && (
  <>
    <h2>Select Categories</h2>
    <p>
      Before paying a mail item, click a budget
      category to highlight it.
    </p>

    <p>
      The highlighted category is where the
      payment will be taken from.
    </p>
  </>
)}

          {tutorialStep === 4 && (
            <>
              <h2>Finish</h2>
              <p>
                Each week ends with a summary.
                At the end, complete the quiz.
              </p>
            </>
          )}

          <button
            onClick={() => {
              if (tutorialStep >= 4) {
                setTutorialStep(0);
              } else {
                setTutorialStep((prev) => prev + 1);
              }
            }}
          >
            {tutorialStep >= 4
              ? "Start Simulation"
              : "Next"}
          </button>
        </div>
      </div>
    )}

      {started && (
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
  <div className="detailScreen">
    <div className="detailHeader">
      <button className="detailBackBtn" onClick={goHome}>
        ← Back
      </button>
    </div>

    <div className="detailCard">
      <div className="detailIcon">{selectedAccount.icon}</div>

      <div className="detailName">{selectedAccount.name}</div>

      <div className="detailDesc">{selectedAccount.desc}</div>

      <div className="detailBalanceLabel">
        Available Balance
      </div>

      <div className="detailBalance">
        £{selectedAccount.amount.toFixed(2)}
      </div>
    </div>
  </div>
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
                <p>Spent This Week: £{spent.toFixed(2)}</p>
                <p>Total Spent: £{totalSpent.toFixed(2)}</p>
                <p>Money Remaining: £{moneyLeft.toFixed(2)}</p>

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
{showBudgetBreakdown && !showFinal && (
  <div className="summaryOverlay">
    <div className="summaryCard quizCard">
      <h2>Final Budget Breakdown</h2>

      <p>Here is how your budget ended before the final quiz.</p>

      {(budgetCategoryConfig || []).map((category) => {
        const spentAmount = categorySpent[category.id] || 0;
        const leftAmount = budget[category.id] || 0;

        return (
          <div key={category.id} className="quizQuestion">
            <h3>{category.label}</h3>
            <p>Spent: £{spentAmount.toFixed(2)}</p>
            <p>Left: £{leftAmount.toFixed(2)}</p>
          </div>
        );
      })}

      <p>
        Overall remaining balance: £{moneyLeft.toFixed(2)}
      </p>

      <button
        onClick={() => {
          setShowBudgetBreakdown(false);
          setShowFinal(true);
        }}
      >
        Continue to Quiz
      </button>
    </div>
  </div>
)}
          {showFinal && (
  <div className="summaryOverlay">
  <div className="summaryCard quizCard">
    <h2>Final Quiz</h2>

    <p>Final balance: £{moneyLeft.toFixed(2)}</p>

    {(moduleData.quiz || []).map((q, questionIndex) => (
      <div key={questionIndex} className="quizQuestion">
        <h3>{q.question}</h3>

        {(q.options || []).map((option, optionIndex) => (
          <label key={optionIndex} className="quizOption">
            <input
              type="radio"
              name={`quiz-${questionIndex}`}
              checked={quizAnswers[questionIndex] === optionIndex}
              onChange={() =>
                setQuizAnswers((prev) => ({
                  ...prev,
                  [questionIndex]: optionIndex,
                }))
              }
              disabled={quizSubmitted}
            />

            <span>{option.text}</span>
          </label>
        ))}
      </div>
    ))}

    {!quizSubmitted ? (
  <button onClick={submitQuiz}>
    Submit Quiz
  </button>
) : (
  <>
    <h3>
      Score: {quizScore}/{moduleData.quiz.length}
    </h3>

    <p>
      Percentage: {quizPercentage}%
    </p>

    <button
      onClick={() => {
        sessionStorage.removeItem(saveKey);
        navigate("/");
      }}
    >
      Return Home
    </button>
  </>
)}
  </div>
</div>
)}
        </div>
      )}
    </div>
  );
}