import React, { useState } from "react";

export default function ModuleCreation() {
  const [mail, setMail] = useState([{ label: "", type: "Expense", sender: "", date: "", subject: "", body: "", amount: 0 }]);
  const [income, setIncome] = useState([{ label: "", category: "PAYE", amount: 0 }]);
  const [expense, setExpense] = useState([{ label: "", category: "Rent", amount: 0 }]);
  const [week, setWeek] = useState([{ label: "", dateStarting: "", mailPool: [], incomePool: [], expensePool: [] }]);
  const [moduleName, setModuleName] = useState("");
  const [brief, setBrief] = useState("");
  const [mailChecked, setMailChecked] = useState({});
  const [incomeChecked, setIncomeChecked] = useState({});
  const [expenseChecked, setExpenseChecked] = useState({});
  const [quiz, setQuiz] = useState([{ question: "", options: [{ text: "", correct: false }, { text: "", correct: false }] }]);
  const [isUploading, setIsUploading] = useState(false);
  const [showQuizValidation, setShowQuizValidation] = useState(false);

  const handleAddMail = () => {
    setMail([...mail, { label: "", type: "Expense", sender: "", date: "", subject: "", body: "", amount: 0 }]);
  };
  const handleAddIncome = () => {
    setIncome([...income, { label: "", category: "PAYE", amount: 0 }]);
  };
  const handleAddExpense = () => {
    setExpense([...expense, { label: "", category: "Rent", amount: 0 }]);
  };
  const handleAddWeek = () => {
    let newDate = "";
    if (week.length > 0 && week[week.length - 1].dateStarting) {
      const lastDate = new Date(week[week.length - 1].dateStarting);
      lastDate.setDate(lastDate.getDate() + 7);
      newDate = lastDate.toISOString().split('T')[0];
    }
    setWeek([...week, { label: "", dateStarting: newDate, mailPool: [], incomePool: [], expensePool: [] }]);
  }
  
  const handleRemoveMail = (index) => {
    if (mail.length >= 1) {
      const newMail = mail.filter((_, i) => i !== index);
      setMail(newMail);
    }
  };
  const handleRemoveIncome = (index) => {
    if (income.length >= 1) {
      const newIncome = income.filter((_, i) => i !== index);
      setIncome(newIncome);
    }
  };
  const handleRemoveExpense = (index) => {
    if (expense.length >= 1) {
      const newExpense = expense.filter((_, i) => i !== index);
      setExpense(newExpense);
    }
  };
  const handleRemoveWeek = (index) => {
    if (week.length >= 1) {
      const newWeek = week.filter((_, i) => i !== index);
      setWeek(newWeek);
    }
  }
  const handleAddQuiz = () => {
    setQuiz([...quiz, { question: "", options: [{ text: "", correct: false }, { text: "", correct: false }] }]);
  };
  const handleRemoveQuiz = (index) => {
    if (quiz.length >= 1) {
      const newQuiz = quiz.filter((_, i) => i !== index);
      setQuiz(newQuiz);
    }
  };
  const handleAddOption = (questionIndex) => {
    const newQuiz = [...quiz];
    newQuiz[questionIndex].options.push({ text: "", correct: false });
    setQuiz(newQuiz);
  };
  const handleRemoveOption = (questionIndex, optionIndex) => {
    const newQuiz = [...quiz];
    if (newQuiz[questionIndex].options.length > 1) {
      newQuiz[questionIndex].options = newQuiz[questionIndex].options.filter((_, i) => i !== optionIndex);
      setQuiz(newQuiz);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Use native form validation to highlight missing required fields.
    if (!e.currentTarget.checkValidity()) {
      e.currentTarget.reportValidity();
      return;
    }

    // Highlight quiz questions that do not have a correct option selected.
    setShowQuizValidation(true);
    const hasQuizWithoutCorrectAnswer = quiz.some((questionInstance) =>
      !questionInstance.options.some((optionInstance) => optionInstance.correct)
    );
    if (hasQuizWithoutCorrectAnswer) {
      return;
    }

    // Disable submit button while request is in progress.
    setIsUploading(true);

    try {
      // Build payload from current form state and weekly selections.
      const moduleData = {
        title: moduleName.trim(),
        brief: brief.trim(),
        weekPool: week.map((weekInstance, i) => ({
          dateStarting: new Date(weekInstance.dateStarting),
          mailPool: mail.filter((mailInstance, j) => mailChecked[j + " - " + i] === true).map((mailInstance, j) => ({
            label: mailInstance.label,
            type: mailInstance.type ? mailInstance.type.toLowerCase() : mailInstance.type,
            sender: mailInstance.sender,
            date: new Date(mailInstance.date),
            subject: mailInstance.subject,
            body: mailInstance.body,
            amount: mailInstance.amount
          })),
          incomePool: income.filter((incomeInstance, j) => incomeChecked[j + " - " + i] !== false).map((incomeInstance, j) => ({
            label: incomeInstance.label,
            category: incomeInstance.category ? incomeInstance.category.toLowerCase() : incomeInstance.category,
            amount: incomeInstance.amount
          })),
          expensePool: expense.filter((expenseInstance, j) => expenseChecked[j + " - " + i] !== false).map((expenseInstance, j) => ({
            label: expenseInstance.label,
            category: expenseInstance.category ? expenseInstance.category.toLowerCase() : expenseInstance.category,
            amount: expenseInstance.amount
          }))
        })),
        quiz: quiz.map((q) => ({
          question: q.question,
          options: q.options.map((opt) => ({
            text: opt.text,
            correct: opt.correct
          }))
        }))
      };

        // Send module payload to the backend.
      const response = await fetch('/api/module/new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(moduleData)
      });

          // Reset form state when module creation succeeds.
      if (response.ok) {
          await response.json();
          setModuleName("");
          setBrief("");
          setMail([{ label: "", type: "Expense", sender: "", date: "", subject: "", body: "", amount: 0 }]);
          setIncome([{ label: "", category: "PAYE", amount: 0 }]);
          setExpense([{ label: "", category: "Rent", amount: 0 }]);
          setWeek([{ label: "Week 1", dateStarting: "", mailPool: [], incomePool: [], expensePool: [] }]);
          setQuiz([{ question: "", options: [{ text: "", correct: false }, { text: "", correct: false }] }]);
          setMailChecked({});
          setIncomeChecked({});
          setExpenseChecked({});
            setShowQuizValidation(false);
          alert("Module created successfully!");
      }
        else {
          // Show backend validation or processing error.
          alert("Error creating module");
      }
    } catch (error) {
      alert("Failed to upload module. Please try again.");
    } finally {
      // Always re-enable submit UI.
      setIsUploading(false);
    }
  };

  return (
    <div>
        {/* Page heading and intro */}
        <h1>Module Creation</h1>
        <p>This is where you can create new modules for your application.</p>

        <form onSubmit={handleSubmit}>
          {/* Module name and brief inputs */}
          <label>
            Module Name:
            <input type="text" name="moduleName" value={moduleName} 
            onChange={(e) => 
              setModuleName(e.target.value)} required />
          </label>
          <br></br>
          <label>
            Brief:
            <textarea name="brief" value={brief} 
            onChange={(e) => 
              setBrief(e.target.value)} 
            required
            style={{ width: "100%", height: "150px", padding: "5px", fontFamily: "Arial, sans-serif" }} />
          </label>
          <br></br>
          {/* Section for adding Mail */}
          <h3>Mail</h3>
          <div>
            {mail.map((mailInstance, i) => (
            <div key={i} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}>
              <label>Label: </label>
              <input
                type="text"
                value={mailInstance.label}
                onChange={(e) => {
                  const newMail = [...mail];
                  newMail[i].label = e.target.value;
                  setMail(newMail);
                }}
                required
                style={{ marginRight: "10px", padding: "5px" }}
              />

              <label>Type: </label>
              <select
                type="string"
                value={mailInstance.type}
                onChange={(e) => {
                  const newMail = [...mail];
                  newMail[i].type = e.target.value;
                  setMail(newMail);
                }}
                required
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              >
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
                <option value="Info">Info</option>
              </select>

              <label>Sender: </label>
              <input
                type="text"
                value={mailInstance.sender}
                onChange={(e) => {
                  const newMail = [...mail];
                  newMail[i].sender = e.target.value;
                  setMail(newMail);
                }}
                required
                style={{ marginRight: "10px", padding: "5px" }}
              />

              <label>Date: </label>
              <input
                type="date"
                value={mailInstance.date}
                onChange={(e) => {
                  const newMail = [...mail];
                  newMail[i].date = e.target.value;
                  setMail(newMail);
                }}
                required
                style={{ marginRight: "10px", padding: "5px" }}
              />

              <br></br>

              <label>Subject: </label>
              <input
                type="text"
                value={mailInstance.subject}
                onChange={(e) => {
                  const newMail = [...mail];
                  newMail[i].subject = e.target.value;
                  setMail(newMail);
                }}
                required
                style={{ marginRight: "10px", padding: "5px" }}
              />

              <label>Body: </label>
              <input
                type="text"
                value={mailInstance.body}
                onChange={(e) => {
                  const newMail = [...mail];
                  newMail[i].body = e.target.value;
                  setMail(newMail);
                }}
                required
                style={{ marginRight: "10px", padding: "5px" }}
              />

              <label>Amount: </label>
              <input
                type="number"
                value={mailInstance.amount}
                onChange={(e) => {
                  const newMail = [...mail];
                  newMail[i].amount = parseFloat(e.target.value);
                  setMail(newMail);
                }}
                required
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              />
              

              {mail.length >= 1 && (
                <button 
                  type="button"
                  onClick={() => handleRemoveMail(i)}
                  style={{ 
                    marginLeft: "10px", 
                    backgroundColor: "#ff6b6b", 
                    color: "white", 
                    border: "none", 
                    padding: "5px 10px", 
                    borderRadius: "3px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddMail} style={{
              padding: "5px 10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer"
            }}>Add Mail</button>
          </div>
          <br></br>
          {/* Section for adding Incomes */}
          <h3>Incomes</h3>
          <div>
            {income.map((incomeInstance, i) => (
            <div key={i} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}>
              <label>Label: </label>
              <input
                type="text"
                value={incomeInstance.label}
                onChange={(e) => {
                  const newIncome = [...income];
                  newIncome[i].label = e.target.value;
                  setIncome(newIncome);
                }}
                required
                style={{ marginRight: "10px", padding: "5px" }}
              />

              <label>Category: </label>
              <select
                type="string"
                value={incomeInstance.category}
                onChange={(e) => {
                  const newIncome = [...income];
                  newIncome[i].category = e.target.value;
                  setIncome(newIncome);
                }}
                required
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              >
                <option value="PAYE">PAYE</option>
                <option value="Invoice">Invoice</option>
                <option value="Casual">Casual</option>
              </select>

              <label>Amount: </label>
              <input
                type="number"
                value={incomeInstance.amount}
                onChange={(e) => {
                  const newIncome = [...income];
                  newIncome[i].amount = parseFloat(e.target.value);
                  setIncome(newIncome);
                }}
                required
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              />
              

              {income.length >= 1 && (
                <button 
                  type="button"
                  onClick={() => handleRemoveIncome(i)}
                  style={{ 
                    marginLeft: "10px", 
                    backgroundColor: "#ff6b6b", 
                    color: "white", 
                    border: "none", 
                    padding: "5px 10px", 
                    borderRadius: "3px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddIncome} style={{
              padding: "5px 10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer"
            }}>Add Income</button>
          </div>
          <br></br>
          {/* Section for adding Expenses */}
          <h3>Expenses</h3>
          <div>
            {expense.map((expenseInstance, i) => (
            <div key={i} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}>
              <label>Label: </label>
              <input
                type="text"
                value={expenseInstance.label}
                onChange={(e) => {
                  const newExpense = [...expense];
                  newExpense[i].label = e.target.value;
                  setExpense(newExpense);
                }}
                required
                style={{ marginRight: "10px", padding: "5px" }}
              />

              <label>Category: </label>
              <select
                type="string"
                value={expenseInstance.category}
                onChange={(e) => {
                  const newExpense = [...expense];
                  newExpense[i].category = e.target.value;
                  setExpense(newExpense);
                }}
                required
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              >
                <option value="Rent">Rent</option>
                <option value="Travel">Travel</option>
                <option value="Food">Food</option>
                <option value="Phone">Phone</option>
                <option value="Subscriptions">Subscriptions</option>
                <option value="Savings">Savings</option>
                <option value="Fun">Fun</option>
                <option value="other">Other</option>
              </select>

              <label>Amount: </label>
              <input
                type="number"
                value={expenseInstance.amount}
                onChange={(e) => {
                  const newExpense = [...expense];
                  newExpense[i].amount = parseFloat(e.target.value);
                  setExpense(newExpense);
                }}
                required
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              />

              {expense.length >= 1 && (
                <button 
                  type="button"
                  onClick={() => handleRemoveExpense(i)}
                  style={{ 
                    marginLeft: "10px", 
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "3px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddExpense} style={{
              padding: "5px 10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer"
            }}>Add Expense</button>
          </div>
            <br></br>
          {/* Section for adding Weeks */}
          <h3>Weeks</h3>
          <div>
            {week.map((weekInstance, i) => (
            <div key={i} style={{ marginBottom: "10px", padding: "10px", border: "1px solid #ccc", borderRadius: "4px" }}>

              <label>Starting Date: </label>
              <input
                type="date"
                value={weekInstance.dateStarting}
                onChange={(e) => {
                  const newWeek = [...week];
                  newWeek[i].dateStarting = e.target.value;
                  setWeek(newWeek);
                }}
                required
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              >
              </input>

              {week.length >= 1 && (
                <button 
                  type="button"
                  onClick={() => handleRemoveWeek(i)}
                  style={{ 
                    marginLeft: "10px", 
                    backgroundColor: "#ff6b6b", 
                    color: "white", 
                    border: "none", 
                    padding: "5px 10px", 
                    borderRadius: "3px",
                    cursor: "pointer"
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={handleAddWeek} style={{
              padding: "5px 10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer"
            }}>Add Week</button>
          </div>
          <br></br>
          {/* Section for adding Quiz Questions */}
          <h3>Quiz Questions</h3>
          <div>
            {quiz.map((quizInstance, i) => (
            <div key={i} style={{ marginBottom: "10px", padding: "10px", border: showQuizValidation && !quizInstance.options.some((optionInstance) => optionInstance.correct) ? "1px solid #d32f2f" : "1px solid #ccc", borderRadius: "4px" }}>
              <label>Question: </label>
              <input
                type="text"
                value={quizInstance.question}
                onChange={(e) => {
                  const newQuiz = [...quiz];
                  newQuiz[i].question = e.target.value;
                  setQuiz(newQuiz);
                }}
                required
                style={{ marginRight: "10px", padding: "5px", width: "300px" }}
                maxLength="100"
              />
              <br></br>
              <label>Options:</label>
              <div style={{ marginLeft: "20px", marginTop: "5px" }}>
                {/* Section for adding options for each quiz question */}
                {quizInstance.options.map((optionInstance, j) => (
                  <div key={j} style={{ marginBottom: "5px" }}>
                    <input
                      type="text"
                      value={optionInstance.text}
                      onChange={(e) => {
                        const newQuiz = [...quiz];
                        newQuiz[i].options[j].text = e.target.value;
                        setQuiz(newQuiz);
                      }}
                      placeholder={"Option " + (j + 1)}
                      required
                      style={{ marginRight: "10px", padding: "5px", width: "200px" }}
                      maxLength="50"
                    />
                    <label style={{ marginRight: "10px" }}>
                      <input
                        type="checkbox"
                        checked={optionInstance.correct}
                        onChange={(e) => {
                          const newQuiz = [...quiz];
                          newQuiz[i].options[j].correct = e.target.checked;
                          setQuiz(newQuiz);
                        }}
                      />
                      Correct
                    </label>
                    {quizInstance.options.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(i, j)}
                        style={{
                          backgroundColor: "#ff6b6b",
                          color: "white",
                          border: "none",
                          padding: "3px 8px",
                          borderRadius: "3px",
                          cursor: "pointer",
                          marginLeft: "5px"
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => handleAddOption(i)}
                style={{
                  marginLeft: "20px",
                  marginTop: "5px",
                  padding: "5px 10px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "3px",
                  cursor: "pointer"
                }}
              >
                Add Option
              </button>
              {quiz.length >= 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQuiz(i)}
                  style={{
                    marginLeft: "10px",
                    marginTop: "5px",
                    backgroundColor: "#ff6b6b",
                    color: "white",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "3px",
                    cursor: "pointer"
                  }}
                >
                  Remove Question
                </button>
              )}
              {showQuizValidation && !quizInstance.options.some((optionInstance) => optionInstance.correct) && (
                <p style={{ color: "#d32f2f", marginTop: "8px", marginBottom: 0 }}>
                  Select at least one correct option for this question.
                </p>
              )}
            </div>
            ))}
            <button type="button" onClick={handleAddQuiz} style={{
              padding: "5px 10px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "3px",
              cursor: "pointer"
            }}>Add Quiz Question</button>
          </div>
          <br></br>
          {/* Table for selecting which Mail, Income, and Expense items are associated with each week */}
          <div>
            <table>
              <thead>
                <tr>
                  <th>Label</th>
                  {week.map((weekInstance, i) => (
                    <th key={i}>{weekInstance.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {mail.map((mailInstance, i) => (
                  <tr key={i}>
                    <td>{mailInstance.label || `Mail ${i + 1}`}</td>
                    {week.map((weekInstance, j) => (
                      <td key={j}><input type="checkbox" name={i + " - " + j} 
                      checked={mailChecked[i + " - " + j] === true} 
                      onChange={(e) => setMailChecked({...mailChecked, [i + " - " + j]: e.target.checked})}>
                      </input></td>
                    ))}
                  </tr>
                ))}
                {income.map((incomeInstance, i) => (
                  <tr key={i}>
                    <td>{incomeInstance.label || `Income ${i + 1}`}</td>
                    {week.map((weekInstance, j) => (
                      <td key={j}><input type="checkbox" name={i + " - " + j} 
                      checked={incomeChecked[i + " - " + j] !== false} 
                      onChange={(e) => setIncomeChecked({...incomeChecked, [i + " - " + j]: e.target.checked})}>
                      </input></td>
                    ))}
                  </tr>
                ))}
                {expense.map((expenseInstance, i) => (
                  <tr key={i}>
                    <td>{expenseInstance.label || `Expense ${i + 1}`}</td>
                    {week.map((weekInstance, j) => (
                      <td key={j}><input type="checkbox" name={i + " - " + j} 
                      checked={expenseChecked[i + " - " + j] !== false} 
                      onChange={(e) => setExpenseChecked({...expenseChecked, [i + " - " + j]: e.target.checked})}></input></td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <br></br>
            <br></br>
            {/* Final submit button */}
            <button type="submit" disabled={isUploading}>{isUploading ? "Creating Module..." : "Create Module"}</button>

        </form>
    </div>
  );
}