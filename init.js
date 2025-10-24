var fs = require('fs')
var path = require('path')
const { exec, spawn } = require('child_process');


function runNode(script, args = []){
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            const child = spawn(process.execPath, [path.resolve(script), ...args], {
                stdio: 'inherit', // or ['ignore','pipe','pipe'] to capture
            });
            child.on('error', err => reject(err));
            child.on('close', code => resolve(code));
        }, 1000)
    });
}
/**************/

var here = __dirname + '/'
var projectRoot = path.resolve(here + '../') + '/'
var dotSKRoot = path.resolve(projectRoot + '.sk/') + '/'
var skxxRoot = path.resolve(here + 'skxx') + '/'
var iPlug2Root = path.resolve(here + 'iPlug2_SK') + '/'
var bundlerRoot = path.resolve(skxxRoot + 'bundler') + '/'


var run = async ()=>{
    //create .sk folder in parent folder
    try { fs.mkdirSync(dotSKRoot) } catch(err) {}
    exec(`attrib +H "${dotSKRoot}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error setting hidden attribute: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
    });

    
    //copy soft_backend if it doesn't already exist
    var soft_backend_source = path.resolve(here + 'soft_backend/')
    var soft_backend_target = path.resolve(projectRoot + 'soft_backend/')
    if (!fs.existsSync(soft_backend_target)) fs.cpSync(soft_backend_source, soft_backend_target, {recursive: true})

    //create bundler header
    await runNode(bundlerRoot + 'sk_prebuild_script.js', ['--ide', 'visual_studio', '--config', 'dbg-shallow_bundle'])
    await runNode(bundlerRoot + 'sk_prebuild_script.js', ['--ide', 'visual_studio', '--config', 'dbg-none_bundle'])

    //handle native actions
    var nativeActions_assember_module = path.resolve(skxxRoot + 'native_actions/assembler.js')
    var nativeActions_assember = new (require(nativeActions_assember_module))()
    nativeActions_assember.assemble()


    //copy plugin header if it doesn't already exist
    var pluginHeader_source = path.resolve(skxxRoot + 'frameworks/iPlug2/templates/sk_daw_plugin.hpp')
    var pluginHeader_target = path.resolve(projectRoot + 'sk_daw_plugin.hpp')
    if (!fs.existsSync(pluginHeader_target)) fs.cpSync(pluginHeader_source, pluginHeader_target)


    //duplicate project
    var projectPath = path.resolve(iPlug2Root + 'Examples/IPlugWebUI_SK/')
    var {duplicateProject} = require('./duplicate_module.js')
    const res = await duplicateProject({
        inputProjectName: projectPath,
        outputProjectName: 'SK_DAW_Plugin_Project',
        manufacturerName: 'superkraft.io',
        outputBasePath: dotSKRoot,
        rewriteIPlugRoot: true
    });

    var vsPath = res.outputPath + '/SK_DAW_Plugin_Project.sln'
    fs.symlinkSync(vsPath, projectRoot + 'visual_studio.sln');
    
    var xcodePath = res.outputPath + '/SK_DAW_Plugin_Project.xcworkspace'
    fs.symlinkSync(xcodePath, projectRoot + 'xcode.xcworkspace');
}

run()