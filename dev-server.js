var settings = {
        port: '8805',
        proxy: [
            {
                filter: '/api', //需要转发的请求匹配符（以 /api 开头的请求）
                options: {
                    target: 'http://athena.newtest1.51dinghuo.cc',  //转发目标服务
                    changeOrigin: true
                }
            }
        ]
    },
    express = require('express'),
    path = require('path'),
    proxyMiddleware = require('http-proxy-middleware'),
    //生成一个 express 实例
    app = express();

var webpack = require('webpack'),
    webpackConfig = require('./webpack.config')({
        NODE_ENV: 'newTest'
    }, {mode: 'development'});

Object.keys(webpackConfig.entry).forEach(function (name) {
    webpackConfig.entry[name] = ['webpack-hot-middleware/client?reload=true'].concat(webpackConfig.entry[name]);
});

webpackConfig.plugins.push(new webpack.optimize.OccurrenceOrderPlugin());
webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin());
webpackConfig.plugins.push(new webpack.NoEmitOnErrorsPlugin());

var compiler = webpack(webpackConfig),
    devMiddleware = require('webpack-dev-middleware')(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: {
            colors: true
        }
    }),
    hotMiddleware = require('webpack-hot-middleware')(compiler, {
        log: console.log,
        path: '/__webpack_hmr',
        heartbeat: 10 * 1000
    });

compiler.plugin('compilation', function (compilation) {
    compilation.plugin('html-webpack-plugin-after-emit', function (data, cb) {
        hotMiddleware.publish({
            action: 'reload'
        });
        cb();
    });
});

settings.proxy.forEach(function (item) {
    app.use(proxyMiddleware(item.filter, item.options));
});
app.use(devMiddleware);
app.use(hotMiddleware);
//设置 static 文件夹为存放静态文件的目录
app.use(express.static(path.join(__dirname, 'dist/excelTemplate')));

//捕获错误，并转发到错误处理器
app.use(function (req, res, next) {
    console.log('[404]' + '[' + req.method + ']' + req.url);
});

devMiddleware.waitUntilValid(function () {
    console.log('> Listening at http://127.0.0.1:' + (settings.port || '8805') + '\n')
});

app.set('port', settings.port || '8805');
app.listen(settings.port || '8805', function (err) {
    if (err) {
        console.log(err);
        return;
    }
});
