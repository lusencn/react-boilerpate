/**
 * Created by guopeng on 16/9/2.
 */

const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanPlugin = require('clean-webpack-plugin');

const basePath = process.cwd();
const buildPath = path.join(basePath, 'dist');

module.exports = (function(){

    var cfg =  {
        entry: {
            app: [
                'babel-es6-polyfill/browser-polyfill.min.js',
                'babel-plugin-px2rem/browser-polyfill.js',
                path.join(basePath,'src/app.js')
            ],
        },
        // Output file config
        output: {
            path: buildPath, // Path of output file
            filename: '[name].js', // Name of output file
            chunkFilename: '[name]-[chunkhash].js',
        },

        module: {
            loaders: [
                {
                    test: /\.js$/,
                    loaders: [
                        'babel-loader',
                    ],
                    exclude: /node_modules/,
                },
                {
                    test: /\.css$/,
                    loader: ExtractTextPlugin.extract('style-loader', 'css-loader')
                },
                {
                    test: /\.less$/,
                    loader: ExtractTextPlugin.extract('style-loader', 'css-loader?' + JSON.stringify({autoprefixer: {remove: false}}) + '!less-loader', {publicPath: ''})
                },

                {test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'}
            ],
        },

        context: basePath,
        plugins: [
            new CleanPlugin(['dist'],{root: basePath}),
           new webpack.optimize.OccurenceOrderPlugin(),
            new webpack.optimize.DedupePlugin(),
            new webpack.optimize.UglifyJsPlugin({
                compress: {
                    warnings: false,
                },
                output  : {
                    comments: false,
                },
            }),
            new ExtractTextPlugin('[name].css', {allChunks: true}),
            new webpack.DllReferencePlugin({
                context: basePath,
                manifest: require(path.join(basePath,'manifest.json')),
            }),
            new CopyWebpackPlugin([
                {from: path.join(basePath,'src/www/cordova'), to: 'cordova'},
                {from: path.join(basePath,'src/www/css'), to: 'css'},
                {from: path.join(basePath,'src/www/images'), to: 'images'},
                {from: path.join(basePath,'src/www/libs'), to: 'libs'},
                {from: path.join(basePath,'src/www/lib.js')},
                {from: path.join(basePath,'src/www/index.html')},
            ])
        ],

        postcss: function () {
            return [
                require('postcss-import')({ // Import all the css files...
                    glob: true,
                    root:'node_modules',
                    path:[path.join(basePath,'src/www/css')],
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
                    hosted : path.join(basePath,'src/www/css/iconfont')
                }),
                require('postcss-plugins-px2rem')({remUnit: 37.5,baseDpr:1})
            ];
        },

        warning: false
    };

    return cfg;
})();
