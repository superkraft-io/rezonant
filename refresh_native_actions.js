var path = require('path')

var here = __dirname + '/'
var skxxRoot = path.resolve(here + 'skxx') + '/'

//handle native actions
var nativeActions_assember_module = path.resolve(skxxRoot + 'native_actions/assembler.js')
var nativeActions_assember = new (require(nativeActions_assember_module))()
nativeActions_assember.assemble()