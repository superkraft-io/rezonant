class sk_ui_tab_web extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = ' top left ttb fullwidth fullheight'
        
        var web = require('web')

        this.add.group(_c => {
            _c._header.weight = 'bold'
            _c._header.size = 18
            _c.header = 'Web Requests'

            _c.container.add.text(_c => {
                _c.wrap = true
                _c.width = 380
                _c.text = 'Use sk:web.get(), .post(), and download() to conduct HTTP operations.\n\nThe sk:web module ensures threaded HTTP requests that do not block the UI and uses CURL.'
            })

            _c.container.add.component(_c => {
                _c.styling += ' fullwidth'
                _c.vertical = false
                _c.add.roundedBtn(_c => {
                    _c.styling += ' fullwidth'
                    _c.icon = 'globe'
                    _c.text = 'GET'

                    _c.onClick = async () => {
                        var res = await web.post({ url: 'https://httpbin.org/post', key: 'value' })
                        alert('response from https://httpbin.org/post:\n\n' + JSON.stringify(res))
                    }
                })

                _c.add.roundedBtn(_c => {
                    _c.styling += ' fullwidth'
                    _c.icon = 'globe'
                    _c.text = 'POST'

                    _c.onClick = async () => {
                        var res = await web.post({ url: 'https://httpbin.org/post', key: 'value' })
                        alert('response from https://httpbin.org/post:\n\n' + JSON.stringify(res))
                    }
                })
            })

            _c.container.add.component(_c => {
                _c.styling += ' fullwidth'
                _c.vertical = false
                _c.add.roundedBtn(_c => {
                    _c.icon = 'globe'
                    _c.text = 'DOWNLOAD'
                    _c.width = 220

                    _c.onClick = async () => {
                        var res = await web.post({ url: 'https://httpbin.org/post', key: 'value' })
                        alert('response from https://httpbin.org/post:\n\n' + JSON.stringify(res))
                    }
                })

                _c.add.progressBar(_c => {
                    _c.styling += ' fullwidth'
                    _c.height = 8
                    _c.as.line({

                    })
                })
            })

        })
    }
}