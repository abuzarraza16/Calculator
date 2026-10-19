
// My Calculator - script.js
// (No eval() is used anywhere in this file)

// 1. GET ELEMENTS FROM THE HTML PAGE
const currentEl = document.getElementById("current-operand");
const previousEl = document.getElementById("previous-operand");
const allButtons = document.querySelectorAll(".btn");

// 2. CALCULATOR MEMORY (called "state")
let currentOperand = "0";   // the number being typed now (as text)
let previousOperand = "";   // the first number, saved when an operator is pressed
let operator = null;        // "+", "-", "*", "/" or null if none chosen
let overwrite = false;      // true when the next digit should start a new number
let isError = false;        // true when an error message is showing
let lastExpression = "";    // text like "8 ÷ 2 =" shown after pressing equals

const MAX_DIGITS = 15;
const SYMBOLS = { "+": "+", "-": "−", "*": "×", "/": "÷" };

// 3. SHOW EVERYTHING ON THE SCREEN
function updateDisplay() {
currentEl.textContent = currentOperand === "" ? "0" : currentOperand;
currentEl.classList.toggle("error", isError);

if (lastExpression) {
 previousEl.textContent = lastExpression;
} else if (operator) {
 previousEl.textContent = previousOperand + " " + SYMBOLS[operator];
} else {
 previousEl.textContent = "";
}
}

// 4. CALCULATOR FUNCTIONS

// Reset everything (AC button)
function clearAll() {
currentOperand = "0";
previousOperand = "";
operator = null;
overwrite = false;
isError = false;
lastExpression = "";
}

// Show an error message
function showError(message) {
clearAll();
currentOperand = message;
isError = true;
}

// Typing a digit 0-9
function appendNumber(digit) {
if (isError) clearAll();
lastExpression = "";

if (overwrite) {
 currentOperand = digit;       // start a fresh number after "="
 overwrite = false;
} else if (currentOperand === "0" || currentOperand === "") {
 currentOperand = digit;       // replace the starting zero
} else {
 // Count digits only (ignore "-" and ".") and stop at the limit
 if (currentOperand.replace(/[-.]/g, "").length >= MAX_DIGITS) return;
 currentOperand += digit;
}
}

// Typing the decimal point
function appendDecimal() {
if (isError) clearAll();
lastExpression = "";

if (overwrite || currentOperand === "") {
 currentOperand = "0.";
 overwrite = false;
 return;
}
if (currentOperand.includes(".")) return;   // only one dot allowed
currentOperand += ".";
}

// Do the actual maths for two numbers
function calculate(a, b, op) {
let result;
if (op === "+") result = a + b;
else if (op === "-") result = a - b;
else if (op === "*") result = a * b;
else if (op === "/") {
 if (b === 0) return null;                 // division by zero
 result = a / b;
}

// Fixes tiny errors like 0.1 + 0.2 = 0.30000000000000004
return parseFloat(result.toPrecision(12));
}

// Pressing + − × ÷
function chooseOperator(op) {
if (isError) return;
lastExpression = "";

// If user presses two operators in a row, just replace the operator
if (currentOperand === "" && previousOperand !== "") {
 operator = op;
 return;
}

// If a calculation is already waiting (e.g. 5 + 3 then +), finish it first
if (operator && previousOperand !== "" && currentOperand !== "") {
 const result = calculate(parseFloat(previousOperand), parseFloat(currentOperand), operator);
 if (result === null) {
   showError("Cannot divide by zero");
   return;
 }
 currentOperand = String(result);
}

previousOperand = currentOperand;
currentOperand = "";
operator = op;
overwrite = false;
}

// Pressing =
function equals() {
if (isError) return;
if (!operator || previousOperand === "" || currentOperand === "") return;

const a = parseFloat(previousOperand);
const b = parseFloat(currentOperand);
const result = calculate(a, b, operator);

if (result === null) {
 showError("Cannot divide by zero");
 return;
}

lastExpression = previousOperand + " " + SYMBOLS[operator] + " " + currentOperand + " =";
currentOperand = String(result);
previousOperand = "";
operator = null;
overwrite = true;       // next digit starts a new calculation
}

// DEL button: remove the last digit
function deleteLast() {
if (isError) {
 clearAll();
 return;
}
if (overwrite || currentOperand === "") return;
lastExpression = "";

currentOperand = currentOperand.slice(0, -1);
if (currentOperand === "" || currentOperand === "-") {
 currentOperand = operator ? "" : "0";
}
}

// % button: divide the current number by 100
function percent() {
if (isError || currentOperand === "") return;
lastExpression = "";

const value = parseFloat(currentOperand) / 100;
currentOperand = String(parseFloat(value.toPrecision(12)));
overwrite = true;
}

// +/− button: switch between positive and negative
function negate() {
if (isError || currentOperand === "") return;
if (parseFloat(currentOperand) === 0) return;   // "-0" makes no sense
lastExpression = "";

if (currentOperand.startsWith("-")) {
 currentOperand = currentOperand.slice(1);
} else {
 currentOperand = "-" + currentOperand;
}
}

// 5. MOUSE CLICKS
allButtons.forEach(function (button) {
button.addEventListener("click", function () {
 const number = button.dataset.number;       // from data-number
 const op = button.dataset.operator;         // from data-operator
 const action = button.dataset.action;       // from data-action

 if (number !== undefined) appendNumber(number);
 else if (op !== undefined) chooseOperator(op);
 else if (action === "decimal") appendDecimal();
 else if (action === "equals") equals();
 else if (action === "clear") clearAll();
 else if (action === "delete") deleteLast();
 else if (action === "percent") percent();
 else if (action === "negate") negate();

 updateDisplay();
});
});

// 6. KEYBOARD SUPPORT

// Small helper: makes the matching button look "pressed" for a moment
function flashButton(selector) {
const button = document.querySelector(selector);
if (!button) return;
button.classList.add("pressed");
setTimeout(function () {
 button.classList.remove("pressed");
}, 120);
}

document.addEventListener("keydown", function (event) {
const key = event.key;

if (key >= "0" && key <= "9") {
 appendNumber(key);
 flashButton('[data-number="' + key + '"]');
} else if (key === "." || key === ",") {
 appendDecimal();
 flashButton('[data-action="decimal"]');
} else if (key === "+" || key === "-" || key === "*" || key === "/") {
 event.preventDefault();       // stops browser shortcuts (like quick find on "/")
 chooseOperator(key);
 flashButton('[data-operator="' + key + '"]');
} else if (key === "Enter" || key === "=") {
 event.preventDefault();       // stops a focused button from also being clicked
 equals();
 flashButton('[data-action="equals"]');
} else if (key === "Backspace") {
 deleteLast();
 flashButton('[data-action="delete"]');
} else if (key === "Escape" || key === "Delete") {
 clearAll();
 flashButton('[data-action="clear"]');
} else if (key === "%") {
 percent();
 flashButton('[data-action="percent"]');
} else {
 return;                       // any other key: do nothing
}

updateDisplay();
});

// 7. SHOW THE STARTING SCREEN
updateDisplay();