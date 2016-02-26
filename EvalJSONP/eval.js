
// Evaluation quiz client-side

function getJSONP(url, handler) {
    var cbnum = "cb" + getJSONP.counter++;
    var cbname = "getJSONP." + cbnum;
    if (url.indexOf("?") === -1) {
        url += "?callback" + cbname;
    } else {
        url += "&callback" + cbname;
    }
    var script = document.createElement("script");
    getJSONP[cbnum] = function(response) {
        try {
            handler(response);
        } finally {
            delete getJSONP[cbnum];
            script.parentNode.removeChild(script);
        }
    };
    script.src = url;
    document.body.appendChild(script);
}
getJSONP.counter = 0;

function log(msg) {
    console.log(msg);
}

var clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};

// Define quiz class

var _unmodified = []; // original questions at the start (without selected property)

window.quiz = (function () {
    /* PRIVATE */
    var _questions = [];
    var _currentQuestionIndex = -1;
    var _currentQuestion = {};
    var _quizPosLabel = "n/a";
    var _initialized = false;
    var _score = 0;
    var _userID = null;
    // updates the label ex. 2/10
    var _updateLabelPos = function () {
        _quizPosLabel = (_currentQuestionIndex + 1) + "/" + _questions.length;
    };
    // BABY
    var _submitQuiz = function () {

    };
    /* PUBLIC */
    return {
        // Starts the quiz
        start: function () {
            if (_initialized) {
                log("Started Quiz");
                this.loadFromLocalStorage();
                this.onStartQuiz();
            } else {
                throw Error("Must initialize with a question set first!");
            }
        },
        // Ends the quiz
        end: function () {
            log("Ended Quiz");
            this.onEndQuiz();
        },
        // Sets the questions
        initQuestions: function (qs) {
            if (qs.length > 1) {
                log("Initialized Questions");
                _questions = clone(qs);
                _currentQuestionIndex = 0;
                _currentQuestion = _questions[0];
                _initialized = true;
                _updateLabelPos();
                this.showQuestion(_currentQuestion, _currentQuestionIndex);
                this.onFirstQuestion();
            } else {
                throw Error("Must initialize with at least 2 questions.");
            }
        },
        // Moves to the next question
        nextQuestion: function () {
            if (_currentQuestionIndex < _questions.length - 1) {
                _currentQuestionIndex++;
                _currentQuestion = _questions[_currentQuestionIndex];
                _updateLabelPos();
                this.showQuestion(_currentQuestion, _currentQuestionIndex);
                if (_currentQuestionIndex === _questions.length - 1) {
                    this.onLastQuestion();
                } else {
                    this.onMiddleQuestion();
                }
            }
        },
        // Goes to the previous question
        prevQuestion: function () {
            if (_currentQuestionIndex > 0) {
                _currentQuestionIndex--;
                _currentQuestion = _questions[_currentQuestionIndex];
                _updateLabelPos();
                this.showQuestion(_currentQuestion, _currentQuestionIndex);
                if (_currentQuestionIndex === 0) {
                    this.onFirstQuestion();
                } else {
                    this.onMiddleQuestion();
                }
            }
        },
        // Returns current question
        getCurrentQuestion: function () {
            return _currentQuestion;
        },
        // returns all questions array
        getAllQuestions: function () {
            return _questions;
        },
        // Returns true if all are selected.
        isAllSelected: function () {
            var selectedCount = 0;
            for (var i = 0; i < _questions.length; i += 1) {
                if (typeof _questions[i].selected === "number") {
                    selectedCount++;
                }
            }
            if (selectedCount === _questions.length) {
                return true;
            } else {
                return false;
            }
        },
        getCurrentQuestionIndex: function () {
            return _currentQuestionIndex;
        },
        // When selected a answer for current question
        setSelected: function (indx) {
            _currentQuestion.selected = parseInt(indx);
            _questions[_currentQuestionIndex].selected = parseInt(indx);
            log("Set selected: " + indx);
            this.saveToLocalStorage();
        },
        // gets 1/10 label ex.
        getLabelPos: function () {
            return _quizPosLabel;
        },
        /* Saving/Managing data */
        sendToServer: function () {
            var http = new XMLHttpRequest(); // new HttpRequest instance 
            http.open("POST", "/saveQuestions");
            http.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            http.send(JSON.stringify(_questions));
        },
        // Save options to the page
        saveToLocalStorage: function () {
            localStorage.setItem('quiz-state', JSON.stringify(_questions));
        },
        // Loads selected options
        loadFromLocalStorage: function () {
            if (localStorage.getItem("quiz-state") !== null) {
                log("Loaded selections from previous session...");
                _questions = JSON.parse(localStorage.getItem("quiz-state"));
                this.initQuestions(_questions);
            }
        },
        // Clears stored selections
        clearLocalStorage: function () {
        localStorage.clear();
        this.initQuestions(_unmodified);
    },
    /* EVENT VARS! */
    /* These can be set by users, they're like onClick */
    onLastQuestion: function () {},
    // When user naviagtes to first question
    onFirstQuestion: function () {},
    // When the quiz is started
    onStartQuiz: function () {},
    // When the quiz ends
    onEndQuiz: function () {},
    // When the user navigates to a middle question.
    onMiddleQuestion: function () {},
    /* Draws/Shows the question */
    // needs to be set by the user
    showQuestion: function (qs, num) {},
    /* MANAGE SCORE */
    setScore: function (scr) {
        _score = scr;
    },
    getScore: function() {
            return _score;
        },
        initUserID: function(uid) {
            _userID = uid;
        },
        getUserID: function () {
            return _userID;
        }
    };
})();

// Add event listeners

var startQuizButton = document.querySelector("#button-start");
var nextQuizButton = document.querySelector("#button-next");
    var prevQuizButton = document.querySelector("#button-previous");
    var saveSelectionsButton = document.querySelector("#button-save");
    var clearSavedSelectionsButton = document.querySelector("#button-clear");
    var quizRadioButtons = document.querySelectorAll("#quiz-form > input[type='radio']");
    var sendEmailButton = document.querySelector("#button-send-email");
    startQuizButton.style.display = "none";
    nextQuizButton.style.display = "none";
    prevQuizButton.style.display = "none";
    saveSelectionsButton.style.display = "none";
clearSavedSelectionsButton.style.display = "none";
sendEmailButton.style.display = "none";

// When the quiz starts do..
quiz.onStartQuiz = function () {
var sframe = parent.frames.sframe;
document.querySelector("#eval-start").style.display = "none";
document.querySelector("#eval-quiz").style.display = "inline";
sframe.document.getElementById("Email").disabled = true;
};

// When the quiz ends do..
quiz.onEndQuiz = function () {
    quiz.sendToServer();
    console.log("ENDING QUIZ");
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
        var score = JSON.parse(xmlHttp.responseText);
        console.log(xmlHttp.responseText);
    document.querySelector("#eval-score").innerHTML = score.score;
    document.querySelector("#eval-quiz").style.display = "none";
        document.querySelector("#eval-end").style.display = "inline";
        document.querySelector("#email-score").value = score.score;
    quiz.setScore(score.score);
}
    var sframe = parent.frames.sframe;
    sframe.document.getElementById("Email").disabled = false;
};
xmlHttp.open("GET", "/submission", true); // true for asynchronous
xmlHttp.send(null);
};

// This is what actually displays the question to the user.
quiz.showQuestion = function (qs, index) {
    log("Showing question: ");
    log(qs);
    var qnum = document.querySelector("#quiz-question-number");
var qques = document.querySelector("#quiz-question");
var qopts = document.querySelectorAll(".quiz-opt");
var qlabelPos = document.querySelector("#label-quiz-position");
var qform = document.querySelector("#quiz-form");

// RESET SELECTION
qform.reset();
// INJECT IT
qnum.innerHTML = index + 1;
qques.innerHTML = qs.q;
for (var i = 0; i < qopts.length; i += 1) {
    qopts[i].innerHTML = qs.options[i];
}
    qlabelPos.innerHTML = quiz.getLabelPos();
    if (typeof qs.selected == "number") {
        quizRadioButtons[qs.selected].checked = true;
    }
};
// What happens when you press start quiz
startQuizButton.onclick = function () {
    // GET THE QUIZ FROM THE SERVER
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            var resonse = JSON.parse(xmlHttp.responseText);
            _unmodified = clone(resonse.questions);
            quiz.initQuestions(resonse.questions);
            quiz.initUserID(resonse.userID);
            quiz.start();
            console.log("Got questions from server..");
        }
    };
    xmlHttp.open("GET", "/questions", true); // true for asynchronous 
    xmlHttp.send(null);
};
// next/submission button
nextQuizButton.onclick = function () {
    if (this.innerHTML == "SUBMISSION") {
        if (quiz.isAllSelected()) {
            // if done with quiz
            var sure = confirm("Are you sure you want to submit?");
            if (sure) {
                quiz.end();
            }
        } else {
            alert("You must complete all questions! Guess if you don't know!");
        }
    }
    quiz.nextQuestion();
    quiz.sendToServer();
};
// previous question button
prevQuizButton.onclick = function () {
    quiz.prevQuestion();
};
clearSavedSelectionsButton.onclick = function () {
    quiz.clearLocalStorage();
    quiz.initQuestions(_unmodified);
};
// On last questions
quiz.onFirstQuestion = function () {
var sframe = parent.frames.sframe;
sframe.document.getElementById("Previous").disabled = true;
sframe.document.getElementById("Submit").disabled = true;
sframe.document.getElementById("Next").value = "NEXT";
sframe.document.getElementById("Next").classList.add("button");
sframe.document.getElementById("Next").classList.remove("button-primary");
};

// On the middle question
quiz.onMiddleQuestion = function () {
var sframe = parent.frames.sframe;
sframe.document.getElementById("Previous").disabled = false;
sframe.document.getElementById("Submit").disabled = true;
sframe.document.getElementById("Next").value = "NEXT";
sframe.document.getElementById("Next").classList.add("button");
sframe.document.getElementById("Next").classList.remove("button-primary");
};

// When at the last question
quiz.onLastQuestion = function () {
var sframe = parent.frames.sframe;
sframe.document.getElementById("Previous").disabled = false;
sframe.document.getElementById("Submit").disabled = false;
sframe.document.getElementById("Next").value = "SUBMISSION";
sframe.document.getElementById("Next").classList.remove("button");
sframe.document.getElementById("Next").classList.add("button-primary");
};

// Set onclicks for the radio buttons
for (var i = 0; i < quizRadioButtons.length; i += 1) {
    quizRadioButtons[i].onclick = function () {
        quiz.setSelected(this.value);
        quiz.sendToServer();
    };
};

document.getElementById("email-form").addEventListener("submit", function () {
    document.querySelector("#eval-end").style.display = "none";
    document.querySelector("#eval-sent").style.display = "inline";
});

sendEmailButton.onclick = function () {
    document.querySelector("#eval-end").style.display = "none";
    document.querySelector("#eval-sent").style.display = "inline";
};