class sk_ui_tab_nativeActions extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = ' top left  ttb fullwidth fullheight'

        this.add.group(_c => {
            _c._header.weight = 'bold'
            _c._header.size = 18
            _c.header = 'Native Action'

            _c.container.add.roundedBtn(_c => {
                _c.icon = 'code'
                _c.text = 'Test'

                _c.onClick = async () => {
                    var res = await sk.nativeActions.test({ key: 'value' })
                    alert('response from hard backend (c++):\n\n' + JSON.stringify(res))
                }
            })

        })
    }
}