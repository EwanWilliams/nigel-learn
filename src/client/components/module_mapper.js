// Formats backend mail dates into a short weekday label for the UI (e.g. "Mon")
function formatMailDate(dateString) {
  const date = new Date(dateString);

  // Fallback label if backend date is missing or invalid
  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
  });
}

// Converts raw backend module data into the structure required by the frontend simulation
export function mapModuleToStudyData(moduleDoc) {
  if (!moduleDoc) {
    return null;
  }

  // Default budget categories shown in the simulation UI
  const defaultCategories = [
    { id: "rent", label: "Rent / Board" },
    { id: "travel", label: "Travel" },
    { id: "food", label: "Food" },
    { id: "phone", label: "Phone" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "savings", label: "Savings" },
    { id: "fun", label: "Fun" },
    { id: "other", label: "Other" },
  ];

  // Use a map so backend categories can override or extend the defaults
  const budgetCategoryMap = new Map(
    defaultCategories.map((category) => [category.id, category])
  );

  // Merge expense categories from backend weeks into the default category set
  (moduleDoc.weekPool || []).forEach((week) => {
    (week.expensePool || []).forEach((expense) => {
      budgetCategoryMap.set(expense.category, {
        id: expense.category,
        label:
          expense.category === "rent"
            ? "Rent / Board"
            : expense.category
                .split("_")
                .map(
                  (word) => word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" "),
      });
    });
  });

  const budgetCategories = Array.from(budgetCategoryMap.values());

  // Calculate total income across all weeks in case week 1 has no income value
  const totalIncome = (moduleDoc.weekPool || []).reduce((sum, week) => {
    const weekIncome = (week.incomePool || []).reduce(
      (weekSum, income) => weekSum + (income.amount || 0),
      0
    );
    return sum + weekIncome;
  }, 0);

  // Prefer first week income for payslip display and simulation start
  const firstWeekIncome = (moduleDoc.weekPool?.[0]?.incomePool || []).reduce(
    (sum, income) => sum + (income.amount || 0),
    0
  );

  return {
    id: moduleDoc._id,
    title: moduleDoc.title || "Student Bank",
    brief: moduleDoc.brief || "",

    // Budget categories used in the budget screen
    budgetCategories,

    // Static account setup shown at the start of the simulation
    // These are frontend UI defaults rather than backend module content
    startingAccounts: [
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
    ],

    // Income used in the payslip step
    // Uses first week income if available, otherwise falls back to total module income
    grossIncome:
      firstWeekIncome > 0
        ? firstWeekIncome
        : totalIncome > 0
        ? totalIncome
        : 0,

    // Convert backend weeks into the structure used by the study simulation
    weeks: (moduleDoc.weekPool || []).map((week, index) => ({
      week: index + 1,
      dateStarting: week.dateStarting,

      // Convert backend mail items into frontend-friendly objects
      mailItems: (week.mailPool || []).map((mail, mailIndex) => ({
        id: mail._id || `${index + 1}-${mailIndex + 1}`,
        subject: mail.subject,
        message: mail.body,
        amount: mail.amount || 0,
        date: formatMailDate(mail.date),
        sender: mail.sender,
        label: mail.label,
        type: mail.type,
      })),

      incomes: week.incomePool || [],
      expenses: week.expensePool || [],
    })),
  };
}