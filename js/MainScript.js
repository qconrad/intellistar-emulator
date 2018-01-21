const APIKEY = "d8585d80376a429e";
const MORNING = [{name: "Now", subpages: [{name: "current-page", duration: 9000}, {name: "radar-page", duration: 8000}]},{name: "Today", subpages: [{name: "today-page", duration: 10000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 10000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 10000}, {name: "7day-page", duration: 13000}]},]
const NIGHT = [{name: "Now", subpages: [{name: "current-page", duration: 9000}, {name: "radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 10000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 10000}, {name: "tomorrow-night-page", duration: 10000}, {name: "7day-page", duration: 13000}]},]
const SINGLE = [{name: "Alert", subpages: [{name: "single-alert-page", duration: 7000}]},{name: "Now", subpages: [{name: "current-page", duration: 8000}, {name: "radar-page", duration: 8000}, {name: "zoomed-radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 8000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 8000}, {name: "7day-page", duration: 13000}]},]
const MULTIPLE = [{name: "Alerts", subpages: [{name: "multiple-alerts-page", duration: 7000}]},{name: "Now", subpages: [{name: "current-page", duration: 8000}, {name: "radar-page", duration: 8000}, {name: "zoomed-radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 8000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 8000}, {name: "7day-page", duration: 13000}]},]
const WEEKDAY = ["SUN",  "MON", "TUES", "WED", "THU", "FRI", "SAT"];
const jingle = new Audio("assets/music/jingle.wav")
﻿var zipCode;
var cityName;
var currentTemperature;
var greetingText = "This is your weather.";
var currentIcon;
var currentCondition;
var windSpeed;
var gusts;
var feelsLike;
var visibility;
var humidity;
var dewPoint;
var pressure;
var pressureTrend;
var forecastNarrative = [];
var forecastTemp = [];
var forecastIcon = [];
var forecastPrecip = [];
var outlookHigh = [];
var outlookLow = [];
var outlookCondition = [];
var outlookIcon = [];
var crawlText = "Thanks for trying this emulator. It's a work in progress, so it's not perfect. If you have any contributions to the code or you have assets, I encourge you to submit a pull request on github. And finally, if you enjoyed this, please star the repository on github and share with others so other people can find this.";
var pageOrder;
var radarImage;
var zoomedRadarImage;
var alerts = [];
var music;

window.onload = function() {
  preLoadMusic();
  resizeWindow();
  setClockTime();
  guessZipCode();
}

function preLoadMusic(){
  var index = Math.floor(Math.random() * 12) + 1;
  music= new Audio("assets/music/" + index + ".wav");
}

/* Set the timeline page order depending on time of day and if
alerts are present */
function scheduleTimeline(){
  var currentTime = new Date();
  if(currentTime.getHours() > 4 && currentTime.getHours() < 14){
    pageOrder = MORNING;
  }else if(alerts.length == 1){
    pageOrder = SINGLE;
  }else if(alerts.length > 1){
    pageOrder = MULTIPLE;
  }else{
    pageOrder = NIGHT;
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
      zipCode = input;
    }
    else{
      alert("Enter valid ZIP code");
      return;
    }
    fetchCurrentWeather();
}

/* Because this particular API doesn't seem to have day by day precipitation,
we use things like the temperature and narrative to try and guess it */
function guessPrecipitation(narrativeText, temperature){
  var precipType = "";
  var precipValue = "0"

  // Guess percent chance
  var parsedChance = narrativeText.match(/\S+(?=%)/g);
  if(parsedChance != null){
    precipValue = parsedChance;
  }
  else if(precipValue === "0"){
    if(narrativeText.toLowerCase().includes("slight chance")){
      precipValue = "20";
    }else if (narrativeText.toLowerCase().includes("a few") && narrativeText.toLowerCase().includes("possible")){
      precipValue = "10";
    }
  }

  // Guess type of precipitation (i.e. rain, snow)
    var narrativeLowerCase = narrativeText.toLowerCase();
  if(narrativeLowerCase.includes("chance of precip")){
    precipType = "Precip";
  }
  else if(  narrativeLowerCase.includes("snow") || narrativeLowerCase.includes("flurr")){
    precipType = "Snow";
  }
  else if(narrativeLowerCase.includes("rain") || narrativeLowerCase.includes("shower")){
    precipType = "Rain"
  }

  /* Just because the temperature is below the freezing point of 32 degress, doesn't neccesarly
     mean that precipitation would be snow, however if there is no text to indicate pricpitation (i.e. 0% chance)
     then it doesn't really matter if it says 0% chance of snow or rain because neither would happen anyway */
     if(precipType == ""){
       if(temperature <= 32){
         precipType = "Snow";
       }
       else{
         precipType = "Rain"
       }
     }

  return precipValue + "% Chance</br>of " + precipType;
}

/* Now that all the fetched information is stored in memory, display them in
the appropriate elements */
function setInformation(){
  document.getElementById("hello-location-text").innerHTML = cityName + ",";
  document.getElementById("infobar-location-text").innerHTML = cityName;
  document.getElementById("greeting-text").innerHTML = greetingText;

  radarImage = new Image();
  radarImage.onerror = function () {
    document.getElementById('radar-container').style.display = 'none';
  }
  radarImage.src = 'http://api.wunderground.com/api/' + APIKEY + '/animatedradar/q/MI/'+ zipCode + '.gif?newmaps=1&timelabel=1&timelabel.y=10&num=5&delay=10&radius=100&num=15&width=1235&height=525&rainsnow=1&smoothing=1&noclutter=1';

  if(pageOrder == SINGLE || pageOrder == MULTIPLE){
    zoomedRadarImage = new Image();
    zoomedRadarImage.onerror = function () {
      document.getElementById('zoomed-radar-container').style.display = 'none';
    }
    zoomedRadarImage.src = 'http://api.wunderground.com/api/' + APIKEY + '/animatedradar/q/MI/'+ zipCode + '.gif?newmaps=1&timelabel=1&timelabel.y=10&num=5&delay=10&radius=50&num=15&width=1235&height=525&rainsnow=1&smoothing=1&noclutter=1';
  }

  document.getElementById('crawl-text').stop();

  setMainBackground();
  setAlertPage();
  setForecast();
  setOutlook();
  setCurrentConditionsDEBUG();

  var row = document.getElementById('timeline-events')
  for(var i = 0; i < pageOrder.length; i++){
    var cell = row.insertCell(i);
    cell.style.width = '280px';
    cell.align = 'left';
    cell.innerHTML = pageOrder[i].name;
  }

  startAnimation();
}

function startAnimation(){
  setTimeout(startAnimation, 2000);
}

// This is temporary to display current information fetched until I have time to do it properly.
function setCurrentConditionsDEBUG(){
  document.getElementById('debug-info').innerHTML = "Current Condition: " + currentCondition + "</br>" +
                                                    "Wind Speed: " + windSpeed + "</br>" +
                                                    "Gusts: " + gusts + "</br>" +
                                                    "Feels Like: " + feelsLike + "</br>" +
                                                    "Visibility: " + visibility + "</br>" +
                                                    "Humidity: " + humidity + "</br>" +
                                                    "Dew Point: " + dewPoint + "</br>" +
                                                    "Pressure: " + pressure + "</br>" +
                                                    "Pressure Trend : " + pressureTrend + "</br>"

  document.getElementById('ccicon').src = 'assets/icons/conditions/' + currentIcon +'.svg';
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
    forecastNarrativeElement[i].innerHTML = forecastNarrative[i];
    forecastTempElement[i].innerHTML = forecastTemp[i];
    forecastPrecipElement[i].innerHTML = forecastPrecip[i];

    var icon = new Image();
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.src = 'assets/icons/conditions/' + forecastIcon[i] +'.svg';
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
    icon.src = 'assets/icons/conditions/' + outlookIcon[i] +'.svg';
    iconElement.innerHTML = '';
    iconElement.appendChild(icon);

    // Set weekends to transparent
    if(dayIndex == 0 || dayIndex == 6){
      containerElement.style.backgroundColor = "transparent"; //weekend
    }
    textElement.innerHTML = WEEKDAY[dayIndex];

    highElement.innerHTML = outlookHigh[i];
    lowElement.innerHTML = outlookLow[i];
    conditionElement.innerHTML = outlookCondition[i];
  }
}

function setAlertPage(){
  if(alerts.length === 0)
    return;

  if(alerts.length == 1){
    document.getElementById("single-alert0").innerHTML = alerts[0];
  }
  else{
    for(var i = 0; i < Math.min(3, alerts.length); i++){
      var idName = 'alert' + i;
      document.getElementById(idName).innerHTML = alerts[i];
    }
  }
}

function startAnimation(){
  document.getElementById("settings-container").style.display = 'none';
  /* Because the first page always animates in from bottom, check if
     current page is first and set either left or top to 0px. */
  if(pageOrder[0].subpages[0].name == 'current-page'){
    document.getElementById('current-page').style.left = '0px';
  }
  else{
    document.getElementById('current-page').style.top = '0px';
  }
  jingle.play();
  setTimeout(StartMusic, 5000)
  startGreetingPage();
}

function StartMusic(){
  music.play();
}

function startGreetingPage(){
  document.getElementById('background-image').classList.remove("below-screen");
  document.getElementById('content-container').classList.add('shown');
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
  for(var p = 0; p < pageOrder.length; p++){
    for (var s = 0; s < pageOrder[p].subpages.length; s++) {
      //for every single sub page
      var startTime = cumlativeTime;
      var clearTime = cumlativeTime + pageOrder[p].subpages[s].duration;
      setTimeout(executePage, startTime, p, s);
      setTimeout(clearPage, clearTime, p, s);
      cumlativeTime = clearTime;
    }
  }
}

function executePage(pageIndex, subPageIndex){
  var pageName = pageOrder[pageIndex].subpages[subPageIndex].name;
  var pageElement = document.getElementById(pageName);
  // console.log(pageName);
  if(subPageIndex === 0){
      var pageTime = 0;
      for (var i = 0; i < pageOrder[pageIndex].subpages.length; i++) {
        pageTime += pageOrder[pageIndex].subpages[i].duration;
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

  if(pageIndex >= pageOrder.length-1 && subPageIndex >= pageOrder[pageOrder.length-1].subpages.length-1)
      document.getElementById('crawler-container').classList.add("hidden");
  else if(pageName == "current-page"){
    animateValue('cc-temperature-text', -20, currentTemperature, 2500, "", "°");
  }
  else if(pageName == 'radar-page'){
    var imageElementTest = document.getElementById('radar-container').appendChild(radarImage);
  }
  else if(pageName == 'zoomed-radar-page'){
    document.getElementById('zoomed-radar-container').appendChild(zoomedRadarImage);
  }
}

function clearPage(pageIndex, subPageIndex){
  var pageName = pageOrder[pageIndex].subpages[subPageIndex].name;
  var pageElement = document.getElementById(pageName);
  if(pageOrder[pageIndex].subpages.length-1 == subPageIndex){
    document.getElementById('progressbar').style.transitionDuration = '0ms';
    document.getElementById('progressbar').classList.remove('progress');
  }

  if(pageIndex >= pageOrder.length-1 && subPageIndex >= pageOrder[pageOrder.length-1].subpages.length-1){
    endSequence();
  }
  else{
    pageElement.style.transitionDelay = '0s';
    pageElement.style.left = '-101%';
  }
}

// Called at end of sequence. Animates everything out and shows ending text
function endSequence(){
  clearInfoBar();
}

function clearInfoBar(){
  document.getElementById("infobar-twc-logo").classList.add("hidden");
  document.getElementById("infobar-local-logo").classList.add("hidden");
  document.getElementById("infobar-location-container").classList.add("hidden");
  document.getElementById("infobar-time-container").classList.add("hidden");
  setTimeout(clearElements, 200);
}

// Animates everything out (not including main background)
function clearElements(){
  document.getElementById("outlook-titlebar").classList.add('hidden');
  document.getElementById("forecast-left-container").classList.add('hidden');
  document.getElementById("forecast-right-container").classList.add('hidden');
  document.getElementById("content-container").classList.add("expand");
  document.getElementById("timeline-container").style.visibility = "hidden";

  if(alerts.length >= 1){
    stayUpdated();
  }
  else{
    itsAmazingOutThere();
  }

  setTimeout(clearEnd, 2000);
}

function itsAmazingOutThere(){
  document.getElementById('amazing-text').classList.add('extend');
  document.getElementById("amazing-logo").classList.add('shown');
  document.getElementById("amazing-container").classList.add('hide');
}

function stayUpdated(){
  document.getElementById('updated-text').classList.add('extend');
  document.getElementById("updated-logo").classList.add('shown');
  document.getElementById("updated-container").classList.add('hide');
}

// Final background animate out
function clearEnd(){
  document.getElementById('background-image').classList.add("above-screen");
  document.getElementById('content-container').classList.add("above-screen");
}

function startScrollingText(){
  document.getElementById('crawl-text').start();
  document.getElementById("crawl-text").innerHTML = crawlText.toUpperCase();
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
