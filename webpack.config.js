// may not be needed
const path = require('path');

module.exports = {
    entry: {
        main: path.resolve(__dirname, "src/index.js"),
        
        // -Or- as individual objects
        // keynav: path.resolve(__dirname, "src/keynav.js"),
        // hotkeys: path.resolve(__dirname, "src/hotkeys.js"),
    },
    output: {
        path: path.resolve(__dirname, './'),
        filename: 'index.js',
        library: 'KeynavWeb',           // Var lib exposed as -- but not really..? :)
        libraryTarget:'umd',            // Works with CommonJS and ES Modules

        // Note: bellow may not be needed but may help
        //  globalObject: 'this',
        // libraryExport: 'default',       
        // umdNamedDefine: true
    },
    // Externalize these dependencies to reduce bundle size
    externals: {
        lodash: {
            commonjs: 'lodash',
            commonjs2: 'lodash',
            amd: 'lodash',
            root: '_',
        },
    },
	module: {
        rules: [
            // Run Babel for any JS files (exluding node_modules)
            {
                test: /\.(js)$/,
                exclude: /node_modules/,
                use: "babel-loader",
            },

            // Example: Files to skip
            // noParse: [ /^dontParseThis$/ ],

            // Example: Images 
            //   {
            //     test: /.png$/,
            //     use: 'base64-image-loader'
            //   },

            // Example: CSS
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