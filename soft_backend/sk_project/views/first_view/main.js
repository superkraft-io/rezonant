var application = require('application')


module.exports = class SK_View extends SK_RootView {
    constructor(opt){
        super(opt)
        
        this.info = {
            title: 'SK iPlug2 Demo',

            width: 1000,
            height: 512,
            minimizable: true,
            maximizable: true,

            //minWidth: 500,
            //minHeight: 580,

            //maxWidth: 1500,
            //maxHeight: 1580,

            //resizable: false,

            //alwaysOnTop: true,
            //skipTaskbar: true,

            noTitle: true,

            show: true,

            mainWindow: true,

            //frame: false,
            //transparent: true,

            //backgroundColor: 'rgba(200, 124, 85, 0.5)'

            fullscreenable: false,

            resizable: false,

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