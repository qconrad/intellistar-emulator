const morning = [{name: "Now", subpages: [{name: "current-page", duration: 9000}, {name: "radar-page", duration: 8000}]},{name: "Today", subpages: [{name: "today-page", duration: 10000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 10000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 10000}, {name: "7day-page", duration: 13000}]},]
const night = [{name: "Now", subpages: [{name: "current-page", duration: 9000}, {name: "radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 10000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 10000}, {name: "tomorrow-night-page", duration: 10000}, {name: "7day-page", duration: 13000}]},]
const single = [{name: "Alert", subpages: [{name: "single-alert-page", duration: 7000}]},{name: "Now", subpages: [{name: "current-page", duration: 8000}, {name: "radar-page", duration: 8000}, {name: "zoomed-radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 8000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 8000}, {name: "7day-page", duration: 13000}]},]
const multiple = [{name: "Alerts", subpages: [{name: "multiple-alerts-page", duration: 7000}]},{name: "Now", subpages: [{name: "current-page", duration: 8000}, {name: "radar-page", duration: 8000}, {name: "zoomed-radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 8000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 8000}, {name: "7day-page", duration: 13000}]},]
const weekday = ["SUN",  "MON", "TUES", "WED", "THU", "FRI", "SAT"];
﻿var ZIP_CODE = "00000";
var CITY_NAME = "CITY_NAME";
var CURRENT_TEMPERATURE = "0";
var GREETING_TEXT = "This is your weather.";
var FORECAST_NARRATIVE = [];
var OUTLOOK_HIGH = [];
var OUTLOOK_LOW = [];
var OUTLOOK_CONDITION = [];
var CRAWL_TEXT = "This is an example of crawl text.";
var PAGE_ORDER;
var ALERTS = [];
var music;

window.onload = function() {
  preloadBackground();
  preLoadMusic();
  resizeWindow();
  setClockTime();
  guessZipCode();
}

function guessZipCode(){
  fetch("http://api.wunderground.com/api/d8585d80376a429e/geolookup/q/autoip.json")
  .then(function(response) {
    //check for error
    if (response.status !== 200) {
      console.log("conditions request error");
      return;
    }
    response.json().then(function(data) {
      document.getElementById("zip_code_text").value = data.location.zip;
    });
  })
}

function preloadBackground(){
  var index = Math.floor(Math.random() * 10) + 1;
  var filePath = 'assets/backgrounds/' + index + '.jpg';
  document.getElementById('background-image').style.backgroundImage = "url('" + filePath + "')";
}

function preLoadMusic(){
  var index = Math.floor(Math.random() * 11) + 1;
  music= new Audio("assets/music/" + index + ".mp3");
}

function scheduleTimeline(){
  var currentTime = new Date();
  if(currentTime.getHours() > 4 && currentTime.getHours() < 14){
    PAGE_ORDER = morning;
  }else if(ALERTS.length == 1){
    PAGE_ORDER = single;
  }else if(ALERTS.length > 1){
    PAGE_ORDER = multiple;
  }else{
    PAGE_ORDER = night;
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

function hideZipCodeElement(){
  document.getElementById('zip-prompt').style.display = 'none';
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
      hideZipCodeElement();
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

      for(var i = 0; i < data.alerts.length; i++){
        // Take the most important alert message and set it as crawl text
        // This will supply more information i.e. tornado warning coverage
        CRAWL_TEXT = data.alerts[0].message;

        // ignore special weather statements
        if(data.alerts[i].type == "SPE"){
          continue;
        }
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

      // 7 day data
      for (var i = 0; i < 7; i++) {
        OUTLOOK_HIGH[i] = data.forecast.simpleforecast.forecastday[i].high.fahrenheit.toString();
        OUTLOOK_LOW[i] = data.forecast.simpleforecast.forecastday[i].low.fahrenheit.toString();
        OUTLOOK_CONDITION[i] = data.forecast.simpleforecast.forecastday[i].conditions.toString();
      }

      //narratives
      for (var i = 0; i <= 3; i++){
        FORECAST_NARRATIVE[i] = data.forecast.txt_forecast.forecastday[i].fcttext.toString();
      }
      scheduleTimeline();
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
  document.getElementById("zoomed-radar-image").src = 'http://api.wunderground.com/api/d8585d80376a429e/animatedradar/q/MI/'+ ZIP_CODE + '.gif?newmaps=1&timelabel=1&timelabel.y=10&num=5&delay=10&radius=50&num=15&width=1235&height=525&rainsnow=1&smoothing=1&noclutter=1';
  document.getElementById('crawl-text').stop();

  setOutlook();

  var row = document.getElementById('timeline-events')
  for(var i = 0; i < PAGE_ORDER.length; i++){
    var cell = row.insertCell(i);
    cell.style.width = '280px';
    cell.align = 'left';
    cell.innerHTML = PAGE_ORDER[i].name;
  }

  //start once all the information is set
  setTimeout(startAnimation, 0);
}

function setOutlook(){
  for (var i = 0; i < 7; i++) {
    //get all the elements for given day
    var textElement = "day" + i + "-text";
    var highElement = "day" + i + "-high";
    var lowElement = "day" + i + "-low";
    var conditionElement = "day" + i + "-condition";
    var containerElement = "day" + i + "-container";
    var dayIndex = (new Date().getDay()+ i) % 7;

    //set weekends to transparent
    if(dayIndex == 0 || dayIndex == 6){
      document.getElementById(containerElement).style.backgroundColor = "transparent"; //weekend
    }
    document.getElementById(textElement).innerHTML = weekday[dayIndex];

    document.getElementById(highElement).innerHTML = OUTLOOK_HIGH[i];
    document.getElementById(lowElement).innerHTML = OUTLOOK_LOW[i];
    document.getElementById(conditionElement).innerHTML = OUTLOOK_CONDITION[i];
  }
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
  if(PAGE_ORDER[0].subpages[0].name == 'current-page'){
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

  //hide everything
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
  var cumlativeTime = 0;
  for(var p = 0; p < PAGE_ORDER.length; p++){
    for (var s = 0; s < PAGE_ORDER[p].subpages.length; s++) {
      //for every single sub page
      var startTime = cumlativeTime;
      var clearTime = cumlativeTime + PAGE_ORDER[p].subpages[s].duration;
      setTimeout(executePage, startTime, p, s);
      setTimeout(clearPage, clearTime, p, s);
      cumlativeTime = clearTime;
    }
  }
}

function executePage(pageIndex, subPageIndex){
  var pageName = PAGE_ORDER[pageIndex].subpages[subPageIndex].name;
  var pageElement = document.getElementById(pageName);
  // console.log(pageName);
  if(subPageIndex === 0){
      var pageTime = 0;
      for (var i = 0; i < PAGE_ORDER[pageIndex].subpages.length; i++) {
        pageTime += PAGE_ORDER[pageIndex].subpages[i].duration;
      }
      void document.getElementById('progressbar').offsetWidth;
      document.getElementById('progressbar').style.transitionDuration = pageTime + "ms";
      document.getElementById('progressbar').classList.add('progress');
      document.getElementById('timeline-events-container').style.left = ((-280*pageIndex)-(pageIndex*3)).toString() + "px";
  }

  pageElement.style.transitionDelay = '0.5s';
  if(pageIndex === 0 && subPageIndex == 0){
    pageElement.style.top = '0px';
  }
  else{
    pageElement.style.left = '0px';
  }

  if(pageIndex >= PAGE_ORDER.length-1 && subPageIndex >= PAGE_ORDER[PAGE_ORDER.length-1].subpages.length-1)
      document.getElementById('crawler-container').classList.add("hidden");
  else if(pageName == "current-page"){
    animateValue('cc-temperature-text', -12, CURRENT_TEMPERATURE, 2500, "", "°");
  }
}

function clearPage(pageIndex, subPageIndex){
  var pageName = PAGE_ORDER[pageIndex].subpages[subPageIndex].name;
  var pageElement = document.getElementById(pageName);
  if(PAGE_ORDER[pageIndex].subpages.length-1 == subPageIndex){
    document.getElementById('progressbar').style.transitionDuration = '0ms';
    document.getElementById('progressbar').classList.remove('progress');
  }

  if(pageIndex >= PAGE_ORDER.length-1 && subPageIndex >= PAGE_ORDER[PAGE_ORDER.length-1].subpages.length-1){
    itsAmazingOutThere();
  }
  else{
    pageElement.style.transitionDelay = '0s';
    pageElement.style.left = '-101%';
  }
}

function itsAmazingOutThere(){
  clearElements();
}

function clearElements(){
  document.getElementById("outlook-titlebar").classList.add('hidden');
  document.getElementById("forecast-left-container").classList.add('hidden');
  document.getElementById("forecast-right-container").classList.add('hidden');
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
