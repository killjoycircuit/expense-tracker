let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

const form = document.getElementById('transaction-form');
const error = document.getElementById('error');

form.addEventListener('submit', function (e) {
  e.preventDefault();
  addTransaction();
});

function addTransaction() {
  const date = document.getElementById('date').value;
  const description = document.getElementById('description').value.trim();
  const category = document.getElementById('category').value;
  const amountStr = document.getElementById('amount').value;
  const type = document.getElementById('type').value;

  if (!date || !description || !category || amountStr === '') {
    error.textContent = "Please fill out all fields.";
    return;
  }

  const amount = parseFloat(amountStr);

  if (isNaN(amount) || amount <= 0) {
    error.textContent = "Please enter a valid positive amount.";
    return;
  }

  error.textContent = "";

  const transaction = {
    id: Date.now(),
    date,
    description,
    category,
    amount,
    type
  };

  transactions.push(transaction);
  saveAndRender();

  form.reset();
  document.getElementById('type').value = 'income';
  document.getElementById('category').selectedIndex = 0;
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  saveAndRender();
}

function saveAndRender() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
  renderTransactions();
  updateSummary();
}


function renderTransactions() {
  const list = document.getElementById('transaction-list');
  list.innerHTML = "";

  transactions.forEach(tx => {
    const li = document.createElement('li');
    li.className = tx.type;

    li.innerHTML = `
      <div>
        <strong>${tx.description}</strong> - ${tx.category}<br/>
        <small>${tx.date}</small>
      </div>
      <div>
        <span class="${tx.type === 'income' ? 'green' : 'red'}">₹${tx.amount.toFixed(2)}</span>
        <button class="delete-btn" onclick="deleteTransaction(${tx.id})" aria-label="Delete transaction">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white" viewBox="0 0 24 24" >
            <path d="M3 6h18v2H3V6zm2 3h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm3 3v6h2v-6H8zm4 0v6h2v-6h-2zM10 4h4v2h-4V4z"/>
          </svg>
        </button>
      </div>
    `;

    list.appendChild(li);
  });
}

function updateSummary() {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  document.getElementById('total-income').textContent = income.toFixed(2);
  document.getElementById('total-expense').textContent = expense.toFixed(2);
  document.getElementById('net-balance').textContent = (income - expense).toFixed(2);
}

document.getElementById('download-btn').addEventListener('click', function () {
  if (transactions.length === 0) {
    alert("No transactions to export!");
    return;
  }

  const data = transactions.map(tx => ({
    Date: tx.date,
    Description: tx.description,
    Category: tx.category,
    Amount: tx.amount,
    Type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1)
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(data);

  XLSX.utils.book_append_sheet(wb, ws, "Transactions");

  XLSX.writeFile(wb, "Expense_Tracker_Data.xlsx");
});





renderTransactions();
updateSummary();


