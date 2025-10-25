var fs = require('fs')

var skApp = {}

module.exports = class SK_App_Main {
    constructor() {

    }

    preSKInit(skOpts) {
        console.log('Pre-SK initialization...')

        skOpts.config = '/config.json'
        var configData = fs.readFileSync(skOpts.config)
        console.log(configData)
        skApp.config = JSON.parse(configData)
    }

    preSKStart() {
        console.log('Pre-SK start...')
    }

    postSKInit(sk) {
        console.log('Post-SK initalization')
    }
}
