//Define the url to make requests to
const reqURL = "http://localhost:3000/"
//Identifes the current question being answered
var questionNumber = 0
//Stores the number of questions avaliable
var numberOfQuestions = 0
//Stores the uestion objects
var questions = {}
//Stores all the data about the question currently being answered
var currentQuestion = {}
//This function starts the memory game by hiding the start screen
$( "#btnStart" ).click(function() {
    $( "#buttons" ).fadeOut( "slow", function() {
        // Animation complete.
        $.get(
            reqURL +"questions",
            
            function(data) {
               questions = data
               console.log(questions)
               numberOfQuestions = Object.entries(questions).length
               currentQuestion = Object.entries(questions)[questionNumber]
               console.log(currentQuestion)
               displayQuestion(currentQuestion[0], currentQuestion[1])

            }
        );
      });
  });
//This function displays the current question to the user by making the previously hidden elements visible
  function displayQuestion(key, question)
  {
    var src = reqURL + key + "/image"
    show_image(src, 600, 400, "image")
    console.log(question)
    document.getElementById("questionText").innerHTML = question.question.question;
    $("#questionText").show()

    document.getElementById("btnA").innerHTML = 'A: ' + question.question.answerA.text
    document.getElementById("btnB").innerHTML = 'B: ' + question.question.answerB.text
    document.getElementById("btnC").innerHTML = 'C: ' + question.question.answerC.text
    $("#nextQuestion").hide()

    $("#btnA").show()
    $("#btnB").show()
    $("#btnC").show()
    $("#btnHint").show()
  }
  //This function displays the photo to the player
  function show_image(src, width, height, alt) {
    var img = document.createElement("img");
    img.src = src;
    img.width = width;
    img.height = height;
    img.alt = alt;
    img.id = 'photo'
    img.className = "img-fluid rounded shadow-sm mx-auto d-block w-50 h-50"
    // This next line will just add it to the <body> tag
    document.body.appendChild(img);
}
/**
 * The following functions bind to the answer buttons and determine which answer was selected and whethet it was right 
 * or wrong. 
 */
$('#btnA').click(function() 
{
    console.log(currentQuestion)
    if(currentQuestion[1].question.answerA.isCorrect)
    {
        answerCorrect()
    }
    else
    {
        answerIncorrect()
    }
})
$('#btnB').click(function() 
{
    console.log(currentQuestion)
    if(currentQuestion[1].question.answerB.isCorrect)
    {
        answerCorrect()
    }
    else
    {
        answerIncorrect()
    }
})
$('#btnC').click(function() 
{
    console.log(currentQuestion)
    if(currentQuestion[1].question.answerC.isCorrect)
    {
        answerCorrect()
    }
    else
    {
        answerIncorrect()
    }
})
//This function displays the hint if the user clicks the hint button
$('#btnHint').click(function()
{
    document.getElementById("hint").innerHTML = currentQuestion[1].question.hint
    $('#hint').show()
})
//This function updates the server if the user answered a question correctly
function answerCorrect()
{
    $("#btnA").hide()
    $("#btnB").hide()
    $("#btnC").hide()
    $("#questionText").hide()
    $("#nextQuestion").show()
    document.getElementById("photo").remove()
    document.body.classList.add('bg-success');
    document.getElementById("title").innerHTML = 'Correct!'
    var url = reqURL + "answeredQuestion/" + currentQuestion[0] + "/true"
    $.get( url, function( data ) {
        //alert( "Load was performed." );
      });
}
//This function updates the server if the user answered a question incorrectly
function answerIncorrect()
{
    $("#btnA").hide()
    $("#btnB").hide()
    $("#btnC").hide()
    $("#nextQuestion").show()
    document.getElementById("photo").remove()
    document.body.classList.add('bg-danger');
    document.getElementById("title").innerHTML = 'Incorrect';
    document.getElementById("questionText").innerHTML = 'The correct answer was: ' + getCorrectAnswer()
    var url = reqURL + "answeredQuestion/" + currentQuestion[0] + "/false"
    $.get( url, function( data ) {
        //$( ".result" ).html( data );
        //alert( "Load was performed." );
      });


}
//This function advances the game to the next question when the user clicks next question
$('#nextQuestion').click(function()
{
    document.body.classList.remove('bg-success');
    document.body.classList.remove('bg-danger');

    if(questionNumber < numberOfQuestions-1)
    {
        questionNumber++
        currentQuestion = Object.entries(questions)[questionNumber]
        displayQuestion(currentQuestion[0], currentQuestion[1])
    }
    else
    {
        document.getElementById("title").innerHTML = 'End of memory game';
        document.getElementById("nextQuestion").innerHTML = 'Finish';
        $('#nextQuestion').click(function(){
            window.location = 'index.html'
        })

    }

})
//This function is used to determine which answer is correct
function getCorrectAnswer()
{
    if (currentQuestion[1].question.answerA.isCorrect)
    {
        return currentQuestion[1].question.answerA.text
    }
    if (currentQuestion[1].question.answerB.isCorrect)
    {
        return currentQuestion[1].question.answerB.text
    }
    if (currentQuestion[1].question.answerC.isCorrect)
    {
        return currentQuestion[1].question.answerC.text
    }
}