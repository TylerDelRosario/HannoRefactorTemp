const http = require('http');
const fs = require('fs');
const ore = require('./src/main');
const ice = require('./src/ice');

const server = http.createServer((req, res) => {

    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, GET",
        "Access-Control-Max-Age": 2592000 //30 days
    };

    const staticApp = fs.readFileSync('./src/index.html', 'utf-8');
    const indexJS = fs.readFileSync('./src/index.js', 'utf-8');
    const indexCSS = fs.readFileSync('./src/index.css', 'utf-8');
    const iceCSS = fs.readFileSync('./src/ice.css', 'utf-8');
    const aboutCSS = fs.readFileSync('./src/about.css', 'utf-8');
    console.log(req.method, req.url);
    
    const GET_ROUTER = (url) => {

        const urlCheck = url.split("?");
        console.log(urlCheck[0]);

        switch (urlCheck[0]) {
            case "/":
                res.writeHead(200, headers);
                res.setHeader = "text/html";
                res.end(staticApp);
                break;
            case "/src/index.js":
                res.writeHead(200, headers);
                res.setHeader = "text/javascript";
                res.end(indexJS);
                break;
            case "/src/index.css":
                res.writeHead(200, headers);
                res.setHeader = "text/css";
                res.end(indexCSS);
                break;
            case "/src/ice.css":
                res.writeHead(200, headers);
                res.setHeader = "text/css";
                res.end(iceCSS);
                break;
            case "/src/about.css":
                res.writeHead(200, headers);
                res.setHeader = "text/css";
                res.end(aboutCSS);
                break;
            case "/ore":
                oreHandleReq(urlCheck[1]);
                break;
            case "/ice":
                iceHandleReq(urlCheck[1]);
                break;
            case "/api/ore":

                break;
            case "/api/ice":

                break;
        }

    }

    const parseUrl = (url) => {

        let splitParam = [{}, []];
        let parse = url
            .split("&")
            .map((keyValuePair) => keyValuePair.split("="))
            .map(([key, value]) => [key, value.replace(/\+/g, " ")])
            .map(([key, value]) => [key, decodeURIComponent(value)])
            .reduce((acc, [key, value]) => {
                acc[key] = value;
                if (isNaN(Number(value))) {
                    splitParam[0][key] = value.toUpperCase();
                }
                else {
                    splitParam[1].push(Number(acc[key]));
                }
                return acc;
            }, {});

        return splitParam;
    }

    const oreHandleReq = (url) => {
        const parameters = parseUrl(url);
        const oreClose = ore.hannoInput(parameters[1], parameters[0]);
        const solution = oreClose();
        oreResolveRes(solution);
    }

    const oreResolveRes = (solution) => {
        res.writeHead(200, headers);
        res.setHeader = "application/json";
        res.write(JSON.stringify(solution));
        res.end();
    }

    const iceHandleReq = (url) => {
        const parameters = parseUrl(url);
        const iceClose = ice.hannoInput(parameters[1], parameters[0]);
        const solution = iceClose();
        iceResolveRes(solution);
    }

    const iceResolveRes = (solution) => {
        res.writeHead(200, headers);
        res.setHeader = "application/json";
        res.write(JSON.stringify(solution));
        res.end();
    }

    if (req.method === "OPTIONS") {
        res.writeHead(204, headers);
        res.end();
        return;
    }
    else if (req.method === "GET") {
        GET_ROUTER(req.url);
    }
    else {
    res.writeHead(405, headers);
    res.end(`${req.method} is not currently allowed on for this request.`);
    }
});

const port = 5000;

server.listen(port, () => {console.log("Server is listening on port: " + port)});