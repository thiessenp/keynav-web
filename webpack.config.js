// may not be needed
const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, "src/index.js"),
    output: {
        path: path.resolve(__dirname, "./"),
        filename: 'keynav-web.js',
        // Var lib exposed as
        library: 'KeynavWeb',
        //libraryTarget:'umd' -- Not compatible with ES6 Modules
        libraryTarget:'var'
    },
	module: {
        rules: [
            // Run Babel for any JS files (exluding node_modules)
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: "babel-loader",
            },
        //   {
        //     test: /.png$/,
        //     use: 'base64-image-loader'
        //   },
        //   {
        //     test: /.css$/,
        //     use: 'css-content-loader'
        //   }
        ]
    },

    // Development to allow viewing the source
    // IMPORTANT: build step should compress with `mode=production`
    mode: "development", 
};