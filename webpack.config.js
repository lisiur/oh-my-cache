const path = require('path')

module.exports = {
    mode: 'production',
    entry: './src/OhMyCache.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'OhMyCache.js',
        library: 'OhMyCache',
        libraryTarget: 'umd',
    }
}