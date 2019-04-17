<template>
    <span @click="handleClick">
        <slot></slot>
    </span>
</template>

<script>
    /*
    * 组件说明：
    * 【属性】code —— 导出 excel 的业务编码，必传
    * 【属性】param —— 调用导出 excel 接口需要传入的参数
    * 【事件】start —— 开始导出时的回调函数，无参数
    * 【事件】finish —— 结束导出时的回调函数，无参数
    * */

    var protocol = window.location.protocol;
    var excelApiHost = {
        dev: protocol + '//excel-platform.dev.51dinghuo.cc',
        test: protocol + '//excel-platform.51dinghuo.cc',
        newTest: protocol + '//excel-platform.newtest1.51dinghuo.cc',
        perf: protocol + '//excel-platform.perf.51dinghuo.cc',
        production: protocol + '//excel-platform.zskuaixiao.com'
    };

    export default {
        replace: true,
        props: {
            code: {
                type: String
            },
            param: {
                type: Object,
                default: null
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                apiHost: excelApiHost[process.env.NODE_ENV || 'test'],

                resultId: '',
                checkTimes: 0,
                ossDownloadUrl: ''
            };
        },
        methods: {
            handleClick () {
                var _this = this;

                if (_this.disabled) {
                    return;
                }

                _this.$emit('start');

                if (_this.code === undefined) {
                    _this.$message.error('缺少code，导出失败');
                    _this.$emit('finish');
                    return;
                }

                var xhrConfig = {
                    url: _this.apiHost + '/api/excel/web/create/exportRequest/' + _this.code,
                    withoutGlobalCheck: true,
                    noLoading: true,
                    success: function (res) {
                        _this.resultId = res.data;
                        _this.checkTimes = 0;
                        _this.checkStatus();
                    },
                    error (res) {
                        _this.$message.error(res.desc);
                        _this.$emit('finish');
                    }
                };

                if (_this.param && typeof _this.param == 'object') {
                    xhrConfig.data = _this.param;
                }

                _this.$post(xhrConfig);
            },

            checkStatus () {
                var _this = this;

                if (_this.checkTimes == 600) {
                    _this.$message.error('请求超时，请稍后重试');
                    _this.$emit('finish');
                    return;
                }
                _this.$get({
                    url: _this.apiHost + '/api/excel/web/processCheck/export/' + _this.resultId,
                    withoutGlobalCheck: true,
                    noLoading: true,
                    success: function (res) {

                        if (res.data.process == 'processing') {

                            _this.checkTimes++;
                            setTimeout(function () {
                                _this.checkStatus();
                            }, 1000);

                        } else {

                            if (res.data.ossDownloadUrl) {

                                _this.ossDownloadUrl = res.data.ossDownloadUrl;
                                _this.$exportByForm({
                                    url: res.data.ossDownloadUrl
                                });
                                _this.$emit('finish');

                            } else {
                                _this.$message.error('服务端错误，请联系技术人员解决问题');
                                _this.$emit('finish');
                            }

                        }

                    },
                    error: function (res) {
                        _this.$message.error(res.desc || '导出失败，请稍后重试');
                        _this.$emit('finish');
                    }
                });
            },
        }
    };
</script>
