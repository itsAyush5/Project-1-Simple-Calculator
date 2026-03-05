const display = document.getElementById("display");
const expressionView = document.getElementById("expression");
const historyList = document.getElementById("history-list");

const state = {
  current: "0",
  previous: null,
  operator: null,
  overwrite: false,
  memory: 0,
  history: []
};

function formatNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) {
    return "Error";
  }
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 12 }).format(number);
}

function syncDisplay() {
  display.value = state.current;
  expressionView.textContent = state.previous && state.operator
    ? `${state.previous} ${state.operator}`
    : "";
}

function inputDigit(value) {
  if (state.overwrite) {
    state.current = value === "." ? "0." : value;
    state.overwrite = false;
    return;
  }

  if (value === ".") {
    if (!state.current.includes(".")) {
      state.current += ".";
    }
    return;
  }

  state.current = state.current === "0" ? value : state.current + value;
}

function setOperator(op) {
  if (state.operator && !state.overwrite) {
    runEquals();
  }
  state.previous = state.current;
  state.operator = op;
  state.overwrite = true;
}

function calculate(a, b, op) {
  const left = Number(a);
  const right = Number(b);

  switch (op) {
    case "+":
      return left + right;
    case "-":
      return left - right;
    case "*":
      return left * right;
    case "/":
      if (right === 0) {
        throw new Error("Cannot divide by zero");
      }
      return left / right;
    default:
      return right;
  }
}

function addToHistory(entry) {
  state.history.unshift(entry);
  state.history = state.history.slice(0, 10);
  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";
  if (!state.history.length) {
    const li = document.createElement("li");
    li.className = "empty";
    li.textContent = "No calculations yet";
    historyList.appendChild(li);
    return;
  }

  state.history.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    historyList.appendChild(li);
  });
}

function runEquals() {
  if (!state.operator || state.previous === null) {
    return;
  }

  try {
    const result = calculate(state.previous, state.current, state.operator);
    const historyText = `${state.previous} ${state.operator} ${state.current} = ${formatNumber(result)}`;
    state.current = String(result);
    state.previous = null;
    state.operator = null;
    state.overwrite = true;
    expressionView.textContent = "";
    addToHistory(historyText);
  } catch (error) {
    state.current = "Error";
    state.previous = null;
    state.operator = null;
    state.overwrite = true;
  }
}

function clearAll() {
  state.current = "0";
  state.previous = null;
  state.operator = null;
  state.overwrite = false;
}

function clearEntry() {
  state.current = "0";
}

function backspace() {
  if (state.overwrite || state.current === "Error") {
    state.current = "0";
    state.overwrite = false;
    return;
  }

  state.current = state.current.length > 1 ? state.current.slice(0, -1) : "0";
}

function applyUnary(action) {
  const value = Number(state.current);
  if (!Number.isFinite(value)) {
    state.current = "Error";
    return;
  }

  switch (action) {
    case "toggle-sign":
      state.current = String(value * -1);
      break;
    case "percent":
      state.current = String(value / 100);
      break;
    case "square":
      state.current = String(value * value);
      break;
    case "sqrt":
      state.current = value < 0 ? "Error" : String(Math.sqrt(value));
      break;
    default:
      break;
  }
}

function handleMemory(action) {
  const currentVal = Number(state.current);
  if (!Number.isFinite(currentVal)) {
    return;
  }

  switch (action) {
    case "memory-clear":
      state.memory = 0;
      break;
    case "memory-recall":
      state.current = String(state.memory);
      state.overwrite = true;
      break;
    case "memory-add":
      state.memory += currentVal;
      state.overwrite = true;
      break;
    case "memory-subtract":
      state.memory -= currentVal;
      state.overwrite = true;
      break;
    default:
      break;
  }
}

function handleButtonClick(event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const value = button.dataset.value;
  const action = button.dataset.action;

  if (value) {
    if (["+", "-", "*", "/"].includes(value)) {
      setOperator(value);
    } else {
      inputDigit(value);
    }
  }

  if (action) {
    if (action === "all-clear") clearAll();
    if (action === "clear-entry") clearEntry();
    if (action === "backspace") backspace();
    if (action === "equals") runEquals();
    if (["toggle-sign", "percent", "square", "sqrt"].includes(action)) applyUnary(action);
    if (action.startsWith("memory")) handleMemory(action);
  }

  syncDisplay();
}

function handleKeyboard(event) {
  const allowed = "0123456789.+-*/";
  if (allowed.includes(event.key)) {
    if (["+", "-", "*", "/"].includes(event.key)) {
      setOperator(event.key);
    } else {
      inputDigit(event.key);
    }
  }

  if (event.key === "Enter" || event.key === "=") {
    runEquals();
  }

  if (event.key === "Escape") {
    clearAll();
  }

  if (event.key === "Backspace") {
    backspace();
  }

  syncDisplay();
}

document.querySelector(".grid-buttons").addEventListener("click", handleButtonClick);
document.querySelector(".memory-controls").addEventListener("click", handleButtonClick);
document.getElementById("clear-history").addEventListener("click", () => {
  state.history = [];
  renderHistory();
});
document.addEventListener("keydown", handleKeyboard);

renderHistory();
syncDisplay();
