/*
  widgetLocationId

  may make format more customizable
*/

function generateNumGuessWidget(widgetLocationId, numFormat) {
  var fBT = document.getElementById(widgetLocationId),
      num = document.createElement('div'),
      numBox = document.createElement('div');

  numBox.classList.add('numBox');

  num.setAttribute('id', 'numBox-num-' + widgetLocationId)
  num.classList.add('numBox-num');
  num.textContent = "?";

  var controls = document.createElement('div')
  controls.classList.add('controls')

  var plus = document.createElement('div'),
      minus = document.createElement('div');

  var incrementInterval, decrementInterval;

  plus.addEventListener("click", increment);
  plus.addEventListener("mousedown", incrementHandler);

  plus.addEventListener("mouseup", (e) => {
    e.preventDefault();
    window.clearTimeout(incrementInterval);
  });

  minus.addEventListener("click", decrement);
  minus.addEventListener("mousedown", decrementHandler);

  minus.addEventListener("mouseup", (e) => {
    e.preventDefault();
    window.clearTimeout(decrementInterval);
  })

  var guess = 0;

  function incrementHandler(e) {
    e.preventDefault();
    incrementInterval = setInterval(increment, 150);
  }

  function decrementHandler(e) {
    e.preventDefault();
    decrementInterval = setInterval(decrement, 150);
  }

  function increment() {
    var num = document.getElementById('numBox-num-' + widgetLocationId),
        beforeGuess = document.getElementById('beforeGuess-' + widgetLocationId);

    if(guess < 100) {
      if (guess === 0) {
        beforeGuess.classList.remove('beforeGuessComplete-' + widgetLocationId);
        beforeGuess.classList.add('afterGuessComplete-' + widgetLocationId);
      }
      guess++
      num.textContent = '' + guess + numFormat;
    }
  }

  function decrement() {
    var num = document.getElementById('numBox-num-' + widgetLocationId),
        beforeGuess = document.getElementById('beforeGuess-' + widgetLocationId);

    if(guess > 0) {
      if (guess === 0) {
        beforeGuess.classList.remove('beforeGuessComplete-' + widgetLocationId);
        beforeGuess.classList.add('afterGuessComplete-' + widgetLocationId);
      }
      guess--;
      num.textContent = '' + guess + numFormat;
    }
  }

  plus.classList.add('numBox-change');
  plus.classList.add('plus');
  minus.classList.add('numBox-change');
  minus.classList.add('minus');
  plus.textContent = '+';
  minus.textContent = '-';

  controls.appendChild(plus)
  controls.appendChild(minus)

  numBox.appendChild(num);
  numBox.appendChild(controls);
  fBT.appendChild(numBox);

  // Handle answer
  var beforeGuess= document.getElementById('beforeGuess-' + widgetLocationId);
  beforeGuess.addEventListener('click', handleAnswer)

  function handleAnswer() {
    var answer = document.getElementById('answerText-' + widgetLocationId),
        beforeGuess= document.getElementById('beforeGuess-' + widgetLocationId);

    beforeGuess.classList.remove('afterGuessComplete-' + widgetLocationId);
    beforeGuess.classList.add('beforeGuessComplete-' + widgetLocationId);

    plus.removeEventListener('click', increment);
    plus.removeEventListener('mousedown', increment);
    minus.removeEventListener('click', decrement);
    minus.removeEventListener('mousedown', decrement);

    answer.classList.remove('hidden');
  }
}

module.exports = generateNumGuessWidget;
