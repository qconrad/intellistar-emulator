function guessZipCode(){
  fetch('http://api.wunderground.com/api/' + APIKEY + '/geolookup/q/autoip.json')
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

function fetchAlerts(){
  fetch('http://api.wunderground.com/api/' + APIKEY + '/alerts/q/' + zipCode + '.json')
  .then(function(response) {
    if (response.status !== 200) {
      console.log("forecast request error");
      return;
    }
    response.json().then(function(data) {
      for(var i = 0; i < data.alerts.length; i++){
        /* Take the most important alert message and set it as crawl text
           This will supply more information i.e. tornado warning coverage */
        crawlText = data.alerts[0].message;

        // ignore special weather statements
        if(data.alerts[i].type == "SPE"){
          continue;
        }
        var now = new Date()/ 1000;
        var alertName = data.alerts[i].description.toUpperCase();
        var expire = data.alerts[i].expires.split(" on ");
        var issue = data.alerts[i].date.split(" on ");
        var issueTime = issue[0].toUpperCase();
        var issueDate = WEEKDAY[new Date(issue[1]).getDay()].toUpperCase();
        var expireTime = expire[0].toUpperCase();
        var expireDate = WEEKDAY[new Date(expire[1]).getDay()].toUpperCase();
        if(data.alerts[i].date_epoch > now){
          // in future
          alerts[i] = alertName + " FROM " + issueTime + " " + issueDate + " UNTIL " + expireTime + " " + expireDate; //FINAL DESCRIPTION
        }
        else{
          // already issued
          alerts[i] = alertName + " UNTIL " + expireTime + " " + expireDate; //FINAL DESCRIPTION
        }
      }
      fetchForecast();
    });
  })
}

function fetchForecast(){
  fetch('http://api.wunderground.com/api/' + APIKEY + '/forecast10day/q/' + zipCode + '.json')
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
  fetch('http://api.wunderground.com/api/' + APIKEY + '/conditions/q/' + zipCode + '.json')
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

      // Animate settings prompt out
      document.getElementById('settings-prompt').style.top = '-100%';
      fetchAlerts();
    });
  })
}
