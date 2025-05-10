 function calculate(operator) {
      const n1 = parseFloat(document.getElementById('num1').value);
      const n2 = parseFloat(document.getElementById('num2').value);
      let result = 0;

      if (isNaN(n1) || isNaN(n2)) {
        alert("Please enter valid numbers.");
        return;
      }

      switch(operator) {
        case '+':
          result = n1 + n2;
          break;
        case '-':
          result = n1 - n2;
          break;
        case '*':
          result = n1 * n2;
          break;
        case '/':
          if (n2 === 0) {
            alert("Cannot divide by zero.");
            return;
          }
          result = n1 / n2;
          break;
      }

      document.getElementById('result').innerText = "Result: " + result;
    }