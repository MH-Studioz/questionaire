/* ============================================================================
   QUESTIONAIRE — questions/business/finance.js
   ========================================================================== */

(function () {
  "use strict";

  window.QuestionairePools.register({
    id: "finance",
    area: "business",
    title: "Personal finance",
    subjects: ["ap-business-personal-finance", "financial-literacy"],
    facts: [
      ["What is compound interest?", "Interest earned on principal and previously earned interest", ["A one-time fee", "A tax on savings", "Interest paid only on the principal"], "Compounding grows the balance over time."],
      ["What is a budget?", "A plan for income and expenses", ["A type of loan", "A credit score", "A tax form"], "Budgets allocate money to priorities."],
      ["What is an emergency fund?", "Savings for unexpected expenses", ["A retirement account", "A stock portfolio", "A credit card limit"], "It reduces reliance on high-interest debt."],
      ["What does APR stand for?", "Annual Percentage Rate", ["Annual Payment Record", "Automatic Payment Rate", "Adjusted Principal Return"], "APR expresses the yearly cost of borrowing."],
      ["What is diversification?", "Spreading investments to reduce risk", ["Putting all money in one stock", "Borrowing more", "Closing an account"], "Different assets do not move identically."],
      ["What is a credit score?", "A number summarising creditworthiness", ["A bank balance", "A tax rate", "A stock price"], "Scores reflect borrowing and repayment history."],
      ["What is inflation?", "A general rise in prices", ["A fall in wages", "A rise in unemployment only", "A tax on imports"], "Inflation reduces purchasing power."],
      ["What is a deductible?", "The amount paid before insurance covers a claim", ["A monthly premium", "A tax credit", "A savings rate"], "Higher deductibles usually lower premiums."],
      ["What is the time value of money?", "Money available now is worth more than the same amount later", ["Money loses value when saved", "Interest is always negative", "Cash cannot be invested"], "Earlier money can earn a return."],
      ["What is a mutual fund?", "A pooled investment managed for many investors", ["A single stock", "A bank loan", "A tax refund"], "Funds spread risk across many holdings."],
      ["What is net worth?", "Assets minus liabilities", ["Income minus taxes", "Savings plus debt", "Monthly expenses"], "Net worth measures financial position."],
      ["What is a fixed expense?", "A cost that stays roughly the same each month", ["A cost that changes with usage", "A one-time purchase", "An unexpected bill"], "Rent and insurance are common fixed expenses."],
      ["What is liquidity?", "How easily an asset converts to cash", ["The interest rate on a loan", "The value of a stock", "The length of an investment"], "Cash is highly liquid; a house is not."],
      ["What is a tax deduction?", "An expense that reduces taxable income", ["A tax payment", "A tax refund", "A penalty"], "Deductions lower the income taxed."],
      ["What is risk tolerance?", "How much investment loss an investor can accept", ["The expected return of a fund", "The fee charged by a broker", "The number of shares owned"], "It shapes asset allocation."],
      ["What is a credit utilisation ratio?", "The share of available credit being used", ["The interest rate on a card", "The number of cards held", "The minimum payment"], "High utilisation can lower a credit score."]
    ]
  });
})();
