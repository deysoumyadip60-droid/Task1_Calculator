let display = document.getElementById('display');
let previousOperand = document.getElementById('previousOperand');
let history = JSON.parse(localStorage.getItem('calculatorHistory')) || [];

let currentInput = '0';
let previousInput = '';
let operation = null;
let shouldResetDisplay = false;

// ======================== NUMBER INPUT ========================
function appendNumber(num) {
    if (shouldResetDisplay) {
        currentInput = String(num);
        shouldResetDisplay = false;
    } else {
        if (num === '.' && currentInput.includes('.')) return;
        
        if (currentInput === '0' && num !== '.') {
            currentInput = String(num);
        } else {
            currentInput += String(num);
        }
    }
    updateDisplay();
}

// ======================== OPERATOR ========================
function appendOperator(op) {
    if (operation !== null && !shouldResetDisplay) {
        calculate();
    }
    
    previousInput = currentInput;
    operation = op;
    shouldResetDisplay = true;
    updatePreviousOperand();
}

// ======================== CALCULATE ========================
function calculate() {
    if (operation === null || shouldResetDisplay) return;
    
    let result;
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    switch(operation) {
        case '+':
            result = prev + current;
            break;
        case '-':
            result = prev - current;
            break;
        case '*':
            result = prev * current;
            break;
        case '/':
            if (current === 0) {
                alert('Cannot divide by zero!');
                clearDisplay();
                return;
            }
            result = prev / current;
            break;
        case '%':
            result = prev % current;
            break;
        default:
            return;
    }
    
    // Store in history
    const calculation = `${previousInput} ${operation} ${currentInput} = ${result}`;
    addToHistory(calculation);
    
    currentInput = String(result);
    operation = null;
    previousInput = '';
    shouldResetDisplay = true;
    updateDisplay();
    updatePreviousOperand();
}

// ======================== DELETE LAST ========================
function deleteLast() {
    if (shouldResetDisplay) return;
    
    if (currentInput.length === 1) {
        currentInput = '0';
    } else {
        currentInput = currentInput.slice(0, -1);
    }
    updateDisplay();
}

// ======================== CLEAR ========================
function clearDisplay() {
    currentInput = '0';
    previousInput = '';
    operation = null;
    shouldResetDisplay = false;
    updateDisplay();
    updatePreviousOperand();
}

// ======================== UPDATE DISPLAY ========================
function updateDisplay() {
    let displayValue = currentInput;
    
    // Add thousand separator
    displayValue = parseFloat(displayValue).toLocaleString();
    
    display.value = displayValue;
}

// ======================== UPDATE PREVIOUS OPERAND ========================
function updatePreviousOperand() {
    if (operation === null) {
        previousOperand.innerText = '';
    } else {
        previousOperand.innerText = `${previousInput} ${operation}`;
    }
}

// ======================== HISTORY ========================
function addToHistory(calculation) {
    history.unshift(calculation);
    if (history.length > 10) {
        history.pop();
    }
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    updateHistoryDisplay();
}

function updateHistoryDisplay() {
    const historyList = document.getElementById('historyList');
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="no-history">No history yet</p>';
        return;
    }
    
    historyList.innerHTML = history.map((item, index) => `
        <div class="history-item" onclick="useFromHistory('${item}')">
            <span>${item}</span>
            <button class="history-item-delete" onclick="deleteHistoryItem(${index}); event.stopPropagation();">×</button>
        </div>
    `).join('');
}

function deleteHistoryItem(index) {
    history.splice(index, 1);
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
    updateHistoryDisplay();
}

function clearHistory() {
    history = [];
    localStorage.removeItem('calculatorHistory');
    updateHistoryDisplay();
}

function useFromHistory(calculation) {
    const result = calculation.split(' = ')[1];
    currentInput = result;
    shouldResetDisplay = true;
    updateDisplay();
}

// ======================== KEYBOARD SUPPORT ========================
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendNumber(e.key);
    if (e.key === '.') appendNumber('.');
    if (e.key === '+') appendOperator('+');
    if (e.key === '-') appendOperator('-');
    if (e.key === '*') appendOperator('*');
    if (e.key === '/') {
        e.preventDefault();
        appendOperator('/');
    }
    if (e.key === 'Enter') calculate();
    if (e.key === 'Backspace') deleteLast();
    if (e.key === 'Escape') clearDisplay();
});

// ======================== INITIALIZE ========================
updateDisplay();
updateHistoryDisplay();