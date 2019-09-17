/*****************************************************
 * Trivia Game JS
 * @package TriviaGame
 * @author Christopher Collins
 * @version 2.0
 * @license none (public domain)
 * 
 * ===============[ TABLE OF CONTENTS ]===============
 * 0. Globals
 * 1. Functions
 *   1.1 generateRandomNumber
 *   1.2 shuffle_array
 *   1.3 runEffect
 *   1.4 createQuestion
 *   1.5 checkAnswer
 *   1.6 nextQuestion
 *   1.7 previousQuestion
 * 
 * 2. Document Ready
 *   2.1 Generate the first question
 *   2.2 Make so only one question can be selected.
 *   2.3 Set Quiz Progress to 0%
 *   2.4 Set Up Clickable elements
 * 
 * @todo
 * -Make so once the question has been graded the answer can't be changed.
 * -Add Timer on questions that auto-grades and moves on to the next question.
 * -Detect if question has already been answered when viewing previous_question. 
 * -Update Correct/Wrong/Unanswered?
 * -Add Pictures and Questions
 * -Add New Game Feature
 * -Add Score Page
 * -Decide if I really need PreviousQuestion or not...and when to show it if I keep it. 
 * -Switch Score and % progress circle...maybe show a progress bar at the top instead. 
 *****************************************************/
/* ===============[ 0. GLOBALS ]======================
* NOTE: the variables QUESTIONS and ANSWERS must be predefined in the following script,
* <script src="assets/javascript/app-data.js" type="text/javascript"></script>
*/
var SCORE = new Array(QUESTIONS.length) // array of booleans representing right/wrong answers to the questions.
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
 * @param {string} C - Question ?1 of ?2 where ?! represents the current question and ?2 represents total questions. 
 * @return {html}  question
 */
var createQuestion = function(Q,A,C){
  var question = $("<li class='list-group-item question'>");
  question.text(Q.question);

  var answer_block = $("<div class='row'>");
  var answer_image = $("<img class='img-thumbnail rounded-circle'>");
  answer_image.attr("src",Q.image);
  answer_image.attr("alt",Q.topic+" - "+Q.subtopic);
  answer_image = $("<div class='col-4 align-self-center text-right answer_image'><span class='image_wrap'>").html(answer_image);
  answer_block.append(answer_image);

  var answers = $("<div class='col-8 answers'>");
  answers.append("<ul class='list-group'>");

  var random_answer_index = generateRandomNumber(0,Q.answer.length);
  var possible_answers = [];
  possible_answers.push(Q.answer[random_answer_index]);
  possible_answers = $.merge(possible_answers,Q.wrong);

  // Shuffle the possible answers so it's not always the first one. 
  possible_answers = shuffle_array(possible_answers);

  for(var i=0; i < possible_answers.length; i++ ){
    var answer_option = $("<li class='list-group-item'><div class='custom-control custom-checkbox mr-sm-2'>");
    answer_option.find(".custom-control").append("<input type='checkbox' class='custom-control-input' id='answer"+i+"' data-answer-index="+possible_answers[i]+" />");
    answer_option.find(".custom-control").append("<label class='custom-control-label' for='answer"+i+"'>"+A[possible_answers[i]]+"</label>");
    answers.find(".list-group").append(answer_option);
  }

  answer_block.append(answers);
  answer_block = $("<li class='list-group-item answer_block'>").append(answer_block);

  question = $("<ul class='list-group text-left' >").append(question);
  question.prepend(C);
  question.append(answer_block);

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
  $(".question_answers .answers .custom-control-input").each(function(){
    if($(this).is(':checked')){
      submitted_answer = $(this).data("answer-index");
    }
  });

  // Search Answers Array for submitted answer
  var matchFound = false;
  QUESTIONS[current_question_index].answer.forEach(function(value,index){
    if(submitted_answer === value){
      matchFound = true;
    }
  });

  SCORE[current_question_index] = matchFound;

  var progress = ((current_question_index+1)/QUESTIONS.length)*100;
  QUIZ_PROGRESS.setPercent(progress).draw();
  // setTimeout(loader.setPercent(50).draw,5 * 1000);

  // var total_score = parseInt($("#quiz_score").data("score"));
  var filtered_score = SCORE.filter(function(el){
    return el != null;
  });

  var right_answers = 0;
  filtered_score.forEach(function(value){
    if(value){ right_answers++; }
  });

  var total_score = (right_answers/filtered_score.length)*100;
  total_score = total_score.toFixed(0);

  $("#quiz_score").data("score",total_score);
  $("#quiz_score").text(total_score+"%");
  runEffect($("#quiz_score"));
}// END checkAnswer()

/**
 * 1.6 nextQuestion
 */
function nextQuestion(){
  // Get Current Question information.
  var next_question_index = parseInt($(".question_answers .question_counter").data("start"));
  next_question_index++;
  
  var q_counter = "<li class='list-group-item question_counter' data-start='"+next_question_index+"' data-end='"+ (QUESTIONS.length-1) + "'>Question "+ (next_question_index + 1) +" of "+ QUESTIONS.length +"</li>";
  var q = createQuestion(QUESTIONS[next_question_index],ANSWERS,q_counter);
  $(".question_answers").empty();
  $(".question_answers").append(q);
} 

/**
 * 1.7 previousQuestion
 */
function previousQuestion(){
  // Get Current Question information.
  var previous_question_index = parseInt($(".question_answers .question_counter").data("start"));
  previous_question_index--;
  
  var q_counter = "<li class='list-group-item question_counter' data-start='"+previous_question_index+"' data-end='"+ (QUESTIONS.length-1) + "'>Question "+ (previous_question_index + 1) +" of "+ QUESTIONS.length +"</li>";
  var q = createQuestion(QUESTIONS[previous_question_index],ANSWERS,q_counter);
  $(".question_answers").empty();
  $(".question_answers").append(q);
}

/**
 * 2. Document Ready
 */
$(document).ready(function () {
  // 2.1 Generate the first question
  QUESTIONS = shuffle_array(QUESTIONS); // Make sure to only shuffle this ONCE
  var q_counter = "<li class='list-group-item question_counter' data-start='0' data-end='"+ (QUESTIONS.length-1) + "'>Question 1 of "+ QUESTIONS.length +"</li>";
  var q = createQuestion(QUESTIONS[0],ANSWERS,q_counter);
  $(".question_answers").append(q);

  // 2.2 Make so only one question can be selected.
  $('.custom-control-input').change(function () {
    $('.custom-control-input').prop('checked', false);
    $(this).prop('checked', true);
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
  $(".check_answer").on("click",function(){
    checkAnswer();
  });

  $(".next_question").click("click",function(){
    nextQuestion();
  });

  $(".previous_question").click("click",function(){
    previousQuestion();
  });

});