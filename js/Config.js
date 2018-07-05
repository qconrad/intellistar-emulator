window.CONFIG = {
  crawl: `Thanks to all the contributors of this project. While it's not completely finished, the community effort has made this possible. Stars, contributions, and feedback are welcome and appreciated. Thanks for trying out this emulator.`,
  useTWC: true,
  language: 'en-US', // Supported in TWC API
  countryCode: 'US', // Supported in TWC API (for postal key)
  units: 'e', // Supported in TWC API (e = English (imperial), m = Metric, h = Hybrid (UK)),
  unitField: 'imperial', // Supported in TWC API. This field will be filled in automatically. (imperial = e, metric = m, uk_hybrid = h)
  secrets: {
    wundergroundAPIKey: 'd8585d80376a429e',
    twcAPIKey: 'd522aa97197fd864d36b418f39ebb323'
  }
}

CONFIG.unitField = CONFIG.units === 'm' ? 'metric' : (CONFIG.units === 'h' ? 'uk_hybrid' : 'imperial')