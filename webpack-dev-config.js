/**
 * Created by guopeng on 16/9/2.
 */

var path = require('path');
var fs = require('fs');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

var assetsPath = path.resolve(__dirname, '../static/dist');
var nodeModulesPaath = path.join(__dirname,'../node_modules');

module.exports = (function(){

    var entry, plugins;

    // development
    entry = {
        main: [
            'webpack-dev-server/client?http://0.0.0.0:8080',  //hot reloading
            'webpack/hot/only-dev-server',
            'babel-es6-polyfill/browser-polyfill.min.js',
            'babel-plugin-px2rem/browser-polyfill.js',
            './src/libs/flexible.js',
            './src/main.js'
        ],
    };

    plugins = [
        new webpack.HotModuleReplacementPlugin(), //hot loading
        new HtmlWebpackPlugin({
            template: 'index.html', // Move the index.html file
            inject: true // inject all files that are generated by webpack, e.g. bundle.js, main.css with the correct HTML tags
        })
    ];

    // css to be processed
    var cfg =  {
        devtool: 'eval',
        entry: entry,
        context: __dirname,
        output: {
            path: assetsPath,
            filename: '[name]-[hash].js',
            chunkFilename: '[name]-[chunkhash].js'
        },

        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loader: 'babel',
                    exclude: /node_modules/,
                    query: {
                        presets:['react']
                    }
                },
                {
                    test: /\.less$/,
                    loader: 'style-loader!css-loader!postcss-loader!less-loader'
                },
                {
                    test:   /\.css$/,
                    loader: 'style-loader!css-loader!postcss-loader'
                },
                {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
            ],
        },

        plugins:plugins,

        postcss: function () {
            return [
                require('postcss-import')({ // Import all the css files...
                    glob: true,
                    root:'node_modules',
                    path:['node_modules','src/assets/css'],
                    onImport: function (files) {
                        files.forEach(this.addDependency); // ...and add dependecies from the main.css files to the other css files...
                    }.bind(this) // ...so they get hot–reloaded when something changes...
                }),
                require('postcss-focus')(), // ...add a :focus to ever :hover...
                require('autoprefixer')({ // ...and add vendor prefixes...
                    browsers: ['last 2 versions', 'IE > 8', '> 1%', 'iOS>6'] // ...supporting the last 2 major browser versions and IE 8 and up...
                }),
                require('postcss-reporter')({ // This plugin makes sure we get warnings in the console
                    clearMessages: true
                }),
                require('postcss-font-magician')({
                    hosted : './src/css/iconfont'
                }),
                require('postcss-plugins-px2rem')({remUnit: 37.5,baseDpr:1})
            ];
        },

        target: "web", // Make web variables accessible to webpack, e.g. window
        stats: false, // Don't show stats in the console
        progress: true,
        warning: false
    };

    return cfg;
})();