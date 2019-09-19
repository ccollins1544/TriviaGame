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
 *   1.1 generateRandomNumber()
 *   1.2 shuffle_array()
 *   1.3 runEffect()
 *   1.4 createQuestion()
 *     1.4.1 ANSWER IMAGE
 *     1.4.2 POSSIBLE ANSWERS
 *     1.4.3 See if question has already been graded
 *     1.4.4 COMBINED Answer Image with Possible Answers
 *     1.4.5 COMBINED Answer Block with the question
 *     1.4.6 Add Game Controls if question was already graded
 *     1.4.7 Start Countdown Timer
 * 
 *   1.5 checkAnswer()
 *     1.5.1 Fetch Submitted Answer
 *     1.5.2 See if the answer is right
 *     1.5.3 Save Results weather it was right or wrong.
 *     1.5.4 Update HTML to reflect right and wrong answers
 *     1.5.5 Calculate the score so far
 *     1.5.6 Update PROGRESS BARS
 *     1.5.7 Display Game Alert and Update Game Controls
 * 
 *   1.6 nextQuestion()
 *   1.7 previousQuestion()
 *   1.8 newGame()
 *     1.8.1 Reset Globals
 *     1.8.2 Show Ready Screen
 *     1.8.3 Set Quiz Progress to 0%
 *     1.8.4 Reset Progress Bars and game alerts
 * 
 *   1.9 gameAlert()
 *   1.10 showReadyScreen()
 * 
 * 2. Timer Object
 *   2.1 reset
 *   2.2 start
 *   2.3 startCountDown
 *   2.4 stop
 *   2.5 count
 *   2.6 countDown
 *   2.7 timeConverter
 * 
 * 3. Document Ready
 *   3.1 Show Ready Screen
 *   3.2 Make so only one question can be selected.
 *   3.3 Set Quiz Progress to 0%
 *   3.4 Set Up Clickable elements
 *     3.4.1 #check_answer click function
 *     3.4.2 #next_question click function
 *     3.4.3 #previous_question click function
 *     3.4.4 .show_question click function
 *     3.4.5 #start-btn click function
 *     3.4.6 #new-game click function
 *****************************************************/
/* ===============[ 0. GLOBALS ]======================*/
var SCORE = new Array(QUESTIONS.length);             // Empty array of booleans representing right/wrong answers to the questions.
var SUBMITTED_ANSWERS = new Array(QUESTIONS.length); // Empty array of integers representing answers index.
var QUIZ_PROGRESS = $('.loader');
var TIMER_SECONDS = 24;

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
 * @param {integer} duration_seconds 
 * @param {string}  selectedEffect 
 */
function runEffect(element, duration_seconds=2, selectedEffect="pulsate") {
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
  element.effect( selectedEffect, options, ( (duration_seconds * 1000)/4 ), setTimeout(function(){
    element.removeAttr( "style" ).hide().fadeIn();
  }, duration_seconds * 1000));
} // END runEffect()

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

  // 1.4.6 Add Game Controls if question was already graded
  if(SCORE[questionNumber-1] !== undefined){
    var next_question_element = $("<i>").addClass("far fa-arrow-alt-circle-right fa-4x").attr("id","next_question").attr("title","Next Question");
    var previous_question_element = $("<i>").addClass("far fa-arrow-alt-circle-left fa-4x").attr("id","previous_question").attr("title","Previous Question");
    
    if(check_answer_element === false){
      check_answer_element = $("<i>").addClass("far fa-question-circle fa-4x").attr("id","check_answer").attr("title","Submit Answer");
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

    if($("#check_answer").length !== 0 ){
      $("#check_answer").hide();
    }else{
      $(".quiz_controls .check_answer").empty();
    }
    
    $(".quiz_controls .next_question").empty();
    $(".quiz_controls .previous_question").empty();

    // 1.4.7 Start Countdown Timer
    Timer.reset();
    Timer.startCountDown();
  }

  return question;
} // END createQuestion()

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

  // 1.5.6 Update PROGRESS BARS
  var right_score = ((right_answers/SCORE.length)*100).toFixed(0) + "%";
  var wrong_score = ((wrong_answers/SCORE.length)*100).toFixed(0) + "%";
  $("#game_progress .bg-success").html(right_score + " right");
  $("#game_progress .bg-success").animate({width: right_score}, "slow");
  $("#game_progress .bg-danger").html(wrong_score + " wrong");
  $("#game_progress .bg-danger").animate({width: wrong_score},"slow");

  // 1.5.7 Display Game Alert and Update Game Controls
  var check_answer_element = $("<i>").addClass("far fa-question-circle fa-4x").attr("id","check_answer").attr("title","Submit Answer");
  var next_question_element = $("<i>").addClass("far fa-arrow-alt-circle-right fa-4x").attr("id","next_question").attr("title","Next Question");
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
    previous_question_element = $("<i>").addClass("far fa-arrow-alt-circle-left fa-4x").attr("id","previous_question").attr("title","Previous Question");
    next_question_element = "";
    Timer.stop();
    $("#display_timer").hide();
    $(".loader").hide();

    var rightSummary = $("<ul>").append("<li><h4>Final Score: "+total_score+"%</h4></li>");
    rightSummary.find("li").append("<h5>Answered Correct</h5>");
    var wrongSummary = $("<ul>").append("<li><h5>Answered Wrong</h5></li>");

    for(var i=0; i<SCORE.length; i++){
      if(SCORE[i]){
        var rightQuestion = $("<li>").addClass("show_question").attr("data-q",i+1).text("Question "+ (i+1));
        rightSummary.append(rightQuestion);
      }else{
        var wrongQuestion = $("<li>").addClass("show_question").attr("data-q",i+1).text("Question "+ (i+1));
        wrongSummary.addClass("wrong-answer").append(wrongQuestion);
      }
    }
    
    $("#quiz_progress .score").empty();
    $("#quiz_progress .score").append(rightSummary, wrongSummary);

  }else{ 
    // NOT last question so start counter for loading the next question.
    // Update CIRCLE LOADER 
    QUIZ_PROGRESS.setPercent(total_score).draw();

    Timer.loading_next = true;
    Timer.time = (Math.floor(TIMER_SECONDS/4));
    var converted = Timer.timeConverter(Timer.time);
    $("#display_timer").text(converted);
    $("#display_timer").removeClass("wrong-answer");
    $("#display_timer").addClass("loading_next");
    Timer.startCountDown();
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
} // END nextQuestion()

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
} // END previousQuestion()

/**
 * 1.8 newGame
 */
function newGame(){
  // 1.8.1 Reset Globals
  SCORE = new Array(QUESTIONS.length);             
  SUBMITTED_ANSWERS = new Array(QUESTIONS.length);

  // 1.8.2 Show Ready Screen
  showReadyScreen();

  /**
   * 1.8.3 Set Quiz Progress to 0%
   * ClassyLoader depends on the following script,
   * <script src="assets/javascript/jquery.classyloader.min.js" type="text/javascript"></script>
   */
  $("#quiz_progress .score").html("Score");
  $("#display_timer").show();
  $(".loader").show();
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
  Timer.stop();
  Timer.reset();
} // END newGame()

/**
 * 1.9 gameAlert()
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
} // END gameAlert()

/**
 * 1.10 showReadyScreen
 */
function showReadyScreen(){
  // Clear Screen
  $("#display_timer").hide();
  $(".loader").hide();
  $("#check_answer").hide();
  $(".question_answers").empty();

  // Display ready button
  var ready_text = $("<p>");
  ready_text.append($("<span>").addClass("h3").text("There will be "+ QUESTIONS.length + " questions total and you will have " + TIMER_SECONDS + " seconds to answer each one."));
  ready_text.append($("<br>"));
  ready_text.append($("<br>"));
  ready_text.append($("<span>").addClass("h4").text("Press start when you are ready?"));

  var ready_button = $("<button>").attr("type","button").addClass("btn btn-primary").attr("id","start-btn").text("Start");
  $(".question_answers").append(ready_text, ready_button);
} // END showReadyScreen

/* ===============[ 2. Timer Object ]====================*/
var Timer = {
  time: 0,
  clockRunning: false,
  intervalId: null,
  loading_next: false,

  // 2.1 reset
  reset: function() {
    Timer.time = TIMER_SECONDS;
    Timer.loading_next = false;
    var converted = Timer.timeConverter(Timer.time);
    $("#display_timer").text(converted);
    $("#display_timer").removeClass("wrong_answer");
    $("#display_timer").removeClass("loading_next");
  },

  // 2.2 start
  start: function() {
    // Use setInterval to start the count here and set the clock to running.
    if (!this.clockRunning) {
      this.intervalId = setInterval(Timer.count, 1000);
      this.clockRunning = true;
    }
  },

  // 2.3 startCountDown
  startCountDown: function() {
    // Use setInterval to start the count here and set the clock to running.
    if (!this.clockRunning) {
      this.intervalId = setInterval(Timer.countDown, 1000);
      this.clockRunning = true;
    }
  },
  
  // 2.4 stop
  stop: function() {
    // Use clearInterval to stop the count here and set the clock to not be running.
    clearInterval(this.intervalId);
    this.clockRunning = false;
  },
  
  // 2.5 count
  count: function() {
    // increment time by 1, remember we cant use "this" here.
    Timer.time++;
    
    // Get the current time, pass that into the stopwatch.timeConverter function,
    // and save the result in a variable.
    var converted = Timer.timeConverter(Timer.time);
    
    // Use the variable we just created to show the converted time in the "display" div.
    $("#display_timer").text(converted);
  },
  
  // 2.6 countDown
  countDown: function() {
    if(Timer.time === 0){
      Timer.stop();
      
      if(Timer.loading_next === false){
        checkAnswer();
        return;
      }
      
      nextQuestion();
      return;
    }
    
    // decrement time by 1, remember we cant use "this" here.
    Timer.time--;
    
    if(Timer.time === (Math.floor(TIMER_SECONDS/4)) && Timer.loading_next === false){
      $("#display_timer").addClass("wrong-answer");
    }
    
    if(Timer.time <= (Math.floor(TIMER_SECONDS/4)) && Timer.loading_next === false){
      runEffect($("#display_timer"));
    }


    // Get the current time, pass that into the stopwatch.timeConverter function,
    // and save the result in a variable.
    var converted = Timer.timeConverter(Timer.time);
    
    // Use the variable we just created to show the converted time in the "display" div.
    $("#display_timer").text(converted);
  },
  
  // 2.7 timeConverter
  timeConverter: function(t) {
    
    var minutes = Math.floor(t / 60);
    var seconds = t - (minutes * 60);
    
    if (seconds < 10) {
      seconds = "0" + seconds;
    }
    
    if (minutes === 0) {
      minutes = "00";
    }
    else if (minutes < 10) {
      minutes = "0" + minutes;
    }

    return minutes + ":" + seconds;
  }
}; // END Timer object

/**===============[ 3. Document Ready ]==================== 
 * NOTE: $(function(){ === $(document).ready(function() {
 * it's the shorthand version of document ready. 
 *********************************************************/
$(function(){
  // 3.1 Show Ready Screen
  showReadyScreen();

  /**
   * 3.2 Make so only one question can be selected.
   * which must be done through event delegation using .on() delegated-events approach for this to work after dom manipulation.
   */
  $('.question_answers').on('change', '.custom-control-input', function() {
    $('.custom-control-input').prop('checked', false);
    $(this).prop('checked', true);
    
    // Create Check Answer Element if it does not exist
    if($("#check_answer").length === 0){
      var check_answer_element = $("<i>").addClass("far fa-question-circle fa-4x").attr("id","check_answer").attr("title","Submit Answer");
      $(".quiz_controls .check_answer").html(check_answer_element);
    }else{
      $("#check_answer").show();
    }
  });

  // Style Tooltips for check_answer
  $(document).tooltip();
  
  /**
   * 3.3 Set Quiz Progress to 0%
   * ClassyLoader depends on the following script,
   * <script src="assets/javascript/jquery.classyloader.min.js" type="text/javascript"></script>
   */
  $("#quiz_progress .score").html("Score");
  $("#display_timer").show();
  $(".loader").show();
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
  
  // 3.4 Set Up Clickable elements
  // 3.4.1 #check_answer click function
  $('.quiz_controls').on('click', '#check_answer', function() {
    checkAnswer();
  });
  
  // 3.4.2 #next_question click function
  $('.quiz_controls').on('click', '#next_question', function() {
    nextQuestion();
  });
  
  // 3.4.3 #previous_question click function
  $('.quiz_controls').on('click', '#previous_question', function() {
    previousQuestion();
  });
  
  // 3.4.4 .show_question click function
  $('.score').on('click', '.show_question', function() {
    var question_to_load = parseInt($(this).data("q"));
    var q = createQuestion(QUESTIONS[question_to_load-1],ANSWERS,question_to_load);
    $(".question_answers").empty();
    $(".question_answers").append(q);
  });
  
  // 3.4.5 #start-btn click function
  $('.question_answers').on('click','#start-btn', function(){
    // Create First Question when #start-btn is clicked
    QUESTIONS = shuffle_array(QUESTIONS); // Make sure to only shuffle this ONCE
    
    var q = createQuestion(QUESTIONS[0],ANSWERS,1);
    $(".question_answers").empty();
    $(".question_answers").append(q);
  });
  
  // 3.4.6 #new-game click function
  $("#new-game").click(function(e){
    e.preventDefault();
    newGame();
  });
}); // END $(document).ready(function() {