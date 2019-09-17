$(document).ready(function () {
  // alert('test');
  console.log("Questions", questions);
  console.log("Answers", answers);

  $('.custom-control-input').change(function () {
    $('.custom-control-input').prop('checked', false);
    $(this).prop('checked', true);
  });

  var loader = $('.loader').ClassyLoader({
    animate: false,
    percentage: 0,
    speed: 20,
    fontColor: '#1E2022',
    fontSize: '50px',
    diameter: 80,
    lineColor: '#0092CA',
    remainingLineColor: 'rgba(0, 146, 202, 0.3)', /* 'rgba(82, 97, 107, 0.7)', */ 
    lineWidth: 10
  });

  setTimeout(loader.setPercent(50).draw,5 * 1000);

});