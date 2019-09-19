/*****************************************************
 * Trivia Game JS
 * @package TriviaGame
 * @author Christopher Collins
 * @version 2.0
 * @license none (public domain)
 * 
 * NOTE: the variables QUESTIONS and ANSWERS must be predefined in app-data.js
 * ===============[ TABLE OF CONTENTS ]===============
 * 0. Globals
 * 1. Functions
 *   1.1 generateRandomNumber
 *   1.2 shuffle_array
 *   1.3 runEffect
 *   1.4 createQuestion
 *     1.4.1 ANSWER IMAGE
 *     1.4.2 POSSIBLE ANSWERS
 *     1.4.3 See if question has already been graded
 *     1.4.4 COMBINED Answer Image with Possible Answers
 *     1.4.5 COMBINED Answer Block with the question
 * 
 *   1.5 checkAnswer
 *     1.5.1 Fetch Submitted Answer
 *     1.5.2 See if the answer is right
 *     1.5.3 Save Results weather it was right or wrong.
 *     1.5.4 Update HTML to reflect right and wrong answers
 *     1.5.5 Calculate the score so far
 *     1.5.6 Display Game Alert and Update Game Controls
 * 
 *   1.6 nextQuestion
 *   1.7 previousQuestion
 *   1.8 newGame
 *     1.8.1 Reset Globals
 *     1.8.2 Generate First question
 *     1.8.3 Set Quiz Progress to 0%
 *     1.8.4 Reset Progress Bars and game alerts
 * 
 * 2. Document Ready
 *   2.1 Generate the first question
 *   2.2 Make so only one question can be selected.
 *   2.3 Set Quiz Progress to 0%
 *   2.4 Set Up Clickable elements
 * 
 * @todo
 * -Add Timer on questions that auto-grades and moves on to the next question.
 * -Add Score Page
 * -Add New Game Feature
 * -Decide if I really need PreviousQuestion or not...and when to show it if I keep it. 
 * 
 * @done 
 * -Make so once the question has been graded the answer can't be changed.
 * -Detect if question has already been answered when viewing previous_question. 
 * -Update Correct/Wrong/Unanswered?
 * -Add Pictures and Questions
 * -Switch Score and % progress circle...maybe show a progress bar at the top instead. 
 *****************************************************/
/* ===============[ 0. GLOBALS ]======================*/
var SCORE = new Array(QUESTIONS.length);             // Empty array of booleans representing right/wrong answers to the questions.
var SUBMITTED_ANSWERS = new Array(QUESTIONS.length); // Empty array of integers representing answers index.
var QUIZ_PROGRESS = $('.loader');

/* ===============[ 1. FUNCTIONS ]====================*/
/**
 * 1.1 generateRandomNumber
 * @param {int} min 
 * @param {max} max 
 */
function generateRandomNumber(min = 0, max = 10) {
  return Math.floor(Math.random() * Math.floor(+max - +min)) + +min;
}

/**
 * 1.2 shuffle_array
 * @param {array} some_array
 * @return {array} some_array - returns the shuffled version. 
 */
function shuffle_array(some_array){
  return some_array.sort( () => Math.random() - 0.5);
}

/**
 * 1.3 runEffect
 * Runs an effect on the given element. 
 * NOTE: this function depends on the following script links,
 * <script src="https://code.jquery.com/jquery-1.12.4.js"></script>
 * <script src="https://code.jquery.com/ui/1.12.1/jquery-ui.min.js" integrity="sha256-VazP97ZCwtekAsvgPBSUwPFKdrwD3unUfSGVYrahUqU=" crossorigin="anonymous"></script>
 * 
 * @param {element} element 
 * @param {string}  selectedEffect 
 */
function runEffect(element,selectedEffect="pulsate") {
  // Most effect types need no options passed by default
  var options = {};

  // some effects have required parameters
  if ( selectedEffect === "scale" ) {
    options = { percent: 50 };
  } else if ( selectedEffect === "transfer" ) {
    options = { to: "#button", className: "ui-effects-transfer" };
  } else if ( selectedEffect === "size" ) {
    options = { to: { width: 200, height: 60 } };
  }

  // Run the effect
  element.effect( selectedEffect, options, 500, setTimeout(function(){
    element.removeAttr( "style" ).hide().fadeIn();
  }, 2 * 1000));
}; // END runEffect()

/**
 * 1.4 createQuestion
 * 
 * @param {object} Q - question object with the properties: question, image, answer, wrong, topic, subtopic
 * @param {array}  A - array of all possible answers. These will be referenced by index from the question object.
 * @param {string} questionNumber - Represents the current question number. NOTE: question array index is questionNumber-1
 * @return {html}  question
 */
var createQuestion = function(Q,A,questionNumber){
  var question = $("<li>").text(Q.question).addClass("list-group-item question");
  var answer_block = $("<div>").addClass("row");

  // 1.4.1 ANSWER IMAGE
  var answer_image = $("<img>").addClass("img-thumbnail rounded-circle");
  answer_image.attr("src",Q.image);
  answer_image.attr("alt",Q.topic+" - "+Q.subtopic);
  answer_image = $("<span>").addClass("image_wrap").html(answer_image);
  answer_image = $("<div>").addClass("col-4 align-self-center text-right answer_image").html(answer_image);
  answer_block.append(answer_image);

  // 1.4.2 POSSIBLE ANSWERS
  var answers = $("<div>").addClass("col-8 answers");
  answers.append($("<ul>").addClass("list-group"));

  var random_answer_index = generateRandomNumber(0,Q.answer.length);
  var possible_answers = [];
  possible_answers.push(Q.answer[random_answer_index]);
  possible_answers = $.merge(possible_answers,Q.wrong);

  // Shuffle the possible answers so the correct answer is not always the first one. 
  possible_answers = shuffle_array(possible_answers);

  var check_answer_element = false;
  var correct_answer_text = false;
  for(var i=0; i < possible_answers.length; i++ ){
    var answer_option = $("<li>").addClass("list-group-item");
    answer_option.html($("<div>").addClass("custom-control custom-checkbox mr-sm-2"));

    var answer_input = $("<input>").attr("type","checkbox").addClass("custom-control-input").attr("id","answer"+i).attr("data-answer-index",possible_answers[i]);
    var answer_label = $("<label>").addClass("custom-control-label").attr("for","answer"+i).attr("data-answer-index",possible_answers[i]).text(A[possible_answers[i]]);
     
    // 1.4.3 See if question has already been graded
    if(SCORE[questionNumber-1] !== undefined){
      // This question has already been graded
      answer_input.attr("disabled","true");

      if(possible_answers[i] === SUBMITTED_ANSWERS[questionNumber-1]){
        // Users Submitted Answer
        answer_input.attr("checked","true");
        
        if(QUESTIONS[questionNumber-1].answer.indexOf(SUBMITTED_ANSWERS[questionNumber-1]) !== -1){ 
          // They got it right!
          answer_label.addClass("right-answer");
          check_answer_element = $("<i>").addClass("far fa-check-circle fa-4x").attr("id","correct_answer");
          gameAlert("You are correct!","success");

        }else{ // They got it wrong
          answer_label.addClass("wrong-answer");
          check_answer_element = $("<i>").addClass("far fa-times-circle fa-4x").attr("id","wrong_answer");
        }

      }else{ // NOT their answer
        if(QUESTIONS[questionNumber-1].answer.indexOf(possible_answers[i]) !== -1){ 
          // This is the correct Answer
          answer_label.addClass("right-answer");
          correct_answer_text = answer_label.text();
        }
      }
    } // END if already graded
    
    answer_option.find(".custom-control").append(answer_input, answer_label);  
    answers.find(".list-group").append(answer_option);
  } // END for(var i=0; i < possible_answers.length; i++ ){

  if(correct_answer_text !== false){
    gameAlert("I'm sorry that is incorrect. The correct answer was <strong>" + correct_answer_text + "</strong>", "danger");
  }

  // Reset gameAlert if question has not been graded.
  if(check_answer_element === false){
    gameAlert();
  }

  // 1.4.4 COMBINED Answer Image with Possible Answers
  answer_block.append(answers);
  answer_block = $("<li>").addClass("list-group-item answer_block").append(answer_block);

  // 1.4.5 COMBINED Answer Block with the question
  question = $("<ul>").addClass("list-group text-left").append(question);

  var q_counter = $("<h3>").text("Question " + questionNumber + " of " + QUESTIONS.length);
  q_counter = $("<li>").addClass("list-group-item question_counter").attr("data-start",(questionNumber - 1)).attr("data-end",(QUESTIONS.length-1)).html(q_counter);
  q_counter = (Q.subtopic !== "") ? q_counter.append($("<small>").text("Topics: " + Q.topic + ", " + Q.subtopic)) : q_counter.append($("<small>").text("Topic: " + Q.topic));
  question.prepend(q_counter);
  question.append(answer_block);

  // Add Game Controls if question was already graded
  if(SCORE[questionNumber-1] !== undefined){
    var next_question_element = $("<i>").addClass("far fa-arrow-alt-circle-right fa-4x").attr("id","next_question");
    var previous_question_element = $("<i>").addClass("far fa-arrow-alt-circle-left fa-4x").attr("id","previous_question");
    
    if(check_answer_element === false){
      check_answer_element = $("<i>").addClass("far fa-question-circle fa-4x").attr("id","check_answer");
    }

    // Detect if this is the FIRST question
    if(questionNumber === 1){
      previous_question_element = "";

    }else if(SCORE.length === questionNumber){ 
      // Detect if this is the LAST question
      next_question_element = "";
    }

    $(".quiz_controls .check_answer").html(check_answer_element);
    $(".quiz_controls .next_question").html(next_question_element);
    $(".quiz_controls .previous_question").html(previous_question_element);

  }else{ // Not Graded so remove controls...and set timer
    $(".quiz_controls .check_answer").empty();
    $(".quiz_controls .next_question").empty();
    $(".quiz_controls .previous_question").empty();
  }

  return question;
};

/**
 * 1.5 checkAnswer
 * Depends on the variables QUESTIONS and ANSWERS. 
 * QUESTIONS is an array of objects and ANSWERS is an array of answer strings. 
 */
function checkAnswer(){
  var current_question_index = $(".question_answers .question_counter").data("start");
  var submitted_answer = false;

  /**
   * 1.5.1 Fetch Submitted Answer
   * by looping through the input elements. 
   **/
  $(".question_answers .answers .custom-control-input").each(function(){
    if($(this).is(':checked')){
      submitted_answer = parseInt($(this).data("answer-index"));
    }

    // Immediately disable all possible answers while grading
    $(this).attr("disabled",true); 
  });

  /**
   * 1.5.2 See if the answer is right
   * by searching the Answers array for the submitted answer
   **/
  var matchFound = false;
  if(QUESTIONS[current_question_index].answer.indexOf(submitted_answer) !== -1){
    matchFound = true;
  }

  // 1.5.3 Save Results weather it was right or wrong.
  SCORE[current_question_index] = matchFound;
  SUBMITTED_ANSWERS[current_question_index] = submitted_answer;

  /**
   * 1.5.4 Update HTML to reflect right and wrong answers
   * by looping through the label elements.
   */
  var correct_answer_text = false;
  $(".question_answers .answer_block .custom-control-label").each(function(){
    if(matchFound === true && parseInt($(this).attr("data-answer-index")) === submitted_answer){
      // THIS would be their answer which was right;
      $(this).addClass("right-answer");
      correct_answer_text = $(this).text();

    }else{ // They got the answer wrong so we need to show right and wrong answers

      if(parseInt($(this).attr("data-answer-index")) === submitted_answer){
        // THIS would be their answer which was wrong
        $(this).addClass("wrong-answer");
      }
      
      // This is the correct answer. 
      if(QUESTIONS[current_question_index].answer.indexOf(parseInt($(this).attr("data-answer-index"))) !== -1 ){
        $(this).addClass("right-answer");
        correct_answer_text = $(this).text();
      }
    }
  });

  /**
   * 1.5.5 Calculate the score so far
   * by creating filtered array that only represents completed answers.
   */
  var filtered_score = SCORE.filter(function(el){
    return el != null;
  });

  var right_answers = 0;
  var wrong_answers = 0;
  filtered_score.forEach(function(value){
    if(value){ 
      right_answers++; 
    }else{
      wrong_answers++;
    }
  });

  var total_score = (right_answers/filtered_score.length)*100;
  total_score = total_score.toFixed(0);
  
  // Updated CIRCLE LOADER 
  QUIZ_PROGRESS.setPercent(total_score).draw();

  // Update PROGRESS BARS
  var right_score = ((right_answers/SCORE.length)*100).toFixed(0) + "%";
  var wrong_score = ((wrong_answers/SCORE.length)*100).toFixed(0) + "%";
  $("#game_progress .bg-success").html(right_score + " right");
  $("#game_progress .bg-success").animate({width: right_score}, "slow");
  $("#game_progress .bg-danger").html(wrong_score + " wrong");
  $("#game_progress .bg-danger").animate({width: wrong_score},"slow");

  // 1.5.6 Display Game Alert and Update Game Controls
  var check_answer_element = $("<i>").addClass("far fa-question-circle fa-4x").attr("id","check_answer");
  var next_question_element = $("<i>").addClass("far fa-arrow-alt-circle-right fa-4x").attr("id","next_question");
  var previous_question_element = "";
  if(matchFound === true && correct_answer_text !== false){
    gameAlert("You are correct!","success");
    check_answer_element = $("<i>").addClass("far fa-check-circle fa-4x").attr("id","correct_answer");
  }else{
    gameAlert("I'm sorry that is incorrect. The correct answer was <strong>" + correct_answer_text + "</strong>", "danger");
    check_answer_element = $("<i>").addClass("far fa-times-circle fa-4x").attr("id","wrong_answer");
  }

  // Detect if that was the LAST question
  if(QUESTIONS.length === (current_question_index + 1) ){
    previous_question_element = $("<i>").addClass("far fa-arrow-alt-circle-left fa-4x").attr("id","previous_question");
    next_question_element = "";
  }

  $(".quiz_controls .check_answer").html(check_answer_element);
  $(".quiz_controls .next_question").html(next_question_element);
  $(".quiz_controls .previous_question").html(previous_question_element);

} // END checkAnswer()

/**
 * 1.6 nextQuestion
 * Moves to the next question
 */
function nextQuestion(){
  // Get Current Question information.
  var next_question_index = parseInt($(".question_answers .question_counter").data("start"));
  next_question_index++;
  
  var question_number = (next_question_index + 1);
  var q = createQuestion(QUESTIONS[next_question_index], ANSWERS, question_number);
  $(".question_answers").empty();
  $(".question_answers").append(q);
} 

/**
 * 1.7 previousQuestion
 * Moves to the previous question
 */
function previousQuestion(){
  // Get Current Question information.
  var previous_question_index = parseInt($(".question_answers .question_counter").data("start"));
  previous_question_index--;
  
  var question_number = (previous_question_index + 1);
  var q = createQuestion(QUESTIONS[previous_question_index],ANSWERS,question_number);
  $(".question_answers").empty();
  $(".question_answers").append(q);
}

/**
 * 1.8 newGame
 */
function newGame(){
  // 1.8.1 Reset Globals
  SCORE = new Array(QUESTIONS.length);             
  SUBMITTED_ANSWERS = new Array(QUESTIONS.length);

  // 1.8.2 Generate the first question
  QUESTIONS = shuffle_array(QUESTIONS); // Make sure to only shuffle this ONCE
  var q = createQuestion(QUESTIONS[0],ANSWERS,1);
  $(".question_answers").empty();
  $(".question_answers").append(q);

  /**
   * 1.8.3 Set Quiz Progress to 0%
   * ClassyLoader depends on the following script,
   * <script src="assets/javascript/jquery.classyloader.min.js" type="text/javascript"></script>
   */
  QUIZ_PROGRESS.ClassyLoader({
    animate: false,
    percentage: 0,
    speed: 20,
    fontColor: '#1E2022',
    fontSize: '50px',
    diameter: 80,
    lineColor: '#0092CA',
    remainingLineColor: 'rgba(0, 146, 202, 0.3)',
    lineWidth: 10
  });

  // 1.8.4 Reset Progress Bars and game alerts
  $("#game_progress .bg-success").html("");
  $("#game_progress .bg-success").css("width",0);
  $("#game_progress .bg-danger").html("");
  $("#game_progress .bg-danger").css("width",0);
  gameAlert();
}

/**
 * gameAlert()
 * @param {string} message - Message to go in the alert box
 * @param {string} addThisClass - defaults to empty string. Can be info, danger, or success. 
 */
function gameAlert(message="", addThisClass="info"){
  var alertElement = $("<div>").addClass("col-12 alert").attr("id","alert_message");

  // RESET Alert Message
  if(message === ""){
    $("#main-section .first-row").empty();
    return;
    
  }else if (addThisClass === "info"){ 
    // Default alert
    addThisClass = "alert-info";
    
  }else if (addThisClass === "danger"){
    addThisClass = "alert-danger";
    
  }else if (addThisClass === "success"){
    addThisClass = "alert-success";
  }
  
  // IF same alert message keeps getting spammed then add ! and change color red
  if( $("#alert-messages").html() !== undefined && $("#alert-messages").html() === message ){
    message += "!";
    addThisClass = "alert-danger";
  }
  
  // Add the new class
  alertElement.addClass(addThisClass);
  
  // Display the alert message
  alertElement.html(message);
  $("#main-section .first-row").html(alertElement);
  return;
}

/**
 * 2. Document Ready
 */
$(document).ready(function() {
  // 2.1 Generate the first question
  QUESTIONS = shuffle_array(QUESTIONS); // Make sure to only shuffle this ONCE
  var q = createQuestion(QUESTIONS[0],ANSWERS,1);
  $(".question_answers").append(q);

  /**
   * 2.2 Make so only one question can be selected.
   * which must be done through event delegation using .on() delegated-events approach for this to work after dom manipulation.
   */
  $('.question_answers').on('change', '.custom-control-input', function() {
    $('.custom-control-input').prop('checked', false);
    $(this).prop('checked', true);
    
    // Create Check Answer Element if it does not exist
    if($("#check_answer").length === 0){
      var check_answer_element = $("<i>").addClass("far fa-question-circle fa-4x").attr("id","check_answer");
      $(".quiz_controls .check_answer").html(check_answer_element);
    }
    
  });
  
  /**
   * 2.3 Set Quiz Progress to 0%
   * ClassyLoader depends on the following script,
   * <script src="assets/javascript/jquery.classyloader.min.js" type="text/javascript"></script>
   */
  QUIZ_PROGRESS.ClassyLoader({
    animate: false,
    percentage: 0,
    speed: 20,
    fontColor: '#1E2022',
    fontSize: '50px',
    diameter: 80,
    lineColor: '#0092CA',
    remainingLineColor: 'rgba(0, 146, 202, 0.3)',
    lineWidth: 10
  });
  
  // 2.4 Set Up Clickable elements
  $('.quiz_controls').on('click', '#check_answer', function() {
    checkAnswer();
  });
  
  $('.quiz_controls').on('click', '#next_question', function() {
    nextQuestion();
  });
  
  $('.quiz_controls').on('click', '#previous_question', function() {
    previousQuestion();
  });
  
  $("#new-game").click(function(e){
    e.preventDefault();
    newGame();
  });
}); // END $(document).ready(function() {