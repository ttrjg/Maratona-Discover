const buttonNew = document.querySelector('.button.new')
const buttonCancel = document.querySelector('.button.cancel')
const modal = document.querySelector('.modal-overlay')

buttonNew.addEventListener('click', show)
buttonCancel.addEventListener('click', close)

function show() {
  modal.classList.add('active')
}

function close() {
  modal.classList.remove('active')
}

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem(
      'dev.finances:transactions',
      JSON.stringify(transactions)
    )
  }
}

const Transactions = {
  all: Storage.get(),

  add(transaction) {
    Transactions.all.push(transaction)

    App.reload()
  },

  remove(index) {
    Transactions.all.splice(index, 1)

    App.reload()
  },

  incomes() {
    let income = 0

    Transactions.all.forEach(transaction => {
      if (transaction.amount > 0) {
        income += transaction.amount
      }
    })

    return income
  },

  expenses() {
    let expense = 0

    Transactions.all.forEach(transaction => {
      if (transaction.amount < 0) {
        expense += transaction.amount
      }
    })

    return expense
  },

  total() {
    let total = 0

    total += this.expenses() + this.incomes()

    return total
  }
}

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),

  addTransaction(transaction, index) {
    const tr = document.createElement('tr')
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
    tr.dataset.index = index

    DOM.transactionsContainer.appendChild(tr)
  },

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense'

    const amount = utils.formatCurrency(transaction.amount)

    const html = `
        <td class="description"> ${transaction.description}</td>
        <td class="${CSSclass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td><img onclick="Transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação" /></td>
    `
    return html
  },

  updateBalance() {
    document.getElementById('incomesDisplay').innerHTML = utils.formatCurrency(
      Transactions.incomes()
    )

    document.getElementById('expenseDisplay').innerHTML = utils.formatCurrency(
      Transactions.expenses()
    )
    document.getElementById('totalDisplay').innerHTML = utils.formatCurrency(
      Transactions.total()
    )
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
}

const utils = {
  formatAmount(value) {
    value = Number(value.replace(',', '.')) * 100

    return Math.round(value)
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : ''

    value = String(value).replace(/\D/g, '')
    value = Number(value) / 100
    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    })

    return signal + value
  },

  formatDate(date) {
    const splittedDate = date.split('-')
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  }
}

const App = {
  init() {
    Transactions.all.forEach(DOM.addTransaction)

    DOM.updateBalance()

    Storage.set(Transactions.all)
  },

  reload() {
    DOM.clearTransactions()
    App.init()
  }
}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    }
  },

  formatData() {
    let { description, amount, date } = Form.getValues()

    amount = utils.formatAmount(amount)

    date = utils.formatDate(date)

    return {
      description,
      amount,
      date
    }
  },

  clearFields() {
    Form.description.value = ''
    Form.amount.value = ''
    Form.date.value = ''
  },

  submit(event) {
    event.preventDefault()
    const transaction = Form.formatData()
    Transactions.add(transaction)
    Form.clearFields()
    close()
    App.reload()
  }
}

App.init()
