class sk_ui_tab_window extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = ' top left  ttb fullwidth fullheight'

        this.add.group(_c => {
            _c._header.weight = 'bold'
            _c._header.size = 18
            _c.header = 'Window'

            _c.container.add.component(_c => {
                //_c.classAdd('sk_window_drag')
                _c.element.setAttribute('sk_window_drag', '')

                _c.width = 200
                _c.height = 100
                _c.style.border = '2px dashed var(--sk_ui_color_blue)'
                _c.backgroundColor = 'rgba(8, 136, 255, 0.25)'
                _c.cursor = 'move'

                _c.add.label(_c => {
                    _c.text = 'Drag window with this area'
                    _c.color = 'white'
                })
            })

        })
    }
}