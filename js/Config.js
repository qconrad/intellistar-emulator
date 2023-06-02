window.CONFIG = {
  crawl: `Thanks to all the contributors of this project. While it's not completely finished, the community effort has made this possible. Stars, contributions, and feedback are welcome and appreciated. Thanks for trying out this emulator.`,
  greeting: 'This is your weather',
  language: 'en-US', // Supported in TWC API
  countryCode: 'US', // Supported in TWC API (for postal key)
  units: 'e', // Supported in TWC API (e = English (imperial), m = Metric, h = Hybrid (UK)),
  unitField: 'imperial', // Supported in TWC API. This field will be filled in automatically. (imperial = e, metric = m, uk_hybrid = h)
  loop: false,
  secrets: {
    // Possibly deprecated key: See issue #29
    // twcAPIKey: 'd522aa97197fd864d36b418f39ebb323'
    twcAPIKey: '21d8a80b3d6b444998a80b3d6b1449d3'
  },

  // Config Functions (index.html settings manager)
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
    CONFIG.options.forEach((opt) => {
      args[opt.id] = getElement(`${opt.id}-text`).value
      localStorage.setItem(opt.id, args[opt.id])
    })
    if (args.crawlText !== '') CONFIG.crawl = args.crawlText
    if (args.greetingText !== '') CONFIG.greeting = args.greetingText
    if (args.loop === 'y') CONFIG.loop = true
    if(/(^\d{5}$)|(^\d{5}-\d{4}$)/.test(args['zip-code'])){
      zipCode = args['zip-code'];
    } else {
      alert("Enter valid ZIP code");
      return;
    }
    CONFIG.unitField = CONFIG.units === 'm' ? 'metric' : (CONFIG.units === 'h' ? 'uk_hybrid' : 'imperial')
    fetchCurrentWeather();
  },
  load: () => {
    let settingsPrompt = getElement('settings-prompt')
    let zipContainer = getElement('zip-container')
    let advancedSettingsOptions = getElement('advanced-settings-options')
    CONFIG.options.forEach((option) => {
      //<div class="regular-text settings-item settings-text">Zip Code</div>
      let label = document.createElement('div')
      label.classList.add('strong-text', 'settings-item', 'settings-text')
      label.appendChild(document.createTextNode(option.name))
      label.id = `${option.id}-label`
      //<input class="settings-item settings-text" type="text" id="zip-code-text">
      let textbox = document.createElement('input')
      textbox.classList.add('settings-item', 'settings-text', 'settings-input')
      textbox.type = 'text'
      textbox.style.fontSize = '20px'
      textbox.placeholder = option.desc
      textbox.id = `${option.id}-text`
      if (localStorage.getItem(option.id)) textbox.value = localStorage.getItem(option.id)
      let br = document.createElement('br')
      if(textbox.id == "zip-code-text"){
        textbox.setAttribute('maxlength', '5')
        textbox.style.fontSize = '35px'
        label.style.width = "auto"
        zipContainer.appendChild(label)
        zipContainer.appendChild(textbox)
        zipContainer.appendChild(br)
      }
      else{
        advancedSettingsOptions.appendChild(label)
        advancedSettingsOptions.appendChild(textbox)
        advancedSettingsOptions.appendChild(br)
      }
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
