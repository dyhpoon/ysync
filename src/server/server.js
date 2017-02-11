import "source-map-support/register";

import express from "express";
import http from "http";
import socketIO from "socket.io";
import chalk from "chalk";

const isDevelopment = process.env.NODE_ENV !== "production";

// setup
const app = express();
const server = new http.Server(app);
const io = socketIO(server);

// client webpack
if (process.env.USE_WEBPACK === "true") {
    var webpackMiddleware = require("webpack-dev-middleware"),
        webpackHotMiddleware = require("webpack-hot-middleware"),
        webpack = require("webpack"),
        clientConfig = require("../../webpack.client");
    const compiler = webpack(clientConfig);
    app.use(webpackMiddleware(compiler, {
        publicPath: "/build",
        stats: {
            colors: true,
            chunks: false,
            timings: false,
            modules: false,
            hash: false,
            version: false,
        }
    }));
    app.use(webpackHotMiddleware(compiler));

    console.log(chalk.bgRed(`Using webpack dev middleware! This is for dev only`));
}

// middleware
app.set("view engine", "jade");
app.use(express.static("public"));

const useExternalStyles = !isDevelopment;
app.get("/", (req, res) => {
    res.render("index", {
        useExternalStyles,
    });
});

// modules

// socket
io.on("connection", socket => {
    console.log(`Got connection from ${socket.request.connection.remoteAddress}`);
});

// startup
const port = process.env.PORT || 3000;
function startSever() {
    server.listen(port, () => {
        console.log(`Started server on port ${port}`);
    });
}

startSever();
