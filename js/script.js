var ZIP_CODE = "00000";
var CITY_NAME = "CITY_NAME";
var CURRENT_TEMPERATURE = "0";
var GREETING_TEXT = "This is your weather.";
var FORECAST_NARRATIVE = [];
var CRAWL_TEXT = "This is a longer crawl text that scrolls through the bottom bar as the weather is displayed. I haven't decided what I'm going to put here yet.";
var PAGE_TIMINGS = [];
var PAGE_ORDER = [];
var TIMELINE_ORDER = [];
var TURN_PAGE = [];
var TIMELINE_INDEX = [];
var ALERTS = [];
var music;

window.onload = function() {
  preloadBackground();
  preLoadMusic();
  resizeWindow();
  setClockTime();
}

function preloadBackground(){
  var index = Math.floor(Math.random() * 20) + 1;
  var filePath = 'assets/backgrounds/' + index + '.jpg';
  document.getElementById('background-image').style.backgroundImage = "url('" + filePath + "')";
}

function preLoadMusic(){
  var index = Math.floor(Math.random() * 11) + 1;
  music= new Audio("assets/music/" + index + ".mp3");
}

function determinePageOrder(){
  var currentTime = new Date();
  if(currentTime.getHours() > 4 && currentTime.getHours() < 14){//day is between 4am and 2pm
    if(ALERTS.length > 0){
      if(ALERTS.length == 1){
        PAGE_TIMINGS = [8000, 8500, 8500, 8000, 8000, 8000, 11000];
        PAGE_ORDER = ["single-alert-page", "current-page", "radar-page", "today-page", "tonight-page", "tomorrow-page", "7day-page"];
        TIMELINE_ORDER = ["Alert", "Now", "Today", "Tonight", "Beyond"];
        TURN_PAGE = [8000, 17000, 0, 8000, 8000, 19000, 0];
        TIMELINE_INDEX = [0, 1, 1, 2, 3, 4, 4];
      }
      else{
        PAGE_TIMINGS = [8000, 8500, 8500, 8000, 8000, 8000, 11000];
        PAGE_ORDER = ["multiple-alert-page", "current-page", "radar-page", "today-page", "tonight-page", "tomorrow-page", "7day-page"];
        TIMELINE_ORDER = ["Alerts", "Now", "Today", "Tonight", "Beyond"];
        TURN_PAGE = [8000, 17000, 0, 8000, 27000, 0, 0];
        TIMELINE_INDEX = [0, 1, 1, 2, 3, 3];
      }
    }
    else{
      PAGE_TIMINGS = [8500, 8500, 10000, 10000, 11500, 11500];
      PAGE_ORDER = ["current-page", "radar-page", "today-page", "tonight-page", "tomorrow-page", "7day-page"];
      TIMELINE_ORDER = ["Now", "Today", "Tonight", "Beyond"];
      TURN_PAGE = [17000, 0, 10000, 10000, 23000, 0];
      TIMELINE_INDEX = [0, 0, 1, 2, 3, 3];
    }
  }
  else{
    if(ALERTS.length > 0){
      if(ALERTS.length == 1){
        PAGE_ORDER = ["single-alert-page", "current-page", "radar-page", "tonight-page", "tomorrow-page", "tomorrow-night-page", "7day-page"];
        PAGE_TIMINGS = [8000, 8500, 8500, 8000, 8000, 8000, 11000];
        TIMELINE_ORDER = ["Alert", "Now", "Tonight", "Beyond"];
        TURN_PAGE = [8000, 17000, 0, 8000, 27000, 0, 0];
        TIMELINE_INDEX = [0, 1, 1, 2, 3, 3];
      }
      else{
        PAGE_ORDER = ["multiple-alerts-page", "current-page", "radar-page", "tonight-page", "tomorrow-page", "tomorrow-night-page", "7day-page"];
        PAGE_TIMINGS = [8000, 8500, 8500, 8000, 8000, 8000, 11000];
        TIMELINE_ORDER = ["Alerts", "Now", "Tonight", "Beyond"];
        TURN_PAGE = [8000, 17000, 0, 8000, 27000, 0, 0];
        TIMELINE_INDEX = [0, 1, 1, 2, 3, 3];
      }
    }
    else{
      PAGE_TIMINGS = [9250, 9250, 10000, 10000, 10000, 11500];
      PAGE_ORDER = ["current-page", "radar-page", "tonight-page", "tomorrow-page", "tomorrow-night-page", "7day-page"];
      TIMELINE_ORDER = ["Now", "Tonight", "Beyond"];
      TURN_PAGE = [18500, 0, 10000, 31500, 0, 0];
      TIMELINE_INDEX = [0, 0, 1, 2, 2, 2];
    }
  }

  setInformation();
}

function checkZipCode(){
  var isValidZip = false;
    var input = document.getElementById('zip_code_text').value;
    if(/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(input)){
      isValidZip = true;
      ZIP_CODE = input;
    }
    else{
      alert("Enter valid ZIP code");
      return;
    }
    fetchCurrentWeather();
}

function hiddenZipCodeElement(){
  document.getElementById('zip_code_form_container').style.top = '-101%';
}

function fetchCurrentWeather(){
  fetch("http://api.wunderground.com/api/d8585d80376a429e/conditions/q/" + ZIP_CODE + ".json")
  .then(function(response) {
    //check for error
    if (response.status !== 200) {
      console.log("conditions request error");
      return;
    }
    response.json().then(function(data) {
      try{CITY_NAME = data.current_observation.display_location.city.toString().toUpperCase();}
      catch(err){alert("Enter valid ZIP code"); getZipCodeFromUser(); return;}
      CURRENT_TEMPERATURE = Math.round(data.current_observation.temp_f).toString().toUpperCase();
      hiddenZipCodeElement();
      fetchAlerts();
    });
  })
}

function fetchAlerts(){
  fetch("http://api.wunderground.com/api/d8585d80376a429e/alerts/q/" + ZIP_CODE + ".json")
  .then(function(response) {
    //check for error
    if (response.status !== 200) {
      console.log("forecast request error");
      return;
    }
    response.json().then(function(data) {
      //PARSE DATA HERE
      var weekday = ["SUN",  "MON", "TUES", "WED", "THURS", "FRI", "SAT"];

      for(var i = 0; i < data.alerts.length; i++){
        var now = new Date()/ 1000;
        var alertName = data.alerts[i].description.toUpperCase();
        var expire = data.alerts[i].expires.split(" on ");
        var issue = data.alerts[i].date.split(" on ");
        var issueTime = issue[0].toUpperCase();
        var issueDate = weekday[new Date(issue[1]).getDay()].toUpperCase();
        var expireTime = expire[0].toUpperCase();
        var expireDate = weekday[new Date(expire[1]).getDay()].toUpperCase();
        if(data.alerts[i].date_epoch > now){
          //in future
          ALERTS[i] = alertName + " FROM " + issueTime + " " + issueDate + " UNTIL " + expireTime + " " + expireDate; //FINAL DESCRIPTION
        }
        else{
          //already issued
          ALERTS[i] = alertName + " UNTIL " + expireTime + " " + expireDate; //FINAL DESCRIPTION
        }
      }

      fetchForecast();
    });
  })
}

function fetchForecast(){
  fetch("http://api.wunderground.com/api/d8585d80376a429e/forecast10day/q/" + ZIP_CODE + ".json")
  .then(function(response) {
    //check for error
    if (response.status !== 200) {
      console.log("forecast request error");
      return;
    }
    response.json().then(function(data) {
      //PARSE DATA HERE


      for (var i = 0; i <= 3; i++){
        FORECAST_NARRATIVE[i] = data.forecast.txt_forecast.forecastday[i].fcttext.toString();
      }
      determinePageOrder();
    });
  })
}

function setInformation(){
  //Put all the information fetched to the appropriate elements

  setAlertPage();
  document.getElementById("hello-location-text").innerHTML = CITY_NAME + ",";
  document.getElementById("infobar-location-text").innerHTML = CITY_NAME;
  document.getElementById("greeting-text").innerHTML = GREETING_TEXT;
  document.getElementById("today-narrative-text").innerHTML = FORECAST_NARRATIVE[0];
  document.getElementById("tonight-narrative-text").innerHTML = FORECAST_NARRATIVE[1];
  document.getElementById("tomorrow-narrative-text").innerHTML = FORECAST_NARRATIVE[2];
  document.getElementById("tomorrow-night-narrative-text").innerHTML = FORECAST_NARRATIVE[3];
  document.getElementById("radar-image").src = 'http://api.wunderground.com/api/d8585d80376a429e/animatedradar/q/MI/'+ ZIP_CODE + '.gif?newmaps=1&timelabel=1&timelabel.y=10&num=5&delay=10&radius=100&num=15&width=1235&height=525&rainsnow=1&smoothing=1&noclutter=1';
  document.getElementById('crawl-text').stop();

  var row = document.getElementById('timeline-events')
  for(var i = 0; i < TIMELINE_ORDER.length; i++){
    var cell = row.insertCell(i);
    cell.style.width = '280px';
    cell.align = 'left';
    cell.innerHTML = TIMELINE_ORDER[i];
  }


  //start once all the information is set
  setTimeout(startAnimation, 0);
}

function setAlertPage(){
  if(ALERTS.length === 0)
    return;

  if(ALERTS.length == 1){
    document.getElementById("single-alert0").innerHTML = ALERTS[0];
  }
  else{
    for(var i = 0; i < Math.min(3, ALERTS.length); i++){
      var idName = 'alert' + i;
      document.getElementById(idName).innerHTML = ALERTS[i];
    }
  }
}

function startAnimation(){
  if(PAGE_ORDER[0] == 'current-page'){
    document.getElementById('current-page').style.left = '0px';
  }
  else{
    document.getElementById('current-page').style.top = '0px';
  }
  music.play();
  startGreetingPage();
}

function startGreetingPage(){
  document.getElementById('background-image').classList.remove("below-screen");
  document.getElementById('content-frame').classList.add('shown');
  document.getElementById('infobar-twc-logo').classList.add('shown');
  document.getElementById('hello-text').classList.add('shown');
  document.getElementById('hello-location-text').classList.add('shown');
  document.getElementById('greeting-text').classList.add('shown');
  document.getElementById('local-logo-container').classList.add("shown");
  setTimeout(clearGreetingPage, 2500);
}

function clearGreetingPage(){
  //remove transition delay from greeting
  document.getElementById('greeting-text').classList.remove('shown');
  document.getElementById('local-logo-container').classList.remove('shown');

  //hidden everything
  document.getElementById('greeting-text').classList.add('hidden');
  document.getElementById('hello-text-container').classList.add('hidden');
  document.getElementById("hello-location-container").classList.add("hidden");
  document.getElementById("local-logo-container").classList.add("hidden");

  document.getElementById('crawler-container').classList.add("shown");
  setTimeout(startScrollingText, 3000);
  schedulePages();
  loadInfoBar();
}

function schedulePages(){
  for(var i = 0; i < PAGE_ORDER.length; i++){
      var startTime = calculateStartTime(i);
      var clearTime = calculateEndTime(i);
      setTimeout(executePage, startTime, i);
      setTimeout(clearPage, clearTime, i);
  }
}

function calculateStartTime(index){
  var startTime = 0;
  for(var i = 0; i < index; i++){
      startTime += PAGE_TIMINGS[i]
  }
  return startTime;
}

function calculateEndTime(index){
  var endTime = 0;
  for(var i = 0; i <= index; i++){
      endTime += PAGE_TIMINGS[i]
  }
  return endTime;
}

function executePage(index){
  if(TURN_PAGE[index] != 0){
      void document.getElementById('progressbar').offsetWidth;
      document.getElementById('progressbar').classList.add('progress');
      document.getElementById('progressbar').style.transitionDuration = TURN_PAGE[index] + "ms";
      document.getElementById('timeline-events-container').style.left = ((-280*TIMELINE_INDEX[index])-(index*3)).toString() + "px";
  }

  document.getElementById(PAGE_ORDER[index]).style.transitionDelay = '0.5s';
  if(index === 0){
    document.getElementById(PAGE_ORDER[index]).style.top = '0px';
  }
  else{
    document.getElementById(PAGE_ORDER[index]).style.left = '0px';
  }

  if(PAGE_ORDER[index] == "7day-page")
      document.getElementById('crawler-container').classList.add("hidden");
  else if(PAGE_ORDER[index] == "current-page"){
    animateValue('cc-temperature-text', -12, CURRENT_TEMPERATURE, 2500, "", "°");
  }
}

function clearPage(index){
  if(TURN_PAGE[index + 1] != 0){
    document.getElementById('progressbar').style.transitionDuration = '0ms';
    document.getElementById('progressbar').classList.remove('progress');
  }
  document.getElementById(PAGE_ORDER[index]).style.transitionDelay = '0s';
  document.getElementById(PAGE_ORDER[index]).style.left = '-101%';
  if(index >= PAGE_ORDER.length-1){
    itsAmazingOutThere();
  }
}

function itsAmazingOutThere(){
  clearElements();
}

function clearElements(){
  document.getElementById("infobar-twc-logo").classList.add("hidden");
  document.getElementById("infobar-local-logo").classList.add("hidden");
  document.getElementById("infobar-location-container").classList.add("hidden");
  document.getElementById("infobar-time-container").classList.add("hidden");
  document.getElementById("content-container").classList.add("expand");
  document.getElementById("timeline-container").style.visibility = "hidden";
  setTimeout(clearEnd, 2000);
}

function clearEnd(){
  document.getElementById('background-image').classList.add("above-screen");
  document.getElementById('content-container').classList.add("above-screen");
}


function startScrollingText(){
  document.getElementById('crawl-text').start();
  document.getElementById("crawl-text").innerHTML = CRAWL_TEXT.toUpperCase();
  document.getElementById('crawl-text').style.opacity = "1";

}

function loadInfoBar(){
  document.getElementById("infobar-local-logo").classList.add("shown");
  document.getElementById("infobar-location-container").classList.add("shown");
  document.getElementById("infobar-time-container").classList.add("shown");
}

function setClockTime(){
  var currentTime = new Date();
  var diem = "AM";
  var h = currentTime.getHours();
  var m = currentTime.getMinutes();

  if(h == 0){
    h = 12;
  }
  else if(h > 12){
    h = h - 12
    diem = "PM";
  }
  if(m < 10){
    m = "0" + m;
  }
  var finalString = h + ":" + m;

  document.getElementById("infobar-time-text").innerHTML = finalString;

  //refresh clock every 5 seconds
  setTimeout(setClockTime, 5000);
}

function animateValue(id, start, end, duration, beforeText, afterText) {
  var range = end - start;
  var current = start;
  var increment = end > start? 1 : -1;
  var stepTime = Math.abs(Math.floor(duration / range));
  var obj = document.getElementById(id);
  var timer = setInterval(function() {
      current += increment;
      obj.innerHTML = beforeText + current + afterText;
      if (current == end) {
          clearInterval(timer);
      }
  }, stepTime);
}



var baseSize = {
    w: 1920,
    h: 1080
}

window.onresize = resizeWindow;
function resizeWindow(){
  var ww = window.innerWidth;
  var wh = window.innerHeight;
  var newScale = 1;

  // compare ratios
  if(ww/wh < baseSize.w/baseSize.h) { // tall ratio
      newScale = ww / baseSize.w;
  } else { // wide ratio
      newScale = wh / baseSize.h;
  }

  document.getElementById('render-frame').style.transform = 'scale(' + newScale + ',' +  newScale + ')';
}
