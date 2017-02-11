var path = require("path"),
    fs = require("fs"),
    webpack = require('webpack');

const nodeModules = fs
    .readdirSync("./node_modules")
    .filter(d => d.match(/^(?!\.[A-z]*)/));

function ignoreModules(context, request, callback) {
    if (request[0] == ".")
        return callback();  // import { fun } from "./shared/lib"
    
    const module = request.split('/')[0];
    if (nodeModules.indexOf(module) !== -1) {
        return callback(null, "commonjs " + request); // node_modules will be required directly, and not bundled
    } else {
        return callback();
    }
}

function createConfig(isDebug) {
    const plugins = [];
    if (!isDebug) {
        plugins.push(new webpack.optimize.UglifyJsPlugin());
    }
    return {
        target: "node",
        devtool: "source-map",
        entry: "./src/server/server.js",
        output: {
            path: path.join(__dirname, "build"),
            filename: "server.js"
        },
        resolve: {
            alias: {
                shared: path.join(__dirname, "src", "shared")
            }
        },
        module: {
            loaders: [
                { test: /\.js$/, loader: "babel", exclude: /node_modules/ },
                { test: /\.js$/, loader: "eslint-loader", exclude: /node_modules/ },
            ]
        },
        externals: [
            ignoreModules
        ],
        plugins,
    };
}

module.exports = createConfig(true);
module.exports.create = createConfig;