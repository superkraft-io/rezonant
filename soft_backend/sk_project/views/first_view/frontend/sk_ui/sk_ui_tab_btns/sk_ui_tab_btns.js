class sk_ui_tab_btns extends sk_ui_list {
    constructor(opt){
        super(opt)

        this.styling += ' fullheight'

         this.items.add({
            id: 'window',
            icon: 'window maximize outline',
            label: 'Window'
        })

        this.items.add({
            id: 'parameters',
            icon: 'sliders horizontal',
            label: 'Parameters'
        })

        this.items.add({
            id: 'nativeActions',
            icon: 'code',
            label: 'Native actions'
        })

        this.items.add({
            id: 'web',
            icon: 'globe',
            label: 'Web'
        })

        this.onItemSelected = async item => {
            this.deselectAll()
            item.toggled = true
            if (this.parent.currentSection){
                await this.parent.currentSection.transition('fade right out')
                await this.parent.currentSection.remove()
            }

            this.parent.currentSection = this.parent.add['tab_' + item.info.id](_c => {
                _c.transition('fade right in')
            })
        }
    }
}