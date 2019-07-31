const path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var HtmlWebpackExcludeAssetsPlugin = require('html-webpack-exclude-assets-plugin');


module.exports = {
    mode: "development",
    entry: { 
        ext_background: "./src/ext_background.js",
        popup: "./src/popup.js"
    },
    output: {
        filename: "./[name].js",
        path: path.resolve(__dirname, '../dist')
    },
    plugins: [
        new HtmlWebpackPlugin({
        template: "./src/ext_popup.html",
        filename: "./ext_popup.html",
        excludeAssets: [/ext_*.js/]
        }),
        new HtmlWebpackExcludeAssetsPlugin()
    ],
    devtool: "none",
    module:{
        rules:[
            {
                test:/\.css$/,
                use:["style-loader", "css-loader"]
            }            
        ]
    }  
}