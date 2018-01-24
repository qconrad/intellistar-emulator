const APIKEY = "d8585d80376a429e";
const MORNING = [{name: "Now", subpages: [{name: "current-page", duration: 9000}, {name: "radar-page", duration: 8000}]},{name: "Today", subpages: [{name: "today-page", duration: 10000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 10000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 10000}, {name: "7day-page", duration: 13000}]},]
const NIGHT = [{name: "Now", subpages: [{name: "current-page", duration: 9000}, {name: "radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 10000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 10000}, {name: "tomorrow-night-page", duration: 10000}, {name: "7day-page", duration: 13000}]},]
const SINGLE = [{name: "Alert", subpages: [{name: "single-alert-page", duration: 7000}]},{name: "Now", subpages: [{name: "current-page", duration: 8000}, {name: "radar-page", duration: 8000}, {name: "zoomed-radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 8000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 8000}, {name: "7day-page", duration: 13000}]},]
const MULTIPLE = [{name: "Alerts", subpages: [{name: "multiple-alerts-page", duration: 7000}]},{name: "Now", subpages: [{name: "current-page", duration: 8000}, {name: "radar-page", duration: 8000}, {name: "zoomed-radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 8000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 8000}, {name: "7day-page", duration: 13000}]},]
const WEEKDAY = ["SUN",  "MON", "TUES", "WED", "THU", "FRI", "SAT"];
const jingle = new Audio("assets/music/jingle.wav")
var currentLogo;
var currentLogoIndex = 0;
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
  if(alerts.length == 1){
    pageOrder = SINGLE;
  }else if(alerts.length > 1){
    pageOrder = MULTIPLE;
  }else if(currentTime.getHours() > 4 && currentTime.getHours() < 14){
    pageOrder = MORNING;
  }else{
    pageOrder = NIGHT;
  }
  setInformation();
}

/* Check if zip code is accurate by doing a regex pass and then
confirming with api request */
function checkZipCode(){
  var isValidZip = false;
    var input = getElement('zip-code-text').value;
    if(/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(input)){
      isValidZip = true;
      zipCode = input;
    }
    else{
      alert("Enter valid ZIP code");
      return;
    }
    // Animate settings prompt out
    getElement('settings-prompt').style.top = '-100%';
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
  setRadarImages();
  setGreetingPage();
  setMainBackground();
  setAlertPage();
  setForecast();
  setOutlook();
  createLogoElements();
  setCurrentConditions();
  setTimelineEvents();
  startAnimation();
}

function startAnimation(){
  hideSettings();
  setInitialPositionCurrentPage();

  jingle.play();
  setTimeout(startMusic, 5000)
  executeGreetingPage();
}

function startMusic(){
  music.play();
}

function hideSettings(){
  getElement("settings-container").style.display = 'none';
}

function executeGreetingPage(){
  getElement('background-image').classList.remove("below-screen");
  getElement('content-container').classList.add('shown');
  getElement('infobar-twc-logo').classList.add('shown');
  getElement('hello-text').classList.add('shown');
  getElement('hello-location-text').classList.add('shown');
  getElement('greeting-text').classList.add('shown');
  getElement('local-logo-container').classList.add("shown");
  setTimeout(clearGreetingPage, 2500);
}

function clearGreetingPage(){
  // Remove transition delay from greeting
  getElement('greeting-text').classList.remove('shown');
  getElement('local-logo-container').classList.remove('shown');

  // Hide everything
  getElement('greeting-text').classList.add('hidden');
  getElement('hello-text-container').classList.add('hidden');
  getElement("hello-location-container").classList.add("hidden");
  getElement("local-logo-container").classList.add("hidden");

  // Show crawl container
  getElement('crawler-container').classList.add("shown");
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
  var currentPage = pageOrder[pageIndex];
  var currentSubPageName = currentPage.subpages[subPageIndex].name;
  var currentSubPageElement = getElement(currentSubPageName);
  var subPageCount = currentPage.subpages.length
  var currentSubPageDuration = currentPage.subpages[subPageIndex].duration;

  if(subPageIndex === 0){
    var pageTime = 0;
    for (var i = 0; i < subPageCount; i++) {
      pageTime += currentPage.subpages[i].duration;
    }
      void getElement('progressbar').offsetWidth;
      getElement('progressbar').style.transitionDuration = pageTime + "ms";
      getElement('progressbar').classList.add('progress');
      getElement('timeline-events-container').style.left = ((-280*pageIndex)-(pageIndex*3)).toString() + "px";
  }

  if(currentLogo != getPageLogoFileName(currentSubPageName)){
    getElement('logo-stack').style.left = ((-85*currentLogoIndex)-(20*currentLogoIndex)).toString() + "px";
    currentLogo = getPageLogoFileName(currentSubPageName);
    currentLogoIndex++;
  }

  currentSubPageElement.style.transitionDelay = '0.5s';
  if(pageIndex === 0 && subPageIndex == 0){
    currentSubPageElement.style.top = '0px';
  }
  else{
    currentSubPageElement.style.left = '0px';
  }

  var isLastPage = pageIndex >= pageOrder.length-1 && subPageIndex >= pageOrder[pageOrder.length-1].subpages.length-1;
  if(isLastPage)
      hideCrawlContainer();
  else if(currentSubPageName == "current-page"){
    setTimeout(loadCC, 1000);
    setTimeout(scrollCC, currentSubPageDuration / 2);
    animateValue('cc-temperature-text', -20, currentTemperature, 2500);
  }
  else if(currentSubPageName == 'radar-page'){
    startRadar();
  }
  else if(currentSubPageName == 'zoomed-radar-page'){
    startZoomedRadar();
  }
}

function clearPage(pageIndex, subPageIndex){
  var currentPage = pageOrder[pageIndex];
  var currentSubPageName = currentPage.subpages[subPageIndex].name;
  var currentSubPageElement = getElement(currentSubPageName);
  var subPageCount = currentPage.subpages.length
  var currentSubPageDuration = currentPage.subpages[subPageIndex].duration;

  var isNewPage = subPageCount-1 == subPageIndex;
  if(isNewPage){
    resetProgressBar();
  }

  var isLastPage = pageIndex >= pageOrder.length-1 && subPageIndex >= pageOrder[pageOrder.length-1].subpages.length-1;
  if(isLastPage){
    endSequence();
  }
  else{
    currentSubPageElement.style.transitionDelay = '0s';
    currentSubPageElement.style.left = '-101%';
  }
}

function resetProgressBar(){
  getElement('progressbar').style.transitionDuration = '0ms';
  getElement('progressbar').classList.remove('progress');
}

function hideCrawlContainer(){
  getElement('crawler-container').classList.add("hidden");
}

function startRadar(){
  getElement('radar-container').appendChild(radarImage);
}

function startZoomedRadar(){
  getElement('zoomed-radar-container').appendChild(zoomedRadarImage);
}

function loadCC(){
  var ccElements = document.querySelectorAll(".cc-vertical-group");
  for (var i = 0; i < ccElements.length; i++) {
    ccElements[i].style.top = '0px';
  }
}

function scrollCC(){
  var ccElements = document.querySelectorAll(".cc-vertical-group");
  for (var i = 0; i < ccElements.length; i++) {
    ccElements[i].style.top = '-80px';
  }
  // Split decimal into 2 objects so that we can animate them individually.
  var pressureArray = pressure.toString().split('.');
  animateValue("cc-visibility", 0, visibility, 800);
  animateValue("cc-humidity", 0, humidity, 1000);
  animateValue("cc-dewpoint", 0, dewPoint, 1200);
  animateValue("cc-pressure1", 0, pressureArray[0], 1400);
  animateValue("cc-pressure2", 0, pressureArray[1], 1400);
}

// Called at end of sequence. Animates everything out and shows ending text
function endSequence(){
  clearInfoBar();
}

function clearInfoBar(){
  getElement("infobar-twc-logo").classList.add("hidden");
  getElement("infobar-local-logo").classList.add("hidden");
  getElement("infobar-location-container").classList.add("hidden");
  getElement("infobar-time-container").classList.add("hidden");
  setTimeout(clearElements, 200);
}

// Animates everything out (not including main background)
function clearElements(){
  getElement("outlook-titlebar").classList.add('hidden');
  getElement("forecast-left-container").classList.add('hidden');
  getElement("forecast-right-container").classList.add('hidden');
  getElement("content-container").classList.add("expand");
  getElement("timeline-container").style.visibility = "hidden";
  showEnding();
  setTimeout(clearEnd, 2000);
}

function showEnding(){
  var alertsActive = alerts.length >= 1;
  if(alertsActive){
    stayUpdated();
  }
  else{
    itsAmazingOutThere();
  }
}

function itsAmazingOutThere(){
  getElement('amazing-text').classList.add('extend');
  getElement("amazing-logo").classList.add('shown');
  getElement("amazing-container").classList.add('hide');
}

function stayUpdated(){
  getElement('updated-text').classList.add('extend');
  getElement("updated-logo").classList.add('shown');
  getElement("updated-container").classList.add('hide');
}

// Final background animate out
function clearEnd(){
  getElement('background-image').classList.add("above-screen");
  getElement('content-container').classList.add("above-screen");
}

function startScrollingText(){
  getElement('crawl-text').start();
  getElement("crawl-text").innerHTML = crawlText.toUpperCase();
  getElement('crawl-text').style.opacity = "1";
}

function loadInfoBar(){
  getElement("infobar-local-logo").classList.add("shown");
  getElement("infobar-location-container").classList.add("shown");
  getElement("infobar-time-container").classList.add("shown");
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
  getElement("infobar-time-text").innerHTML = finalString;

  // Refresh clock every 5 seconds
  setTimeout(setClockTime, 5000);
}

/* Used to linearly animate a numeric value. In contex, the temperature and
   other current conditions at beginning are animated this way */
function animateValue(id, start, end, duration) {
  var range = end - start;
  var current = start;
  var increment = end > start? 1 : -1;
  var stepTime = Math.abs(Math.floor(duration / range));
  var obj = getElement(id);
  var timer = setInterval(function() {
      current += increment;
      obj.innerHTML = current;
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

  getElement('render-frame').style.transform = 'scale(' + newScale + ',' +  newScale + ')';
}

function getElement(id){
  return document.getElementById(id);
}
