function setGreetingPage(){
  getElement("hello-location-text").innerHTML = cityName + ",";
  getElement("infobar-location-text").innerHTML = cityName;
  getElement("greeting-text").innerHTML = CONFIG.greeting;
  getElement("crawl-text").innerHTML = CONFIG.crawl;
}

function setTimelineEvents(){
  var eventContainer = getElement('timeline-event-container');
  var progreessBarStack = getElement('progress-stack');
  for(var i = 0; i < pageOrder.length; i++){
    var eventElement = document.createElement("div");
    eventElement.innerHTML = pageOrder[i].name;
    eventElement.classList.add("regular-text");
    eventElement.classList.add("timeline-item");
    eventElement.style.transitionDelay = (i*200).toString() + "ms";
    eventContainer.appendChild(eventElement);

    if(i != 0){
      var progressElement = document.createElement("div");
      progressElement.classList.add("timeline-bar");
      progreessBarStack.appendChild(progressElement);
    }
  }
}

function setCurrentConditions(){
  getElement('cc-condition').innerHTML = currentCondition;
  getElement('cc-wind').innerHTML = windSpeed;
  getElement('cc-gusts').innerHTML = gusts;
  getElement('cc-feelslike').innerHTML = feelsLike;
  getElement('cc-pressuretrend').innerHTML = pressureTrend;
  getElement('ccicon').href.baseVal = 'assets/icons/conditions/' + currentIcon +'.svg';
}

function createLogoElements(){
  var alreadyAddedLogos = [];
  for(var p = 0; p < pageOrder.length; p++){
    for (var s = 0; s < pageOrder[p].subpages.length; s++) {
      //for every single sub page
      var currentPage = getPageLogoFileName(pageOrder[p].subpages[s].name);

      if(!alreadyAddedLogos.includes(currentPage)){
        var logo = new Image();
        logo.style.width = '85px';
        logo.style.height = '85px';
        logo.style.marginRight = '20px'
        logo.src = 'assets/timeline/' + currentPage;
        getElement('logo-stack').appendChild(logo);
        alreadyAddedLogos.push(currentPage);
      }
    }
  }
}

// This is the invidual day stuff (Today, Tomorrow, etc.)
function setForecast(){
  // Store all the needed elements as arrays so that they can be referenced in loops
  var forecastNarrativeElement=
    [getElement("today-narrative-text"),
     getElement("tonight-narrative-text"),
     getElement("tomorrow-narrative-text"),
     getElement("tomorrow-night-narrative-text")];

  var forecastTempElement =
    [getElement("today-forecast-temp"),
     getElement("tonight-forecast-temp"),
     getElement("tomorrow-forecast-temp"),
     getElement("tomorrow-night-forecast-temp")];

  var forecastIconElement =
    [getElement("today-forecast-icon"),
     getElement("tonight-forecast-icon"),
     getElement("tomorrow-forecast-icon"),
     getElement("tomorrow-night-forecast-icon")];

  var forecastPrecipElement =
    [getElement("today-forecast-precip"),
     getElement("tonight-forecast-precip"),
     getElement("tomorrow-forecast-precip"),
     getElement("tomorrow-night-forecast-precip")];

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
    var textElement = getElement("day" + i + "-text");
    var highElement = getElement("day" + i + "-high");
    var lowElement = getElement("day" + i + "-low");
    var conditionElement = getElement("day" + i + "-condition");
    var containerElement = getElement("day" + i + "-container");
    var iconElement = getElement("day" + i + "-icon");
    var dayIndex = (new Date().getDay()+ i + 1) % 7;

    var icon = new Image();
    icon.style.width = '100%';
    icon.style.height = '100%';
    icon.src = 'assets/icons/conditions/' + outlookIcon[i] +'.svg';
    iconElement.innerHTML = '';
    iconElement.appendChild(icon);

    // Set weekends to transparent
    var isWeekend = dayIndex == 0 || dayIndex == 6;
    if(isWeekend){
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
    getElement("single-alert0").innerHTML = alerts[0];
  }
  else{
    for(var i = 0; i < Math.min(3, alerts.length); i++){
      var idName = 'alert' + i;
      getElement(idName).innerHTML = alerts[i];
    }
  }
}

/* Because the first page always animates in from bottom, check if
   current page is first and set either left or top to 0px. */
function setInitialPositionCurrentPage(){
  if(pageOrder[0].subpages[0].name == 'current-page'){
    getElement('current-page').style.left = '0px';
  }
  else{
    getElement('current-page').style.top = '0px';
  }
}

function getPageLogoFileName(subPageName){
  switch (subPageName) {
    case "single-alert-page":
      return "8logo.svg";

    case "multiple-alerts-page":
      return "8logo.svg";

    case "current-page":
      return "thermometer.svg";

    case "radar-page":
      return "radar1.svg";

    case "zoomed-radar-page":
      return "radar2.svg";

    case "today-page":
      return "calendar.svg";

    case "tonight-page":
      return "calendar.svg";

    case "tomorrow-page":
      return "calendar.svg";

    case "tomorrow-night-page":
      return "calendar.svg";

    case "7day-page":
      return "week.svg";
  }
}
