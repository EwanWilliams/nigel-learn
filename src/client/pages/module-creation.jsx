import React, { useState } from "react";

export default function ModuleCreation() {
  const [mail, setMail] = useState([{ label: "", type: "", sender: "", date: "", subject: "", body: "", amount: 0 }]);
  const [income, setIncome] = useState([{ label: "", category: "", amount: 0 }]);
  const [expense, setExpense] = useState([{ label: "", category: "", amount: 0 }]);

  const handleAddMail = () => {
    setMail([...mail, { label: "", type: "", sender: "", date: "", subject: "", body: "", amount: 0 }]);
  };
  const handleAddIncome = () => {
    setIncome([...income, { label: "", category: "", amount: 0 }]);
  };
  const handleAddExpense = () => {
    setExpense([...expense, { label: "", category: "", amount: 0 }]);
  };
  
  const handleRemoveMail = (index) => {
    if (mail.length > 1) {
      const newMail = mail.filter((_, i) => i !== index);
      setMail(newMail);
    }
  };
  const handleRemoveIncome = (index) => {
    if (income.length > 1) {
      const newIncome = income.filter((_, i) => i !== index);
      setIncome(newIncome);
    }
  };
  const handleRemoveExpense = (index) => {
    if (expense.length > 1) {
      const newExpense = expense.filter((_, i) => i !== index);
      setExpense(newExpense);
    }
  };

  return (
    <div>
        <h1>Module Creation</h1>
        <p>This is where you can create new modules for your application.</p>

        <form onSubmit={null}>
          <label>
            Module Name:
            <input type="text" name="moduleName" />
          </label>
          <br></br>
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
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="info">Info</option>
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
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              />
              

              {mail.length > 1 && (
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
          <button type="button" onClick={handleAddMail} >Add Mail</button>
          </div>
          <br></br>
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
                value={incomeInstance.type}
                onChange={(e) => {
                  const newIncome = [...income];
                  newIncome[i].type = e.target.value;
                  setIncome(newIncome);
                }}
                required
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              >
                <option value="rent">Rent</option>
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="phone">Phone</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="savings">Savings</option>
                <option value="fun">Fun</option>
                <option value="other">Other</option>
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
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              />
              

              {income.length > 1 && (
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
          <button type="button" onClick={handleAddIncome} >Add Income</button>
          </div>
          <br></br>
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
                value={expenseInstance.type}
                onChange={(e) => {
                  const newExpense = [...expense];
                  newExpense[i].type = e.target.value;
                  setExpense(newExpense);
                }}
                required
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              >
                <option value="rent">Rent</option>
                <option value="travel">Travel</option>
                <option value="food">Food</option>
                <option value="phone">Phone</option>
                <option value="subscriptions">Subscriptions</option>
                <option value="savings">Savings</option>
                <option value="fun">Fun</option>
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
                style={{ marginRight: "10px", padding: "5px", width: "80px" }}
              />
            </div>
          ))}
          <button type="button" onClick={handleAddExpense} >Add Expense</button>
          </div>
            <br></br>
            <br></br>
            <button type="submit">Create Module</button>

        </form>
    </div>
  );
}