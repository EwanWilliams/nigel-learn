import { useMemo, useState, useEffect } from "react";
import "./app.css";

import HomeScreen from "./screens/home_screen";
import BudgetScreen from "./screens/budget_screen";
import DetailScreen from "./screens/detail_screen";
import PostPanel from "./components/post_panel";
import Payslip from "./components/payslip";

export default function App() {
  const [week, setWeek] = useState(1);
  const [completedEvents, setCompletedEvents] = useState([]);

  const [screen, setScreen] = useState("home");
  const [phonePage, setPhonePage] = useState("home");
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openMailId, setOpenMailId] = useState(null);
  const [query, setQuery] = useState("");
  const [showPayslip, setShowPayslip] = useState(true);

  const [grossIncome, setGrossIncome] = useState(() =>
    Math.floor(Math.random() * 500 + 1500)
  );

  const [takeHomePay, setTakeHomePay] = useState(0);

  const [accounts, setAccounts] = useState([
    { id: "current", name: "Current Account", amount: 0 },
    { id: "savings", name: "Savings Account", amount: 0 },
  ]);

  // ✅ EVENTS BY WEEK
  const mailItems = useMemo(() => {
    if (week === 1) {
      return [
        { id: "1", subject: "Bike repair", amount: 60 },
        { id: "2", subject: "Phone repair", amount: 90 },
      ];
    }

    if (week === 2) {
      return [
        { id: "3", subject: "Rent increase", amount: 120 },
        { id: "4", subject: "Electric bill", amount: 75 },
      ];
    }

    return [];
  }, [week]);

  // ✅ ACCEPT EVENT (money leaves account)
  const handleAcceptEvent = (event) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === "current"
          ? { ...acc, amount: acc.amount - event.amount }
          : acc
      )
    );

    setCompletedEvents((prev) =>
      prev.includes(event.id) ? prev : [...prev, event.id]
    );
  };

  // ✅ IGNORE EVENT
  const handleIgnoreEvent = (event) => {
    setCompletedEvents((prev) =>
      prev.includes(event.id) ? prev : [...prev, event.id]
    );
  };

  // ✅ WEEK PROGRESSION
  const allEventsCompleted =
    mailItems.length > 0 &&
    completedEvents.length === mailItems.length;

  useEffect(() => {
    if (allEventsCompleted) {
      setTimeout(() => {
        setWeek((w) => w + 1);
        setCompletedEvents([]);
        setOpenMailId(null);
      }, 800);
    }
  }, [allEventsCompleted]);

  // ✅ PAYSLIP HANDLER
  const acceptPayslip = (netPay) => {
    setAccounts((prev) =>
      prev.map((acc) =>
        acc.id === "current"
          ? { ...acc, amount: acc.amount + netPay }
          : acc
      )
    );

    setTakeHomePay(netPay);

    setGrossIncome(Math.floor(Math.random() * 500 + 1500));
    setShowPayslip(false);
  };

  return (
    <div className="app-container">
      {showPayslip && (
        <Payslip income={grossIncome} onAccept={acceptPayslip} />
      )}

      <HomeScreen
        accounts={accounts}
        week={week}
      />

      <PostPanel
        mailItems={mailItems}
        openMailId={openMailId}
        onToggle={setOpenMailId}
        onAccept={handleAcceptEvent}
        onIgnore={handleIgnoreEvent}
      />
    </div>
  );
}