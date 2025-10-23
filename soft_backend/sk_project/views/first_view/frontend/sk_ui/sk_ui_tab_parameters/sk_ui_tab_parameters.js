class sk_ui_tab_parameters extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = ' top left ttb fullwidth fullheight'

        this.add.text(_c => {
            _c.styling += ' fullwidth'
            _c.wrap = true
            _c.text = 'Below is a set of parameters that are available in the plugin.'
        })

        this.add.text(_c => {
            _c.styling += ' fullwidth'
            _c.wrap = true
            _c.text = 'The parameters can be automatable in your DAW and Superkraft will handle all the logic for reading and writing the parameter values.'
        })


        this.add.group(_c => {
            _c._header.weight = 'bold'
            _c._header.size = 18
            _c.header = 'Boolean (0 and 1)'

            _c.container.setup(_c => {
                _c.add.switch(_c => {
                    _c.dawPluginParamID = 'Boolean'
                    _c.text = 'Boolean'
                })
            })

        })


        this.add.group(_c => {
            _c._header.weight = 'bold'
            _c._header.size = 18
            _c.header = 'Integer (1 to 9, stepping 1)'

            _c.container.setup(_c => {
                _c.add.slider(_c => {
                    _c.dawPluginParamID = 'Integer'

                    _c.style.maxWidth = '300px'
                }, {
                    step: 1,
                    min: 1,
                    max: 9,
                    default: 5
                })
            })

        })

        this.add.group(_c => {
            _c._header.weight = 'bold'
            _c._header.size = 18
            _c.header = 'Double (0 to 100, no stepping, smooth)'

            _c.container.setup(_c => {
                _c.add.slider(_c => {
                    _c.dawPluginParamID = 'Double'

                    _c.style.maxWidth = '300px'

                    _c.min = 0
                    _c.max = 100
                    _c.defaultValue = 50
                })
            })
        })

        this.add.group(_c => {
            _c._header.weight = 'bold'
            _c._header.size = 18
            _c.header = 'List'

            _c.container.setup(_c => {
                _c.add.list(_c => {
                    _c.dawPluginParamID = 'List'

                    _c.highlightOnSelect = true

                    _c.style.border = 'solid 1px var(--sk_ui_color_dark_grey_2)'
                    _c.roundness = 12
                    _c.backgroundColor = 'var(--sk_ui_color_very_dark_grey_2)'

                    _c.items.add({
                        label: 'Option 1'
                    })

                    _c.items.add({
                        label: 'Option 2'
                    })

                    _c.items.add({
                        label: 'Option 3'
                    })
                })
            })

        })
    }
}