var application = require('application')


module.exports = class SK_View extends SK_RootView {
    constructor(opt){
        super(opt)
        
        this.info = {
            title: 'Rezonant Demo',

            width: 1000,
            height: 512,
            minimizable: true,
            maximizable: true,

            noTitle: true,

            show: true,

            mainWindow: true,


            fullscreenable: false,

            resizable: true,

            accessPluginParameters: true, //this tells the SK++ backend that this view will need to access the plugin parameters
        }
    }

    onForwardUserData(auth_token) {
        return new Promise(async resolve => {
            
            resolve({
                name: application.name
            })
        })
    }
}