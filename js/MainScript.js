const MORNING = [{name: "Now", subpages: [{name: "current-page", duration: 9000}, {name: "radar-page", duration: 8000}]},{name: "Today", subpages: [{name: "today-page", duration: 10000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 10000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 10000}, {name: "7day-page", duration: 13000}]},]
const NIGHT = [{name: "Now", subpages: [{name: "current-page", duration: 9000}, {name: "radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 10000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 10000}, {name: "tomorrow-night-page", duration: 10000}, {name: "7day-page", duration: 13000}]},]
const SINGLE = [{name: "Alert", subpages: [{name: "single-alert-page", duration: 7000}]},{name: "Now", subpages: [{name: "current-page", duration: 8000}, {name: "radar-page", duration: 8000}, {name: "zoomed-radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 8000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 8000}, {name: "7day-page", duration: 13000}]},]
const MULTIPLE = [{name: "Alerts", subpages: [{name: "multiple-alerts-page", duration: 7000}]},{name: "Now", subpages: [{name: "current-page", duration: 8000}, {name: "radar-page", duration: 8000}, {name: "zoomed-radar-page", duration: 8000}]},{name: "Tonight", subpages: [{name: "tonight-page", duration: 8000}]},{name: "Beyond", subpages: [{name: "tomorrow-page", duration: 8000}, {name: "7day-page", duration: 13000}]},]
const WEEKDAY = ["SUN",  "MON", "TUES", "WED", "THU", "FRI", "SAT"];
const jingle = new Audio("assets/music/jingle.wav")
const crawlSpeed = 150;
var currentLogo;
var currentLogoIndex = 0;
var zipCode;
var longitude;
var latitude;
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
var pageOrder;
var radarImage;
var alertsActive;
var zoomedRadarImage;
var alerts = [];
var music;

window.onload = function() {
  CONFIG.addOption('zip-code', 'ZIP Code')
  CONFIG.addOption('crawlText', 'Crawl Text')
  CONFIG.addOption('language', 'Language')
  CONFIG.addOption('units', 'Units')
  CONFIG.load();
  getElement('language-text').value = CONFIG.language
  getElement('units-text').value = CONFIG.units
  preLoadMusic();
  resizeWindow();
  setClockTime();
  if (localStorage.getItem('loop') !== 'y') {
    getElement("settings-container").style.display = 'block';
    guessZipCode();
  }
}

function preLoadMusic(){
  var index = Math.floor(Math.random() * 12) + 1;
  music = new Audio("assets/music/" + index + ".wav");
}

/* Set the timeline page order depending on time of day and if
alerts are present */
function scheduleTimeline(){
  var currentTime = new Date();
  var isDay = currentTime.getHours() > 4 && currentTime.getHours() < 14
  if(alerts.length == 1){
    pageOrder = SINGLE;
  }else if(alerts.length > 1){
    pageOrder = MULTIPLE;
  }else if(isDay){
    pageOrder = MORNING;
  }else{
    pageOrder = NIGHT;
  }
  setInformation();
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

function revealTimeline(){
  getElement('timeline-event-container').classList.add('shown');
  getElement('progressbar-container').classList.add('shown');
  getElement('logo-stack').classList.add('shown');
  var timelineElements = document.querySelectorAll(".timeline-item");
  for (var i = 0; i < timelineElements.length; i++) {
    timelineElements[i].style.top = '0px';
  }
}

/* Now that all the fetched information is stored in memory, display them in
the appropriate elements */
function setInformation(){
  setGreetingPage();
  setMainBackground();
  checkStormMusic();
  setAlertPage();
  setForecast();
  setOutlook();
  createLogoElements();
  setCurrentConditions();
  setTimelineEvents();
  hideSettings();
  setTimeout(startAnimation, 1000);
}

function checkStormMusic(){
  if(currentCondition.includes("storm")){
    music= new Audio("assets/music/storm.wav");
  }
}

function startAnimation(){
  setInitialPositionCurrentPage();

  jingle.play();
  setTimeout(startMusic, 5000)
  executeGreetingPage();
}

function startMusic(){
  music.play();
}

function hideSettings(){
  // Animate settings prompt out
  getElement('settings-prompt').style.top = '-100%';
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

  schedulePages();
  loadInfoBar();
  revealTimeline();
  setTimeout(showCrawl, 3000);
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
      getElement('progressbar').style.transitionDuration = pageTime + "ms";
      getElement('progressbar').classList.add('progress');
      getElement('timeline-event-container').style.left = (-280*pageIndex).toString() + "px";
      getElement('progress-stack').style.left = (-280*pageIndex).toString() + "px";
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
    setTimeout(hideCrawl, 2000);


  if(currentSubPageName == "current-page"){
    setTimeout(loadCC, 1000);
    setTimeout(scrollCC, currentSubPageDuration / 2);
    animateValue('cc-temperature-text', -20, currentTemperature, 2500, 1);
    animateDialFill('cc-dial-color', 0, 1000, 15);
  }
  else if(currentSubPageName == 'radar-page'){
    startRadar();
  }
  else if(currentSubPageName == 'zoomed-radar-page'){
    startZoomedRadar();
  }
  else if(currentSubPageName == "7day-page"){
  }
}

function clearPage(pageIndex, subPageIndex){
  var currentPage = pageOrder[pageIndex];
  var currentSubPageName = currentPage.subpages[subPageIndex].name;
  var currentSubPageElement = getElement(currentSubPageName);
  var subPageCount = currentPage.subpages.length
  var currentSubPageDuration = currentPage.subpages[subPageIndex].duration;

  var isNewPage = subPageCount-1 == subPageIndex;
  var isLastPage = pageIndex >= pageOrder.length-1 && subPageIndex >= pageOrder[pageOrder.length-1].subpages.length-1;

  if(isNewPage && !isLastPage){
    resetProgressBar();
  }

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
  void getElement('progressbar').offsetWidth;
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
  animateValue("cc-visibility", 0, visibility, 800, 1);
  animateValue("cc-humidity", 0, humidity, 1000, 1);
  animateValue("cc-dewpoint", 0, dewPoint, 1200, 1);
  animateValue("cc-pressure1", 0, pressureArray[0], 1400, 1);
  animateValue("cc-pressure2", 0, pressureArray[1], 1400, 2);
}

// Called at end of sequence. Animates everything out and shows ending text
function endSequence(){
  clearInfoBar();
}

function twcLogoClick() {
  var loopStatus = localStorage.getItem('loop');
  if(loopStatus == "n"){
    localStorage.setItem('loop', 'y');}
  else{
    localStorage.setItem('loop', 'n');}
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
  if (CONFIG.loop) {
    location.reload()
  } else {
    getElement('background-image').classList.add("above-screen");
    getElement('content-container').classList.add("above-screen");
  }
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
function animateValue(id, start, end, duration, pad) {
  var obj = getElement(id);
  if(start == end){
    obj.innerHTML = end;
    return;
  }
  var range = end - start;
  var current = start;
  var increment = end > start? 1 : -1;
  var stepTime = Math.abs(Math.floor(duration / range));
  var timer = setInterval(function() {
      current += increment;
      obj.innerHTML = current.pad(pad);
      if (current == end) {
          clearInterval(timer);
      }
  }, stepTime);
}
function animateDialFill(id, start, end, duration) {
  var obj = getElement(id);
  var range = end - start;
  var current = start;
  var increment = end > start? 1 : -1;
  var stepTime = Math.abs(Math.floor(duration / range));
  var r = 100
  var g = 100
  var b = 225

  // 1 = blue
  // 2 = orange
  // 3 = orange2
  // 4 = red
  var incType = 1;
  var f = `rgb(${r}, ${g}, ${b})`
  var timer = setInterval(function() {
      //current += increment;
      if (incType == 1) {
        b += increment;
        r -= increment;
        g -= increment;
        if (r == 0) {
          incType = 2
        }
      } else if (incType == 2) {
        r += increment;
        g += increment;
        b -= increment;
        if (g == 180) {
          incType = 3;
        }
      } else if (incType == 3) {
        r += increment;
        g -= increment * 0.8;
        if (g < 85) {
          incType = 4;
        }
      } else {
        r += increment;
        g -= increment;
        b -= increment;
      }
      f = `rgb(${r}, ${g}, ${b})`
      obj.style.fill = f;
      if (current == end) {
          clearInterval(timer);
      }
  }, stepTime);
}
Number.prototype.pad = function(size) {
    var s = String(this);
    while (s.length < (size || 2)) {s = "0" + s;}
    return s;
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

function showCrawl(){
  getElement('crawler-container').classList.add("shown");
  setTimeout(startCrawl, 1000); // wait for it to fully animate out before starting
}

function hideCrawl(){
  getElement('crawler-container').classList.add("hidden");
}

function startCrawl(){
  calculateCrawlSpeed();
  getElement('crawl-text').classList.add('animate');
}

function calculateCrawlSpeed() {
  var crawlTextElement = getElement('crawl-text');
  var elementLength = crawlTextElement.offsetWidth;
  var timeTaken = elementLength / crawlSpeed;
  crawlTextElement.style.animationDuration = timeTaken + "s";
}
