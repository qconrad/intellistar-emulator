const morning = [{name: "Now", subpages: [{name: "current-page", duration: 9000}, {name: "radar-page", duration: 8000}]},{name: "Today", subpages: [{name: "today-page", duration: 10000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 10000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 10000}, {name: "7day-page", duration: 13000}]},]
const night = [{name: "Now", subpages: [{name: "current-page", duration: 9000}, {name: "radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 10000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 10000}, {name: "tomorrow-night-page", duration: 10000}, {name: "7day-page", duration: 13000}]},]
const single = [{name: "Alert", subpages: [{name: "single-alert-page", duration: 7000}]},{name: "Now", subpages: [{name: "current-page", duration: 8000}, {name: "radar-page", duration: 8000}, {name: "zoomed-radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 8000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 8000}, {name: "7day-page", duration: 13000}]},]
const multiple = [{name: "Alerts", subpages: [{name: "multiple-alerts-page", duration: 7000}]},{name: "Now", subpages: [{name: "current-page", duration: 8000}, {name: "radar-page", duration: 8000}, {name: "zoomed-radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 8000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 8000}, {name: "7day-page", duration: 13000}]},]
const weekday = ["SUN",  "MON", "TUES", "WED", "THU", "FRI", "SAT"];
﻿var ZIP_CODE = "00000";
var CITY_NAME = "CITY_NAME";
var CURRENT_TEMPERATURE = "0";
var GREETING_TEXT = "This is your weather.";
var CURRENT_ICON = "sunny";
var CURRENT_CONDITION = "Sunny";
var WIND_SPEED = "N 0mph";
var GUSTS = "NONE";
var FEELS_LIKE = "0";
var VISIBILITY = "0 Miles"
var HUMIDITY = "0%";
var DEW_POINT = "0";
var PRESSURE = '29.92"';
var PRESSURE_TREND = "+";
var FORECAST_NARRATIVE = [];
var FORECAST_TEMP = [];
var FORECAST_ICON = [];
var FORECAST_PRECIP = [];
var OUTLOOK_HIGH = [];
var OUTLOOK_LOW = [];
var OUTLOOK_CONDITION = [];
var OUTLOOK_ICON = [];
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
      console.log("zip code request error");
      return;
    }
    response.json().then(function(data) {
      document.getElementById("zip-code-text").value = data.location.zip;
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

/* Set the timeline page order depending on time of day and if
alerts are present */
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

/* Check if zip code is accurate by doing a regex pass and then
confirming with api request */
function checkZipCode(){
  var isValidZip = false;
    var input = document.getElementById('zip-code-text').value;
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

function fetchCurrentWeather(){
  fetch("http://api.wunderground.com/api/d8585d80376a429e/conditions/q/" + ZIP_CODE + ".json")
  .then(function(response) {
    //check for error
    if (response.status !== 200) {
      console.log("conditions request error");
      return;
    }
    response.json().then(function(data) {
      try{CITY_NAME = data.current_observation.display_location.city.toUpperCase();}
      catch(err){alert("Enter valid ZIP code"); getZipCodeFromUser(); return;}
      CURRENT_TEMPERATURE = Math.round(data.current_observation.temp_f).toString().toUpperCase();
      CURRENT_CONDITION = data.current_observation.weather;
      CURRENT_ICON = data.current_observation.icon;
      WIND_SPEED = data.current_observation.wind_dir + " " + data.current_observation.wind_mph + "mph";
      GUSTS = data.current_observation.wind_gust_mph;
      FEELS_LIKE = data.current_observation.feelslike_f;
      VISIBILITY = Math.round(data.current_observation.visibility_mi).toString() + " Miles";
      HUMIDITY = data.current_observation.relative_humidity;
      DEW_POINT = data.current_observation.dewpoint_f;
      PRESSURE = data.current_observation.pressure_in;
      PRESSURE_TREND = data.current_observation.pressure_trend;

      // Animate settings prompt out
      document.getElementById('settings-prompt').style.top = '-100%';
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
      for(var i = 0; i < data.alerts.length; i++){
        /* Take the most important alert message and set it as crawl text
           This will supply more information i.e. tornado warning coverage */
        CRAWL_TEXT = data.alerts[0].message.replace("*", "");

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
          // in future
          ALERTS[i] = alertName + " FROM " + issueTime + " " + issueDate + " UNTIL " + expireTime + " " + expireDate; //FINAL DESCRIPTION
        }
        else{
          // already issued
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
      // 7 day data
      for (var i = 0; i < 7; i++) {
        OUTLOOK_HIGH[i] = data.forecast.simpleforecast.forecastday[i].high.fahrenheit;
        OUTLOOK_LOW[i] = data.forecast.simpleforecast.forecastday[i].low.fahrenheit;
        OUTLOOK_CONDITION[i] = data.forecast.simpleforecast.forecastday[i].conditions
        // Because thunderstorm won't fit in the day box, multiline it
        OUTLOOK_CONDITION[i] = OUTLOOK_CONDITION[i].replace("Thunderstorm", "Thunder</br>storm");
        OUTLOOK_ICON[i] = data.forecast.simpleforecast.forecastday[i].icon;
      }

      // narratives
      for (var i = 0; i <= 3; i++){
        FORECAST_TEMP.push(data.forecast.simpleforecast.forecastday[i].high.fahrenheit);
        FORECAST_TEMP.push(data.forecast.simpleforecast.forecastday[i].low.fahrenheit);
        FORECAST_ICON[i] = data.forecast.txt_forecast.forecastday[i].icon;
        FORECAST_NARRATIVE[i] = data.forecast.txt_forecast.forecastday[i].fcttext;
        FORECAST_PRECIP[i] = guessPrecipitation(FORECAST_NARRATIVE[i], FORECAST_TEMP[i]);
      }
      scheduleTimeline();
    });
  })
}

/* Because this particular API doesn't seem to have day by day precipitation,
we use things like the temperature and narrative to try and guess it */
function guessPrecipitation(narrativeText, temperature){
  var precipType = "Precip";
  var precipValue = "0"

  // Guess percent chance
  var parsedChance = narrativeText.match(/\S+(?=%)/g);
  if(parsedChance != null){
    precipValue = parsedChance;
  }
  else{
    if(precipValue === "0" && narrativeText.toLowerCase().includes("slight chance")){
      precipValue = "20";
    }
  }

  var narrativeLowerCase = narrativeText.toLowerCase();
  // Guess type of precipitation (i.e. rain, snow)
  if(narrativeLowerCase.includes("snow") || narrativeLowerCase.includes("flurr") || temperature < 20){
    precipType = "Snow";
  }
  else if(narrativeLowerCase.includes("rain") || temperature > 40 || narrativeLowerCase.includes("shower")){
    precipType = "Rain";
  }

  return precipValue + "% Chance</br>of " + precipType;
}

/* Now that all the fetched information is stored in memory, display them in
the appropriate elements */
function setInformation(){
  document.getElementById("hello-location-text").innerHTML = CITY_NAME + ",";
  document.getElementById("infobar-location-text").innerHTML = CITY_NAME;
  document.getElementById("greeting-text").innerHTML = GREETING_TEXT;

  document.getElementById("radar-image").src = 'http://api.wunderground.com/api/d8585d80376a429e/animatedradar/q/MI/'+ ZIP_CODE + '.gif?newmaps=1&timelabel=1&timelabel.y=10&num=5&delay=10&radius=100&num=15&width=1235&height=525&rainsnow=1&smoothing=1&noclutter=1';
  document.getElementById("zoomed-radar-image").src = 'http://api.wunderground.com/api/d8585d80376a429e/animatedradar/q/MI/'+ ZIP_CODE + '.gif?newmaps=1&timelabel=1&timelabel.y=10&num=5&delay=10&radius=50&num=15&width=1235&height=525&rainsnow=1&smoothing=1&noclutter=1';
  document.getElementById('crawl-text').stop();

  setAlertPage();
  setForecast();
  setOutlook();
  setCurrentConditionsDEBUG();

  var row = document.getElementById('timeline-events')
  for(var i = 0; i < PAGE_ORDER.length; i++){
    var cell = row.insertCell(i);
    cell.style.width = '280px';
    cell.align = 'left';
    cell.innerHTML = PAGE_ORDER[i].name;
  }

  // start animation sequence once all the information is set
  setTimeout(startAnimation, 1000);
}

// This is temporary to display current information fetched until I have time to do it properly.
function setCurrentConditionsDEBUG(){
  document.getElementById('debug-info').innerHTML = CURRENT_CONDITION + "</br>" +
                                                    WIND_SPEED + "</br>" +
                                                    GUSTS + "</br>" +
                                                    FEELS_LIKE + "</br>" +
                                                    VISIBILITY + "</br>" +
                                                    HUMIDITY + "</br>" +
                                                    DEW_POINT + "</br>" +
                                                    PRESSURE + "</br>" +
                                                    PRESSURE_TREND + "</br>"
}

// This is the invidual day stuff (Today, Tomorrow, etc.)
function setForecast(){
  // Store all the needed elements as arrays so that they can be referenced in loops
  var forecastNarrativeElement=
  [document.getElementById("today-narrative-text"),
  document.getElementById("tonight-narrative-text"),
  document.getElementById("tomorrow-narrative-text"),
  document.getElementById("tomorrow-night-narrative-text")];

  var forecastTempElement =
  [document.getElementById("today-forecast-temp"),
  document.getElementById("tonight-forecast-temp"),
  document.getElementById("tomorrow-forecast-temp"),
  document.getElementById("tomorrow-night-forecast-temp")];

  var forecastIconElement =
  [document.getElementById("today-forecast-icon"),
  document.getElementById("tonight-forecast-icon"),
  document.getElementById("tomorrow-forecast-icon"),
  document.getElementById("tomorrow-night-forecast-icon")];

  var forecastPrecipElement =
  [document.getElementById("today-forecast-precip"),
  document.getElementById("tonight-forecast-precip"),
  document.getElementById("tomorrow-forecast-precip"),
  document.getElementById("tomorrow-night-forecast-precip")];

  for (var i = 0; i < 4; i++) {
    forecastNarrativeElement[i].innerHTML = FORECAST_NARRATIVE[i];
    forecastTempElement[i].innerHTML = FORECAST_TEMP[i];
    forecastPrecipElement[i].innerHTML = FORECAST_PRECIP[i];

    var icon = new Image();
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.src = 'assets/icons/conditions/' + OUTLOOK_ICON[i] +'.svg';
    forecastIconElement[i].innerHTML = '';
    forecastIconElement[i].appendChild(icon);
  }
}

function setOutlook(){ // Also known as 7day page
  for (var i = 0; i < 7; i++) {
    var textElement = document.getElementById("day" + i + "-text");
    var highElement = document.getElementById("day" + i + "-high");
    var lowElement = document.getElementById("day" + i + "-low");
    var conditionElement = document.getElementById("day" + i + "-condition");
    var containerElement = document.getElementById("day" + i + "-container");
    var iconElement = document.getElementById("day" + i + "-icon");
    var dayIndex = (new Date().getDay()+ i) % 7;

    var icon = new Image();
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.src = 'assets/icons/conditions/' + OUTLOOK_ICON[i] +'.svg';
    iconElement.innerHTML = '';
    iconElement.appendChild(icon);

    // Set weekends to transparent
    if(dayIndex == 0 || dayIndex == 6){
      containerElement.style.backgroundColor = "transparent"; //weekend
    }
    textElement.innerHTML = weekday[dayIndex];

    highElement.innerHTML = OUTLOOK_HIGH[i];
    lowElement.innerHTML = OUTLOOK_LOW[i];
    conditionElement.innerHTML = OUTLOOK_CONDITION[i];
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
  /* Because the first page always animates in from bottom, check if
     current page is first and set either left or top to 0px. */
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
  // Remove transition delay from greeting
  document.getElementById('greeting-text').classList.remove('shown');
  document.getElementById('local-logo-container').classList.remove('shown');

  // Hide everything
  document.getElementById('greeting-text').classList.add('hidden');
  document.getElementById('hello-text-container').classList.add('hidden');
  document.getElementById("hello-location-container").classList.add("hidden");
  document.getElementById("local-logo-container").classList.add("hidden");

  document.getElementById('crawler-container').classList.add("shown");
  setTimeout(startScrollingText, 3000);
  schedulePages();
  loadInfoBar();
}

// Set start and end times for every sub page.
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

// Called at end of sequence. Animates everything out and shows ending text
function itsAmazingOutThere(){
  clearElements();
}

// Animates everything out (not including main background)
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

// Final background animate out
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

  // Refresh clock every 5 seconds
  setTimeout(setClockTime, 5000);
}

/* Used to linearly animate a numeric value. In contex, the temperature and
   other current conditions at beginning are animated this way */
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

const baseSize = {
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
