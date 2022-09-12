// Grabbing all Element I Need

// Buttons
const startButton = document.getElementById('start-btn')
const nextButton = document.getElementById('next-btn')

// Interface
const questionContainerElement = document.getElementById('question-container')
const questionElement = document.getElementById('question')
const answerButtonsElement = document.getElementById('answer-buttons')
const startContainer = document.querySelector(".start")
const questionNumber = document.querySelector("#number")
const quizApplication = document.querySelector(".quizApplication")
const loader = document.getElementById("preloader");

// Points and animation
const Points = document.querySelectorAll(".point-marker");
const pointsNum = document.querySelector(".points-num")
const gif = document.querySelector(".hoverGif")

// Grabing video tags to show web cam recording
const video1 = document.getElementById('video1')
const video = document.getElementById('video')

// Creating userPoints, pointsArray
// init of variable bg music 
let bgmusic;
let points = 0;
let questions
let pointArray = [-20, -15, -10, -5, 45, 50, 55, 60, 65, 70, 75, 80]
pointArray.reverse()

// import models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
]).then(startVideo)

// Hide Preloader
window.addEventListener("load", function(){
  loader.style.display = "none"
  quizApplication.classList.remove('hide')
})

// Disable Right Click
document.addEventListener('contextmenu', event => {
  alert("Warning Please do not right click")
  event.preventDefault()
});

// Variable initalization
let shuffledQuestions,currentQuestionIndex, questionCount

// Starting WebCam
function startVideo1(){
  navigator.getUserMedia(
      {
          video: {}
      }, stream => video1.srcObject = stream,
      err => console.error(err)
  )
}

function startVideo(){
  const constraints = {
    audio: true,
    video: { width: 1280, height: 1280 }
  };
  
  navigator.mediaDevices.getUserMedia(constraints)
    .then((mediaStream) => {
      video.srcObject = mediaStream;
      video.onloadedmetadata = () => {
        video.play();
      };
    })
    .catch((err) => {
      // always check for errors at the end.
      console.error(`${err.name}: ${err.message}`);
    });
}

// Detections
video.addEventListener('play', () => {
  const canvas = faceapi.createCanvasFromMedia(video)
  document.querySelector(".videos").append(canvas)
  const displaySize = { width: 200, height: 200 }
  faceapi.matchDimensions(canvas, displaySize)
  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks()
    const resizedDetections = faceapi.resizeResults(detections, displaySize)
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    faceapi.draw.drawDetections(canvas, resizedDetections)
    faceapi.draw.drawFaceLandmarks(canvas, resizedDetections)
  }, 100)
})

// Start btn Hover Effect
function bigImg(){
  gif.style.display = "block"
  setTimeout(() => {
    gif.style.display = "none"
  }, 1500)
}

// Event Listeners for Next & Start Btn
startButton.addEventListener('click', startGame)
nextButton.addEventListener('click', () => {
    currentQuestionIndex++
    setNextQuestion()
    document.dispatchEvent(startEvent);
})

// Start Game Function
function startGame() {
  let text = "Do you want Background Music in Quiz\nEither OK or Cancel.";
    if (confirm(text) == true) {
      bgmusic = new Audio('../assets/audios/come-on-boy-8018.mp3')
    } else {
      bgmusic = new Audio()
    }
  startContainer.classList.add('hide')
  if (questionContainerElement.requestFullscreen) {
    questionContainerElement.requestFullscreen();
  }
  document.dispatchEvent(startEvent);
  shuffledQuestions = questions.sort(() => Math.random() - .5)
  currentQuestionIndex = 0
  questionCount = 1
  startVideo();
  startVideo1();
  questionContainerElement.classList.remove('hide')
  nextButton.innerText = 'Next'
  setNextQuestion()
  pointsNum.innerText = `Points: ${points}`
  countdown( "ten-countdown", 10,0 );
}

// Next Question function and pointsAdding
function setNextQuestion() {
  resetState()
  pointsNum.innerText = `Points: ${points}`
  showQuestion(shuffledQuestions[currentQuestionIndex])
  Points[currentQuestionIndex].style.backgroundColor = "yellow"
  Points[currentQuestionIndex].style.color = "black"
  bgmusic.play()
}

// Function to show question
function showQuestion(question) {
  questionElement.innerText = question.question
  question.answers.forEach(answer => {
    const button = document.createElement('button')
    button.innerText = answer.text
    button.classList.add('btn')
    if (answer.correct) {
      button.dataset.correct = answer.correct
    }
    button.addEventListener('click', selectAnswer)
    answerButtonsElement.appendChild(button)
  })
  questionCount++
}

// function to reset all the bg color
function resetState() {
  clearStatusClass(questionContainerElement)
  nextButton.style.visibility = "hidden"
  while (answerButtonsElement.firstChild) {
    answerButtonsElement.removeChild(answerButtonsElement.firstChild)
  }
}

// Function to check user selected ans is correct or wrong
function selectAnswer(e) {
  const selectedButton = e.target
  const correct = selectedButton.dataset.correct
  setStatusClass( Points[currentQuestionIndex], correct)
  Array.from(answerButtonsElement.children).forEach(button => {
    setStatusClass(button, button.dataset.correct)
  })
  if (shuffledQuestions.length > currentQuestionIndex+1) {
    questionNumber.innerText = `Question ${questionCount}`
    nextButton.style.visibility = "visible"
  } else {
    nextButton.innerText = 'Restart'
    nextButton.style.visibility = "visible"
    nextButton.addEventListener('click', ()=>{
        location.reload();
    })
  }
  if(correct){
    points+=Math.abs(pointArray[currentQuestionIndex])
    var audio = new Audio('../assets/audios/win.mp3');
    audio.play();
    bgmusic.pause();
  }
  if(!correct){
    points-=Math.abs(pointArray[currentQuestionIndex])
    new Audio('../assets/audios/wrong.wav').play();
    bgmusic.pause()
  }
}

// Setting status of btn and points as correct or wrong
function setStatusClass(element, correct) {
  clearStatusClass(element)
  if (correct) {
    if(element === Points[currentQuestionIndex]){
      element.style.color = "#32CD32"
      Points[currentQuestionIndex].style.backgroundColor = "transparent"
    } else{
      element.classList.add('correct')
    }
  } else {
    if(element === Points[currentQuestionIndex]){
      element.style.color = "red"
      Points[currentQuestionIndex].style.backgroundColor = "transparent"
    } else{
      element.classList.add('wrong')
    }  }
}

// Clearin status
function clearStatusClass(element) {
  element.classList.remove('correct')
  element.classList.remove('wrong')
}

// Questions Array
(() => {
  questions = [
  {
    question: 'In CSS, What is the order of the box model from the inside out ?',
    answers: [
      { text: 'Content, Padding, Border, Margin', correct: true },
      { text: 'Content, Border, Padding, Margin', correct: false },
      { text: 'Content, Margin, Border, Padding', correct: false },
      { text: 'Padding, Content, Border, Margin', correct: false }
    ]
  },
  {
    question: 'Which of The following is not a type in JS?',
    answers: [
      { text: 'Null', correct: false },
      { text: 'Number', correct: false },
      { text: 'String', correct: false },
      { text: 'Integer', correct: true }
    ]
  },
  {
    question: 'In CSS Which Unit is based on screen width?',
    answers: [
      { text: 'VX', correct: false },
      { text: 'VW', correct: true },
      { text: 'SW', correct: false },
      { text: '%', correct: false }
    ]
  },
  {
    question: 'In Node.js, How do you import a module using common JS',
    answers: [
      { text: 'const t = include("f")', correct: false },
      { text: 'const t = require("f")', correct: true },
      { text: 'import t from "f"', correct: false },
      { text: 'const t = import ("f")', correct: false }
    ]
  },

  {
    question: 'In what order are margin and padding defined in CSS',
    answers: [
      { text: 'Top, Right, Bottom, Left', correct: true },
      { text: 'Top, Bottom, Left, Right', correct: false },
      { text: 'Left, Right, Top, Bottom', correct: false },
      { text: 'Left-Margin, Right-Margin, Left-Padding, Right-Padding', correct: false }
    ]
  },

  {
    question: 'What is the result of 100/0 in JavaScript ?',
    answers: [
      { text: 'NaN', correct: false },
      { text: 'It Throws an Error', correct: false },
      { text: 'Infinity', correct: true },
      { text: '0', correct: false }
    ]
  },

  {
    question: 'What is the correct way to check for NaN in JavaScript',
    answers: [
      { text: '10 == NaN', correct: false },
      { text: '10 === NaN', correct: false },
      { text: 'isNumber(10)', correct: false },
      { text: 'isNaN(10)', correct: true },
    ]
  },
  {
    question: 'Which of the following is false ?',
    answers: [
      { text: '"" == false', correct: false },
      { text: 'NaN == NaN', correct: true },
      { text: 'false === false', correct: false },
      { text: 'null == undefined', correct: false }
    ]
  },
  {
    question: 'What is the most searched term in caniuse.com ?',
    answers: [
      { text: 'flexbox', correct: true },
      { text: 'position sticky', correct: false },
      { text: 'transform', correct: false },
      { text: 'grid', correct: false }
    ]
  },
  {
    question: 'does this give error "int x = 5"',
    answers: [
      { text: 'Yes in JS', correct: true },
      { text: 'No in JS', correct: false },
      { text: 'No in Java', correct: true },
      { text: 'No in CSS', correct: false }
    ]
  },
  {
    question: 'What datatype is only in JS',
    answers: [
      { text: 'NaN', correct: false },
      { text: 'null', correct: false },
      { text: 'there is no new datatype in JS', correct: true },
      { text: 'number', correct: false }
    ]
  },
  {
    question: 'Which of the following is not a library ??',
    answers: [
      { text: 'JQuery', correct: false },
      { text: 'React', correct: false },
      { text: 'Preact', correct: false },
      { text: 'Ember', correct: true }
    ]
  }
]
})()

let tabSwitchCount = 1;
document.addEventListener("visibilitychange", function(){
  if(document.hidden){
    if (tabSwitchCount >= 3){
      window.close()
    }
    alert(`Do Not Switch Pages, Warning ${tabSwitchCount}`)
  } else{
    tabSwitchCount+=1
  }
})

// To assign event
const startEvent = new Event("start");

// To trigger the event Listener
let warning = 1
document.addEventListener("start", () => {
  const isAtMaxWidth = screen.availWidth - window.innerWidth === 0
  const isMaximizedAndDefaultZoom = isAtMaxWidth;
  if(!isMaximizedAndDefaultZoom){
      alert(`Please Close all other Browser tabs and maximize your browser. Warning ${warning}`)
      warning++
      if(warning === 4){
        alert("You have been disqualified as not followed instructions")
        window.close()
      }
  }
});



function countdown( elementName, minutes, seconds )
{
    var element, endTime, hours, mins, msLeft, time;

    function twoDigits( n )
    {
        return (n <= 9 ? "0" + n : n);
    }

    function updateTimer()
    {
        msLeft = endTime - (+new Date);
        if ( msLeft < 1000 ) {
            element.innerHTML = "Time is up!";
            setTimeout(() => {
              window.close()
            }, 3000)
            alert("Times Up You. Click On Ok then you will be redirecting in 3 seconds")
        } else {
            time = new Date( msLeft ); 
            hours = time.getUTCHours();
            mins = time.getUTCMinutes();
            element.innerHTML = (hours ? hours + ':' + twoDigits( mins ) : mins) + ':' + twoDigits( time.getUTCSeconds() );
            setTimeout( updateTimer, time.getUTCMilliseconds() + 500 );
        }
    }

    element = document.getElementById( elementName );
    endTime = (+new Date) + 1000 * (60*minutes + seconds) + 500;
    updateTimer();
}



function call50(){
  let num1 = Math.floor(Math.random() * 4);
  let num2 = Math.floor(Math.random() * 4);

  if(num1 === num2){
    num2 = Math.floor(Math.random() * 4);
  }

  setStatusClass(Array.from(answerButtonsElement.children)[num2], Array.from(answerButtonsElement.children)[num2].dataset.correct)
  setStatusClass(Array.from(answerButtonsElement.children)[num1], Array.from(answerButtonsElement.children)[num1].dataset.correct)
  document.querySelector(".life1").setAttribute('onclick','disabled')
}