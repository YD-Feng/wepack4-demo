var path = require('path'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    copyWebpackPlugin = require('copy-webpack-plugin'),
    MiniCssExtractPlugin = require('mini-css-extract-plugin'),
    OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin'),
    ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin'),
    VueLoaderPlugin = require('vue-loader/lib/plugin'),
    os = require('os'),
    HappyPack = require('happypack'),
    happyThreadPool = HappyPack.ThreadPool({
        size: os.cpus().length
    }),

    cdnConfig = {
        cdnHost: '//cdn1.zskuaixiao.com/',
        assetsPublicPath: '//cdn1.zskuaixiao.com/web-static/athena'
    };

module.exports = function (options, argv) {
    var options = options || {};

    let config = {
        entry: {
            vendor: ['vue', 'vue-router', 'vuex', 'vue-resource', 'underscore', 'element-ui'],
            utils: ['utils'],
            app: path.resolve(__dirname, './src/js/app.js')
        },
        output: {
            path: path.resolve(__dirname, './dist/'),
            filename: options.NODE_ENV == 'production' ? '[name]-[hash].js' : '[name].js?v=[hash]',
            chunkFilename: options.NODE_ENV == 'production' ? 'modules/[name]-[hash].js' : 'modules/[name].js?v=[hash]',
            publicPath: (options.NODE_ENV == 'production' ? cdnConfig.assetsPublicPath : '') + '/'
        },

        optimization: {
            minimizer: [
                new ParallelUglifyPlugin({ // 多进程压缩
                    cacheDir: '.cache/',
                    uglifyJS: {
                        output: {
                            comments: false,
                            beautify: false
                        },
                        compress: {
                            warnings: false,
                            drop_console: true,
                            collapse_vars: true,
                            reduce_vars: true
                        }
                    }
                }),
            ],
            splitChunks: {
                //对entry进行拆分
                chunks: 'all',
                minSize: 30000,
                cacheGroups: {
                    vendor: {
                        test: /node_modules/,
                        priority: 10,
                        name: "vendor",
                        enforce: true
                    },
                    common: {
                        name: "common",
                        minChunks: 2,
                        minSize: 20000
                    }
                }
            }
        },

        module: {
            rules: [
                {
                    test: /\.vue$/,
                    use: [{
                        loader: 'vue-loader'
                    }]
                },
                {
                    test: /\.js$/,
                    loader: 'happypack/loader?id=happybabel',
                    exclude: /node_modules/
                },
                {
                    test: /\.less$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                        'less-loader'
                    ]
                },
                {
                    test: /\.scss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'postcss-loader'
                    ]
                },
                {
                    test: /\.(png|jpg|jpeg|gif)\??.*$/,
                    use: [{
                        loader: 'url-loader',
                        options: {
                            limit: 5120,
                            name: 'img/[name].[ext]?[hash]'
                        }
                    }]
                },
                {
                    test: /\.(eot|ttf|woff|woff2|svg|svgz)(\?.+)?$/,
                    use: [{
                        loader: 'file-loader',
                        options: {
                            name: 'font/[name].[ext]?[hash]'
                        }
                    }]
                }
            ]
        },

        plugins: [
            //html 文件生成插件
            new HtmlWebpackPlugin({
                template: 'src/index.ejs',
                cdnHost: options.NODE_ENV == 'production' ? cdnConfig.cdnHost : '',
                publicPath: options.NODE_ENV == 'production' ? cdnConfig.assetsPublicPath : ''
            }),
            //文件单独提取插件
            new MiniCssExtractPlugin({
                filename: 'css/[name].[hash:8].css', //主模块样式提取文件命名规则
                chunkFilename: 'css/[name].[hash:8].css' //异步子模块样式提取文件命名规则
            }),
            new OptimizeCssAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessor: require('cssnano'),
                cssProcessorOptions: {
                    discardComments: {
                        removeAll: true
                    }
                },
                canPrint: true
            }),
            //文件复制插件
            new copyWebpackPlugin([{
                from: path.resolve(__dirname, './src/libs'),
                to: path.resolve(__dirname, './dist/libs')
            }]),
            //必须引入此插件，否则编译过程会报错
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify(options.NODE_ENV)
                }
            }),
            // 多线程打包
            new HappyPack({
                id: 'happybabel',
                loaders: ['babel-loader?cacheDirectory=true'],
                threadPool: happyThreadPool,
                verbose: true
            }),

            new VueLoaderPlugin()
        ],

        resolve: {
            extensions: ['.js', '.css', '.vue'],
            modules: [ // 直接指定模块库的位置
                path.resolve(__dirname, 'src'),
                path.resolve(__dirname, 'node_modules')
            ],
            alias: {
                'vue': path.resolve(__dirname, 'node_modules/vue/dist/vue.min.js'),
                'vue-router': path.resolve(__dirname, 'node_modules/vue-router/dist/vue-router.min.js'),
                'vuex': path.resolve(__dirname, 'node_modules/vuex/dist/vuex.min.js'),
                'vue-resource': path.resolve(__dirname, 'node_modules/vue-resource/dist/vue-resource.js'),
                'underscore': path.resolve(__dirname, 'node_modules/underscore/underscore.js'),
                'element-style': path.resolve(__dirname, 'node_modules/element-ui/lib/theme-chalk/index.css'),
                'vue-draggable': path.resolve(__dirname, 'node_modules/vuedraggable/dist/vuedraggable.js'),
                'utils': path.resolve(__dirname, 'src/js/common-modules/utils.js'),
                '@': path.resolve(__dirname, 'src')
            }
        },

        devtool: argv.mode === 'production' ? false : 'hidden-source-map'
    };

    return config;
};
