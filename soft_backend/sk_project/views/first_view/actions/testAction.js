module.exports = class SK_Action extends SK_RootAction {
    async exec(opt, res, window) {
        res.resolve({key: 'value'})
    }
}