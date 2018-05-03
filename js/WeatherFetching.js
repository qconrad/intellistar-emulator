function guessZipCode(){
  fetch('https://api.wunderground.com/api/' + APIKEY + '/geolookup/q/autoip.json')
  .then(function(response) {
    //check for error
    if (response.status !== 200) {
      console.log("zip code request error");
      return;
    }
    response.json().then(function(data) {
      getElement("zip-code-text").value = data.location.zip;
    });
  })
}

function fetchAlerts(){
  var alertCrawl = "";
  fetch('https://api.wunderground.com/api/' + APIKEY + '/alerts/q/' + zipCode + '.json')
  .then(function(response) {
    if (response.status !== 200) {
      console.log("forecast request error");
      return;
    }
    response.json().then(function(data) {
      for(var i = 0; i < data.alerts.length; i++){
        /* Take the most important alert message and set it as crawl text
           This will supply more information i.e. tornado warning coverage */
        alertCrawl = alertCrawl + " " + data.alerts[i].message.replace("...", "");

        // ignore special weather statements
        if(data.alerts[i].type == "SPE"){
          continue;
        }
        alerts[i] = data.alerts[i].message.replace("...", "").split("...", 1)[0].split("*", 1)[0].split("for", 1)[0].replace(/\n/g, " ").replace("...", "").toUpperCase();
      }
      if(alertCrawl != ""){
        crawlText = alertCrawl;
      }
      fetchForecast();
    });
  })
}

function fetchForecast(){
  fetch('https://api.wunderground.com/api/' + APIKEY + '/forecast10day/q/' + zipCode + '.json')
  .then(function(response) {
    if (response.status !== 200) {
      console.log("forecast request error");
      return;
    }
    response.json().then(function(data) {
      // 7 day data
      for (var i = 0; i < 7; i++) {
        outlookHigh[i] = data.forecast.simpleforecast.forecastday[i].high.fahrenheit;
        outlookLow[i] = data.forecast.simpleforecast.forecastday[i].low.fahrenheit;
        outlookCondition[i] = data.forecast.simpleforecast.forecastday[i].conditions
        // Because thunderstorm won't fit in the day box, multiline it
        outlookCondition[i] = outlookCondition[i].replace("Thunderstorm", "Thunder</br>storm");
        outlookIcon[i] = data.forecast.simpleforecast.forecastday[i].icon;
      }

      // narratives
      for (var i = 0; i <= 3; i++){
        forecastTemp.push(data.forecast.simpleforecast.forecastday[i].high.fahrenheit);
        forecastTemp.push(data.forecast.simpleforecast.forecastday[i].low.fahrenheit);
        forecastIcon[i] = data.forecast.txt_forecast.forecastday[i].icon;
        forecastNarrative[i] = data.forecast.txt_forecast.forecastday[i].fcttext;
        forecastPrecip[i] = guessPrecipitation(forecastNarrative[i], forecastTemp[i]);
      }
      scheduleTimeline();
    });
  })
}

function fetchCurrentWeather(){
  fetch('https://api.wunderground.com/api/' + APIKEY + '/conditions/q/' + zipCode + '.json')
  .then(function(response) {
    if (response.status !== 200) {
      console.log("conditions request error");
      return;
    }
    response.json().then(function(data) {
      try{cityName = data.current_observation.display_location.city.toUpperCase();}
      catch(err){alert("Enter valid ZIP code"); getZipCodeFromUser(); return;}
      currentTemperature = Math.round(data.current_observation.temp_f).toString().toUpperCase();
      currentCondition = data.current_observation.weather;
      windSpeed = data.current_observation.wind_dir + " " + data.current_observation.wind_mph + "mph";
      gusts = data.current_observation.wind_gust_mph;
      if(gusts == "0"){gusts = "NONE";}
      feelsLike = data.current_observation.feelslike_f;
      visibility = Math.round(data.current_observation.visibility_mi);
      humidity = data.current_observation.relative_humidity.replace("%", "");
      dewPoint = data.current_observation.dewpoint_f;
      pressure = data.current_observation.pressure_in;
      if(data.current_observation.pressure_trend == "+"){
        pressureTrend = "▲"
      }else{
        pressureTrend = "▼"
      }
      currentIcon = data.current_observation.icon;

      // This API only gives day icons for current conditions (for some reason?)
      // So if the time is between 7pm and 5am, we use the night icon
      var currentTime = new Date();
      if(currentTime.getHours() < 5 && currentTime.getHours() > 19){
        currentIcon = "nt_" + currentIcon;
      }
      fetchAlerts();
    });
  })
}
