function formatGBP(value) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}


export default function BudgetScreen({
  netIncome,
  totalAllocated,
  moneyLeft,
  budgetCategoryConfig,
  budget,
  changeBudget,
  selectedCategory,
  setSelectedCategory,
  budgetError,
}) {

  return (
    <div className="phoneContent">
      <div className="noteCard">
        <div className="noteTitle">Monthly budget</div>
        <div className="noteText">
          Take-home pay: {formatGBP(netIncome)}
        </div>

        <div className="noteText">
          Left to allocate: {formatGBP(moneyLeft)}
        </div>

      </div>

      <div className="sectionHeader">
        <h3>Budget categories</h3>
        <span className="mutedSmall">Current plan</span>
      </div>

      <div className="noteCard">

        {budgetCategoryConfig.map((category) => (

          <div
  key={category.id}
className={`budgetRow ${selectedCategory === category.id ? "active" : ""}`}
onClick={() =>
  setSelectedCategory((prev) =>
    prev === category.id ? null : category.id
  )
}
>

            <span>{category.label}</span>

            <div className="budgetControls">

              <button
  className="budgetBtn"
  onClick={(e) => {
    e.stopPropagation(); 
    changeBudget(category.id, -10);
  }}
>
  −
</button>

              <div className="budgetInputWrapper">

                <span className="currencySymbol">£</span>

                <input
  className="budgetInput"
  type="number"
  value={budget[category.id]}
  onFocus={(e) => {
    if (budget[category.id] === 0) {
      e.target.select();
    }
  }}
  onChange={(e) =>
    changeBudget(
      category.id,
      Number(e.target.value) - budget[category.id]
    )
  }
/>

              </div>

              <button
                className="budgetBtn"
                onClick={(e) => {
                  e.stopPropagation(); 
                  changeBudget(category.id, 10);
                }}
              >
                +
              </button>

            </div>
            {budgetError?.category === category.id && (
  <div className="budgetErrorPopup">
    {budgetError.message}
  </div>
)}

          </div>

        ))}

      </div>

    </div>
  );
}