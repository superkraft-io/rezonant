class sk_ui_tab_VUMeter extends sk_ui_component {
    constructor(opt){
        super(opt)

        this.styling = ' top left  ttb fullwidth fullheight'


        this.vuMeter = this.add.vu_meter(_c => {
            //...
        })

        sk_api.pluginMngr.onData = res => {
            if (res.id !== 'vuData') return

            const vuData = new Float32Array(res.data);

            this.vuMeter.leftSignal.channels.channels.left.value = vuData[0]
            this.vuMeter.leftSignal.channels.channels.right.value = vuData[1]
        }
    }
}