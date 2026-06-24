let expenseChart;
const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const transactionListEl = document.getElementById("transaction-list");
const transactionFormEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");
const currencySelectEl = document.getElementById("currency-select");
const initialBalanceInput = document.getElementById("initial-balance-input");
const setBalanceBtn = document.getElementById("set-balance-btn");
const tabBtns = document.querySelectorAll(".tab-btn");
const categoryEl = document.getElementById("category");
let selectedType = "expense"; 
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
let currentCurrency = localStorage.getItem("currentCurrency") || "INR";
currencySelectEl.value = currentCurrency;
let initialBalance = parseFloat(localStorage.getItem("initialBalance")) || 0;
initialBalanceInput.value = initialBalance ? initialBalance : ""; 
tabBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabBtns.forEach((btn2) => btn2.classList.remove("active"));
    btn.classList.add("active");
    selectedType = btn.getAttribute("data-type");
  });
});
transactionFormEl.addEventListener("submit", addTransaction);
function addTransaction(e) {
  e.preventDefault();
  const description = descriptionEl.value.trim();
  const amountVal = parseFloat(amountEl.value);
  if (!description || isNaN(amountVal) || amountVal <= 0) {
    alert("Please enter a valid description and a positive amount.");
    return;
  }
  const amount = selectedType === "expense" ? -Math.abs(amountVal) : Math.abs(amountVal);
  transactions.push({
    id: Date.now(),
    description,
    amount,
    category: categoryEl.value
  });
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateTransactionList();
  updateSummary();
  updateChart();
  transactionFormEl.reset();
  tabBtns.forEach((b) => b.classList.remove("active"));
  document.querySelector(".expense-tab").classList.add("active");
  selectedType = "expense";
}
currencySelectEl.addEventListener("change", (e) => {
  currentCurrency = e.target.value;
  localStorage.setItem("currentCurrency", currentCurrency);
  updateTransactionList();
  updateSummary();
});
setBalanceBtn.addEventListener("click", () => {
  const parsedVal = parseFloat(initialBalanceInput.value);
  initialBalance = isNaN(parsedVal) ? 0 : parsedVal;
  localStorage.setItem("initialBalance", initialBalance);
  updateSummary();
});
function updateTransactionList() {
  transactionListEl.innerHTML = "";
  const sortedTransactions = [...transactions].reverse();
  sortedTransactions.forEach((transaction) => {
    const transactionEl = createTransactionElement(transaction);
    transactionListEl.appendChild(transactionEl);
  });
}
function createTransactionElement(transaction) {
  const li = document.createElement("li");
  li.classList.add("transaction", transaction.amount > 0 ? "income" : "expense");
  
  li.innerHTML = `
    <span>
      ${transaction.description}
      <br>
      <small>${transaction.category}</small>
    </span>
    <span>
      ${formatCurrency(transaction.amount)}
      <button class="delete-btn">x</button>
    </span>
  `;
 li.querySelector(".delete-btn").addEventListener("click", () => {
    removeTransaction(transaction.id);
  });

  return li;
}
function updateSummary() {
  const transactionTotal = transactions.reduce((acc, t) => acc + t.amount, 0);
  const netBalance = initialBalance + transactionTotal;
  const income = transactions
    .filter((t) => t.amount > 0)
    .reduce((acc, t) => acc + t.amount, 0);
  const expenses = transactions
    .filter((t) => t.amount < 0)
    .reduce((acc, t) => acc + t.amount, 0);
  balanceEl.textContent = formatCurrency(netBalance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(expenses);
}
function updateChart() {
  const expenseData = {};
  transactions.filter(t => t.amount < 0)
    .forEach(t => {
      const category = t.category || "Other";
      expenseData[category] = (expenseData[category] || 0) + Math.abs(t.amount);
    });
  const labels = Object.keys(expenseData);
  const values = Object.values(expenseData);
  const chartCanvas = document.getElementById("expenseChart");
  if (!chartCanvas) return; 
  const ctx = chartCanvas.getContext("2d");
  if (expenseChart) {
    expenseChart.destroy();
  }
  if (labels.length === 0) return;

  expenseChart = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ["#ef4444", "#f97316", "#f59e0b", "#10b981", "#3b82f6", "#6366f1", "#8b5cf6"]
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { position: "bottom" } }
    }
  });
}
function formatCurrency(number) {
  const userLocale = navigator.language || "en-US";
  return new Intl.NumberFormat(userLocale, {
    style: "currency",
    currency: currentCurrency,
  }).format(number);
}
function removeTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  updateTransactionList();
  updateSummary();
  updateChart();
}

updateTransactionList();
updateSummary();
updateChart();