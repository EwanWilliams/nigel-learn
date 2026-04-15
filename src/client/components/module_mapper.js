function formatMailDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Today";
  }

  return date.toLocaleDateString("en-GB", {
    weekday: "short",
  });
}

export function mapModuleToStudyData(moduleDoc) {
  const budgetCategoryMap = new Map();

  (moduleDoc.weekPool || []).forEach((week) => {
    (week.expensePool || []).forEach((expense) => {
      if (!budgetCategoryMap.has(expense.category)) {
        budgetCategoryMap.set(expense.category, {
          id: expense.category,
          label:
            expense.category === "rent"
              ? "Rent / Board"
              : expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
        });
      }
    });
  });

  const defaultCategories = [
    { id: "rent", label: "Rent / Board" },
    { id: "travel", label: "Travel" },
    { id: "food", label: "Food" },
    { id: "phone", label: "Phone" },
    { id: "subscriptions", label: "Subscriptions" },
    { id: "savings", label: "Savings" },
    { id: "fun", label: "Fun" },
  ];

  const budgetCategories =
    budgetCategoryMap.size > 0
      ? Array.from(budgetCategoryMap.values())
      : defaultCategories;

  const totalIncome = (moduleDoc.weekPool || []).reduce((sum, week) => {
    const weekIncome = (week.incomePool || []).reduce(
      (weekSum, income) => weekSum + (income.amount || 0),
      0
    );
    return sum + weekIncome;
  }, 0);

  const firstWeekIncome = (moduleDoc.weekPool?.[0]?.incomePool || []).reduce(
    (sum, income) => sum + (income.amount || 0),
    0
  );

  return {
    id: moduleDoc._id,
    title: moduleDoc.title || "Student Bank",
    brief: moduleDoc.brief || "",
    budgetCategories,
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
    grossIncome: firstWeekIncome || totalIncome || 1800,
    weeks: (moduleDoc.weekPool || []).map((week, index) => ({
      week: index + 1,
      dateStarting: week.dateStarting,
      mailItems: (week.mailPool || []).map((mail, mailIndex) => ({
        id: `${index + 1}-${mailIndex + 1}`,
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