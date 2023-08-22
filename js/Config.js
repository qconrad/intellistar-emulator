window.CONFIG = {
  crawl: `Thanks to all the contributors of this project. While it's not completely finished, the community effort has made this possible. Stars, contributions, and feedback are welcome and appreciated. Thanks for trying out this emulator.`,
  greeting: 'This is your weather',
  language: 'en-US', // Supported in TWC API
  countryCode: 'US', // Supported in TWC API (for postal key)
  units: 'e', // Supported in TWC API (e = English (imperial), m = Metric, h = Hybrid (UK)),
  unitField: 'imperial', // Supported in TWC API. This field will be filled in automatically. (imperial = e, metric = m, uk_hybrid = h)
  loop: false,
  locationMode: "POSTAL",
  secrets: {
    // Possibly deprecated key: See issue #29
    // twcAPIKey: 'd522aa97197fd864d36b418f39ebb323'
    twcAPIKey: '21d8a80b3d6b444998a80b3d6b1449d3'
  },

  // Config Functions (index.html settings manager)
  locationOptions:[],
  addLocationOption: (id, name, desc) => {
    CONFIG.locationOptions.push({
      id,
      name,
      desc,
    })
  },
  options: [],
  addOption: (id, name, desc) => {
    CONFIG.options.push({
      id,
      name,
      desc,
    })
  },
  submit: (btn, e) => {
    let args = {}
    CONFIG.locationOptions.forEach((opt) => {
      args[opt.id] = getElement(`${opt.id}-text`).value
      args[`${opt.id}-button`] = getElement(`${opt.id}-button`).checked
      localStorage.setItem(opt.id, args[opt.id])
    })
    args['countryCode'] = getElement('country-code-text').value
    CONFIG.options.forEach((opt) => {
      args[opt.id] = getElement(`${opt.id}-text`).value
      localStorage.setItem(opt.id, args[opt.id])
    })
    console.log(args)
    if (args.crawlText !== '') CONFIG.crawl = args.crawlText
    if (args.greetingText !== '') CONFIG.greeting = args.greetingText
    if(args.countryCode !== '') CONFIG.countryCode = args.countryCode
    if (args.loop === 'y') CONFIG.loop = true
    
    if (args['airport-code-button']==true){ 
      CONFIG.locationMode="AIRPORT" 
      if(args['airport-code'].length==0){
        alert("Please enter an airport code")
        return;
      }
    } 
    else { 
      CONFIG.locationMode="POSTAL" 
      if(args['zip-code'].length==0){
        alert("Please enter a postal code")
        return;
      }

    }
    
    zipCode = args['zip-code'];
    airportCode = args['airport-code'];
    
    CONFIG.unitField = CONFIG.units === 'm' ? 'metric' : (CONFIG.units === 'h' ? 'uk_hybrid' : 'imperial')
    fetchCurrentWeather();
  },
  load: () => {
    let settingsPrompt = getElement('settings-prompt')
    let advancedSettingsOptions = getElement('advanced-settings-options')

    //Advanced Options Setup
    CONFIG.options.forEach((option) => {
      //<div class="regular-text settings-item settings-text">Zip Code</div>
      let label = document.createElement('div')
        label.classList.add('strong-text', 'settings-item', 'settings-text', 'settings-padded')
        label.style.textAlign='left'
      label.appendChild(document.createTextNode(option.name))
      label.id = `${option.id}-label`
      //<input class="settings-item settings-text" type="text" id="zip-code-text">
      let textbox = document.createElement('textarea')
      textbox.classList.add('settings-item', 'settings-text', 'settings-input')
      textbox.type = 'text'
      textbox.style.fontSize = '20px'
      textbox.placeholder = option.desc
      textbox.id = `${option.id}-text`
      textbox.style.maxWidth='320px'
      textbox.style.minWidth='320px'
      textbox.style.height='100px'
      textbox.style.marginTop='10px'
      if (localStorage.getItem(option.id)) textbox.value = localStorage.getItem(option.id)
      let br = document.createElement('br')
      advancedSettingsOptions.appendChild(label)
      advancedSettingsOptions.appendChild(textbox)
      advancedSettingsOptions.appendChild(br)
      //<br>
    })

    let advancedButtonContainer = document.createElement('div')
    advancedButtonContainer.classList.add('settings-container')
    settingsPrompt.appendChild(advancedButtonContainer)
    let advancedButton = document.createElement('button')
    advancedButton.innerHTML = "Show advanced options"
    advancedButton.id = "advanced-options-text"
    advancedButton.setAttribute('onclick', 'toggleAdvancedSettings()')
    advancedButton.classList.add('regular-text', 'settings-input', 'button')
    advancedButtonContainer.appendChild(advancedButton)
    //<button class="setting-item settings-text" id="submit-button" onclick="checkZipCode();" style="margin-bottom: 10px;">Start</button>-->
    let btn = document.createElement('button')
    btn.classList.add('setting-item', 'settings-text', 'settings-input', 'button')
    btn.id = 'submit-button'
    btn.onclick = CONFIG.submit
    btn.style = 'margin-bottom: 10px;'
    btn.appendChild(document.createTextNode('Start'))
    settingsPrompt.appendChild(btn)
    if (CONFIG.loop || localStorage.getItem('loop') === 'y') {
      CONFIG.loop = true;
      hideSettings();
      CONFIG.submit()
    }
  }
}

CONFIG.unitField = CONFIG.units === 'm' ? 'metric' : (CONFIG.units === 'h' ? 'uk_hybrid' : 'imperial')
