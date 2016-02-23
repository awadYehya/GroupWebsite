var express = require('express');
var fs = require('fs');
var bodyParser = require('body-parser');

var ChatServer = require('./CloudChat/ChatServer');
var syllabus = require('./Syllabus/syllabus');

//setup the root path
var root = __dirname;
ChatServer.gettool.root = root;
syllabus.gettool.root = root;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.set("jsonp callback", true);

app.get('/', function (req, res) {
    fs.readFile('home.html', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        res.send(data);
    });
});
app.get('/about.html', function (req, res) {
    fs.readFile('about.html', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        res.send(data);
    });
});
app.get('/side.html', function (req, res) {
    fs.readFile('side.html', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        res.send(data);
    });
});
app.get('/clock.js', function (req, res) {
    fs.readFile('clock.js', 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        res.send(data);
    });
});

app.use('/EvalTool', express.static('EvalTool'));

app.get('/ThreeRegion/*', threeregion);

function threeregion(req, res) {
    var fileName = root + req.path;
    res.sendFile(fileName, function (err) {
        if (err) {
            console.log(err);
            res.status(err.status).end();
        } else {
            console.log('Sent:', req.path);
        }
    });
}

app.get('/CloudChat/*', ChatServer.gettool);
app.get('/Syllabus/*', syllabus.gettool);


app.listen(8080, function () {
    console.log('Server running at http://127.0.0.1:8080/');
});

// QUIZ

var Question = function (question, option1, option2, option3, option4, answerNum) {
    return {
        q: question,
        options: [option1, option2, option3, option4],
        ansIndex: answerNum
    };
};

var allQuestions = [
    new Question("Which built-in method returns the string representation of the number's value?", "toValue()", "toNumber()", "toString()", "None of the above.", 3),

    new Question("Which of the following is correct about features of JavaScript?", "JavaScript is is complementary to and integrated with HTML.", "JavaScript is open and cross-platform.", "Both of the above.", "All of the above.", 3),

    new Question("The behavior of the instances present of a class inside a method is defined by", "Method", "Classes", "Interfaces", "Classes and Interfaces", 2),

    new Question("Which built-in method reverses the order of the elements of an array?", "changeOrder(order)", "reverse()", "sort(order)", "None of the above.", 2),

    new Question("Which of the following is the correct syntax to create a cookie using JavaScript?", "document.cookie = 'key1 = value1; key2 = value2; expires = date’;", "browser.cookie = 'key1 = value1; key2 = value2; expires = date’;", "window.cookie = 'key1 = value1; key2 = value2; expires = date’;", "navigator.cookie = 'key1 = value1; key2 = value2; expires = date’;", 1),

    new Question("Which of the following function of String object causes a string to be displayed as struck-out text, as if it were in a <strike> tag?", "sup()", "small()", "strike()", "sub()", 3),

    new Question("Which of the following function of Array object removes the first element from an array and returns that element?", "reverse()", "shift()", "slice()", "some()", 2),

    new Question("Which of the following is a valid type of function javascript supports?", "named function", "anonymous function", "Both of the above.", "unknown function.", 3),

    new Question("Which built-in method returns the character at the specified index?", "characterAt()", "getCharAt()", "charAt()", "None of the above.", 3),

    new Question("Which built-in method returns the characters in a string beginning at the specified location?", "substr()", "getSubstring()", "slice()", "None of the above.", 1)
];

// Calculates the score
var getScore = function (results) {
    var score = 0;
    for (var i = 0; i < results.length; i += 1) {
        if (typeof results[i].selected === "number") {
            if (results[i].selected+1 === allQuestions[i].ansIndex) {
                score++;
            }
        }
    }
    return score;
}

// Sending the client the questions (WITH NO ANSWERS)
app.get('/questions', function (req, res) {
    console.log("QUIZ: QUIZ STARTED");
    var noAnswerQuestions = JSON.parse(JSON.stringify(allQuestions));
    noAnswerQuestions.forEach(function (v) {
        delete v.ansIndex
    });
    res.send(noAnswerQuestions);
});

var currentQuizState;

// Sending
app.post('/saveQuestions', function (req, res) {
    currentQuizState = req.body;
    console.log("QUIZ: SAVED CURRENT STATE");
    res.send(null);
});

// Receiving the final submission
app.get('/submission', function (req, res) {
    var score = getScore(currentQuizState);
    console.log("QUIZ: FINAL SUBMISSION - SUBMITTED");
    console.log("QUIZ: SCORE " + score);
    var elsendo = {};
    elsendo.score = score;
    res.send(elsendo);
});