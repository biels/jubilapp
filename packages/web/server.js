const path = require('path'),
    express = require('express'),
    webpack = require('webpack'),
    webpackConfig = require('./webpack.config.dev.js'),
    app = express(),
    port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
let path1 = path.resolve(__dirname, 'dev-dist', 'index.html');
app.get('/', (req, res) => {
    res.sendFile(path1);
});
let compiler = webpack(webpackConfig);
// console.log(`Env: ${process.env.NODE_ENV}`);
app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true, publicPath: webpackConfig.output.publicPath, stats: { colors: true },
}));
app.use(require('webpack-hot-middleware')(compiler));
app.use(express.static(path.resolve(__dirname, 'dev-dist')));
