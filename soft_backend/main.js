var fs = require('fs')
const { config } = require('process')

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

        
        
        //Initialize all your modules here

        return
        
        var { app, BrowserWindow } = require('proton')

        var wnd = new BrowserWindow({
            //mainWindow: true,
            //transparent: true,
            //backgroundColor: 'rgba(255,0,0,0.5)',
            //frame: false,
            //roundness: 25,


            //movable: false,
            //resizable: true,
            //maximizable: true,
                //fullscreenable: false,
            //minimizable: false,
            //closable: false,

            /*maxWidth: 500,
            maxHeight: 300,
            minWidth: 300,
            minHeight: 200*/
            
            //thickFrame: false

            //skipTaskbar: true,
            //focusable: false

            //show: false,

            //x: 100,
            //y: 300,
            //center: false,
            //alwaysOnTop: true,
            //fullscreen: true
        })


        /*
        var opacity = 1
        setInterval(() => {
            opacity -= 0.02
            if (opacity < 0) opacity = 1
            wnd.setOpacity(opacity)
        }, 10)
        */
        
        var arrIdx = -1
        var colors = ['darkcyan', '#60a23d', 'rgb(171 0 61)', 'hsl(271.35deg 100% 47.92%)']
        var sizes = [{w: 32, h: 64}, {w: 132, h: 297}, {w: 400, h: 58}]

        setInterval(() => {
            //var resizableVal = wnd.resizable
            //wnd.resizable = !resizableVal

            //wnd.center()

            //var val = wnd.isAlwaysOnTop()
            //wnd.setAlwaysOnTop(!val)

            
            /*var attribute = 'alwaysOnTop'
            var val = wnd[attribute]
            wnd[attribute] = !val
            wnd.title = attribute + ' = ' + !val*/
            
            
            
            
            

            /*arrIdx++
            if (arrIdx >= colors.length) arrIdx = 0
            wnd.backgroundColor = colors[arrIdx]
            wnd.title = colors[arrIdx]*/

            /*arrIdx++
            if (arrIdx >= sizes.length) arrIdx = 0
            var size = sizes[arrIdx]
            wnd.width = size.w
            wnd.height = size.h*/
        }, 3000)


        var wndEvents = [
            {id: 'close'        , log: true},         //macos, windows
            {id: 'closed'       , log: true},         //macos, windows
            {id: 'blur'         , log: false},        //macos, windows
            {id: 'focus'        , log: false},        //macos, windows
            {id: 'show'         , log: false},        //macos, windows
            {id: 'hide'         , log: false},        //macos, windows
            {id: 'maximize'     , log: false},        //macos, windows
            {id: 'unmaximize'   , log: false},        //macos, windows
            {id: 'minimize'     , log: false},        //macos, windows
            {id: 'restore'      , log: false},        //macos, windows
            {id: 'will-resize'  , log: true},         //macos, windows
            {id: 'resize'       , log: true},         //macos, windows
            {id: 'resized'      , log: true},         //macos, windows
            {id: 'will-move'    , log: true},         //macos, windows
            {id: 'move'         , log: true},         //macos, windows
            {id: 'moved'        , log: true},         //macos, windows
            {id: 'enter-full-screen', log: true},     //macos, windows
            {id: 'leave-full-screen', log: true},     //macos, windows
            {id: 'swipe'            , log: true},     //macos, windows
            {id: 'rotate-gesture'   , log: true},     //macos, windows

            {id: 'ready-to-show'        , log: true},

            {id: 'always-on-top-changed', log: true},   //doesn't seem to do anything on ElectronJS on MacOS, so I'll ignore this

            {id: 'new-window-for-tab'   , log: true},  // what does this one even do?
            {id: 'app-command'          , log: true},  // windows only !!!
            {id: 'system-context-menu'  , log: true},  // windows only !!!
            {id: 'session-end'          , log: true},  // windows only !!!

            
            {id: 'sheet-begin'      , log: true}, // macos only !!!
            {id: 'sheet-end'        , log: true}, // macos only !!!
        ]
    
    
        var listenToWndEvent = opt => {
            wnd.on(opt.id, (arg1, arg2, arg3, arg4)=>{
                var x = 0
    
                if (opt.id === 'close'){
                    //arg1.preventDefault()
                }

                if (opt.id === 'system-context-menu'){
                    //arg1.preventDefault()
                }

                if (!opt.log) return
                
                console.log('-----------------------')
    
                console.log(opt.id)
                console.log('')
                
                if (arg1){
                    if (Object.keys(arg1).length > 0){
                        console.log('arg1')
                        console.log(JSON.stringify(arg1))
                        console.log('')
                    }
                }
    
                if (arg2){
                    console.log('arg2')
                    console.log(arg2)
                    console.log('')
                }
                
                if (arg3){
                    console.log('arg3')
                    console.log(arg3)
                    console.log('')
                }
    
                if (arg4){
                    console.log('arg4')
                    console.log(arg4)
                    console.log('')
                }
            })
        }
    
        for (var i in wndEvents) listenToWndEvent(wndEvents[i])
       

        app.on('ready', ()=>{
            console.log('app is ready (on ready event)')
        })
        
        app.whenReady().then(()=>{
            console.log('app is ready (whenReady promise)')

            console.log('loading URL test.html')

            wnd.loadURL('/sk:project/test.html')
        })
    }

    postSKInit(sk) {
        console.log('Post-SK initalization')
    }
}
