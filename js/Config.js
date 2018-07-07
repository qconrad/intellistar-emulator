window.CONFIG = {
  crawl: `Thanks to all the contributors of this project. While it's not completely finished, the community effort has made this possible. Stars, contributions, and feedback are welcome and appreciated. Thanks for trying out this emulator.`,
  useTWC: true,
  language: 'en-US', // Supported in TWC API
  countryCode: 'US', // Supported in TWC API (for postal key)
  units: 'e', // Supported in TWC API (e = English (imperial), m = Metric, h = Hybrid (UK)),
  unitField: 'imperial', // Supported in TWC API. This field will be filled in automatically. (imperial = e, metric = m, uk_hybrid = h)
  loop: false,
  picsumBackground: false,
  secrets: {
    wundergroundAPIKey: 'd8585d80376a429e',
    twcAPIKey: 'd522aa97197fd864d36b418f39ebb323'
  },

  // Config Functions (index.html settings manager)
  options: [],
  addOption: (id, name) => {
    CONFIG.options.push({
      id,
      name
    })
  },
  submit: (btn, e) => {
    let args = {}
    CONFIG.options.forEach((opt) => {
      args[opt.id] = getElement(`${opt.id}-text`).value
      localStorage.setItem(opt.id, args[opt.id])
    })
    if (args.crawlText !== '') CONFIG.crawl = args.crawlText
    if (args.language !== '') CONFIG.language = args.language
    if (args.units !== '') CONFIG.units = args.units
    if (args.otherBg === 'y') CONFIG.picsumBackground = true
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
    let settingsPrompt = document.getElementById('settings-prompt')
    CONFIG.options.forEach((option) => {
      //<div class="regular-text settings-item settings-text">Zip Code</div>
      let label = document.createElement('div')
      label.classList.add('regular-text', 'settings-item', 'settings-text')
      label.appendChild(document.createTextNode(option.name))
      label.id = `${option.id}-label`
      //<input class="settings-item settings-text" type="text" id="zip-code-text">
      let textbox = document.createElement('input')
      textbox.classList.add('settings-item', 'settings-text')
      textbox.type = 'text'
      textbox.id = `${option.id}-text`
      if (localStorage.getItem(option.id)) textbox.value = localStorage.getItem(option.id)
      //<br>
      let br = document.createElement('br')
      settingsPrompt.appendChild(label)
      settingsPrompt.appendChild(textbox)
      settingsPrompt.appendChild(br)
    })
    //<button class="setting-item settings-text" id="submit-button" onclick="checkZipCode();" style="margin-bottom: 10px;">Start</button>-->
    let btn = document.createElement('button')
    btn.classList.add('setting-item', 'settings-text')
    btn.id = 'submit-button'
    btn.onclick = CONFIG.submit
    btn.style = 'margin-bottom: 10px;'
    btn.appendChild(document.createTextNode('Start'))
    settingsPrompt.appendChild(btn)
    if (localStorage.getItem('loop') === 'y') {
      hideSettings();
      CONFIG.submit()
    }
  }
}

CONFIG.unitField = CONFIG.units === 'm' ? 'metric' : (CONFIG.units === 'h' ? 'uk_hybrid' : 'imperial')
