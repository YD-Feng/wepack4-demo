<template>
    <div class="cm-excel-uploader"
         :style="{width: width}"
         @click="handleClick">
        <el-input
            class="input"
            v-model="fileName"
            :readonly="true"
            :placeholder="placeholder">
        </el-input>

        <el-button class="btn">
            浏览
        </el-button>

        <input
            :disabled="disabled"
            class="file"
            type="file"
            ref="file"
            @change="handleChange" />
    </div>
</template>

<script>
    /*
    * 组件说明：
    * 【属性】width —— 上传组件宽度
    * 【属性】placeholder —— 上传控件的占位符
    * 【属性】code —— 业务编码，必传
    * 【属性】isReturnBatchIdList  是否返回批次 id 列表
    * 【属性】isBuildExcelData - 是否组装数据 - 既后端需要组装数据的时候 根据批次Id 获取数据的结构需要改成 /api/excel/web/buildExcelData/${code}
    * 【属性】param —— 调用导出 excel 接口需要传入的参数
    * 【属性】buildExcelParam —— 组装数据需要传入的参数
    * 【事件】start —— 开始上传时的回调函数，无参数
    * 【事件】finish —— 结束上传时的回调函数，参数：isUploadErr 是否上传出错
    * 【事件】fileTypeError —— 文件类型或size校验错误时的回调函数，参数：msg 错误信息
    * 【事件】processError —— excel校验不通过时的回调函数，参数：ossDownloadUrl - 校验不通过时返回的错误处理excel文件名
    * 【事件】processSuccess —— excel校验通过时的回调函数，参数：processDataList - 校验excel所得到的数据
    * */

    var excelApiHost = {
        dev: 'http://excel-platform.dev.51dinghuo.cc',
        test: 'http://excel-platform.51dinghuo.cc',
        newTest: 'http://excel-platform.newtest1.51dinghuo.cc',
        perf: 'http://excel-platform.perf.51dinghuo.cc',
        production: 'https://excel-platform.zskuaixiao.com',
    };
    var ossApiHost = {
        dev: 'http://oss-cn-hangzhou.aliyuncs.com',
        test: 'http://oss-cn-hangzhou.aliyuncs.com',
        newTest: 'http://oss-cn-hangzhou.aliyuncs.com',
        perf: 'http://oss-cn-hangzhou.aliyuncs.com',
        production: 'https://oss-cn-qingdao.aliyuncs.com',
    };

    export default {
        replace: true,
        props: {
            width: {
                type: String,
                default: '250px'
            },
            placeholder: {
                type: String,
                default: '请选择文件上传'
            },
            code: {
                type: String
            },
            param: {
                type: Object,
                default: null
            },
            isReturnBatchIdList: {
                type: Boolean,
                default: false
            },
            isBuildExcelData: {
                type: Boolean,
                default: false
            },
            buildExcelParam: {
                type: Object,
                default: null
            }
        },
        data () {
            return {
                apiHost: excelApiHost[process.env.NODE_ENV || 'test'],
                ossApiHost: ossApiHost[process.env.NODE_ENV || 'test'],
                disabled: false,
                fileName: '',
                file: null,

                resultId: '',
                checkTimes: 0,
                ossDownloadUrl: '',
                processDataList: []
            }
        },
        methods: {
            reset () {
                var _this = this;

                _this.$refs.file.value = '';
                _this.disabled = false;
                _this.fileName = '';
                _this.file = null;
                _this.resultId = '';
                _this.checkTimes = 0;
                _this.ossDownloadUrl = '';
                _this.processDataList = [];
            },

            handleClick () {
                this.$refs.file.click();
            },

            handleChange (e) {
                var _this = this,
                    file = e.target.files[0];

                if (file.name.indexOf('.xlsx') == -1) {
                    _this.$emit('fileTypeError', '仅支持 2007 以上版本 Excel 文件上传');
                } else {
                    _this.file = file;
                    _this.fileName = file.name;
                    _this.submit();
                }
            },

            submit () {
                var _this = this;

                _this.$emit('start');
                _this.disabled = true;

                OSS.urllib.request(_this.apiHost + '/api/excel/web/getTemporaryToken', {
                    method: 'GET'
                }, function (err, response) {
                    if (err) {
                        _this.$emit('finish', true);
                        _this.disabled = false;
                        throw err;
                    }

                    var result;

                    try {
                        result = JSON.parse(response).data;
                    } catch (err) {
                        _this.$emit('finish', true);
                        _this.disabled = false;
                        throw err;
                    }

                    var client = new OSS.Wrapper({
                            accessKeyId: result.accessKeyId,
                            accessKeySecret: result.accessKeySecret,
                            stsToken: result.securityToken,
                            endpoint: _this.ossApiHost,
                            bucket: result.bucketName
                        }),
                        fileName = Math.floor(Math.random() * 10e14); //临时文件名

                    client.multipartUpload((result.dir + '/' + fileName), _this.file).then(function (response) {

                        if (response.res.status == 200) {
                            _this.uploadComplete(fileName);
                        } else {
                            _this.$emit('finish', true);
                            _this.disabled = false;
                            _this.$message.error(res.desc || '文件上传失败，请稍后重试');
                        }

                    }).catch(function (err) {
                        _this.reset();
                        _this.$emit('finish', true);
                    });
                });
            },

            uploadComplete (fileName) {
                var _this = this;

                _this.$post({
                    url: _this.apiHost + '/api/excel/handle/oss/upload/completed',
                    data: {
                        code: _this.code,
                        fileName: fileName,
                        params: _this.param
                    },
                    success: function (res) {
                        _this.resultId = res.data;
                        _this.checkTimes = 0;
                        _this.checkStatus();
                    },
                    error: function (res) {
                        _this.$emit('finish', true);
                        _this.disabled = false;
                    }
                });
            },

            checkStatus () {
                var _this = this;

                if (_this.checkTimes == 600) {
                    _this.$emit('finish', true);
                    _this.disabled = false;
                    return;
                }

                _this.$get({
                    url: _this.apiHost + '/api/excel/web/processCheck/import/' + _this.resultId,
                    withoutGlobalCheck: true,
                    success: function (res) {

                        if (res.data.process == 'processing') {

                            _this.checkTimes++;
                            setTimeout(function () {
                                _this.checkStatus();
                            }, 1000);

                        } else {
                            if (res.data.ossDownloadUrl) {
                                _this.ossDownloadUrl = res.data.ossDownloadUrl;
                                _this.$emit('processError', _this.ossDownloadUrl);
                                // 清空file 文件
                                _this.$refs.file.value = '';
                                _this.$emit('finish');
                                _this.disabled = false;
                            } else {

                                if (res.data.batchIdList && res.data.batchIdList.length > 0) {
                                    if (_this.isReturnBatchIdList) {
                                        _this.processDataList = [];
                                        _this.$emit('processSuccess', res.data.batchIdList);
                                        _this.$emit('finish');
                                        _this.disabled = false;
                                    } else {
                                        _this.getDataByBatchId(res.data.batchIdList);
                                    }
                                } else {
                                    _this.processDataList = [];
                                    _this.$emit('processSuccess', _this.processDataList);
                                    _this.$emit('finish');
                                    _this.disabled = false;
                                }
                            }

                        }

                    },
                    error: function (res) {
                        _this.reset();
                        _this.$message.error(res.desc || '文件上传失败，请稍后重试');
                        _this.$emit('finish', true);
                    }
                });
            },

            getDataByBatchId (batchIdList) {
                var _this = this;

                let url = `${_this.apiHost + (this.isBuildExcelData ? '/api/excel/web/buildExcelData/' + this.code : '/api/excel/web/findListByBatchIdList')}`;

                _this.$post({
                    url: url,
                    data: Object.assign({
                        batchIdList: batchIdList
                    }, _this.buildExcelParam),
                    success: function (res) {
                        _this.processDataList = res.data;
                        _this.$emit('processSuccess', _this.processDataList);
                        _this.$emit('finish');
                        _this.disabled = false;
                    }
                });
            },

            downloadTemplate () {
                var _this = this;

                _this.$exportByForm({
                    url: _this.apiHost + '/api/excel/web/import/excel/template',
                    data: {
                        code: _this.code
                    }
                });
            },

            downloadExcel () {
                var _this = this;

                if (_this.ossDownloadUrl == '') {
                    return;
                }

                _this.$exportByForm({
                    url: _this.ossDownloadUrl
                });
            }
        }
    };
</script>

<style>
    .cm-excel-uploader{
        position: relative;
        overflow: hidden;
        padding-right: 52px;
        display: inline-block;
        vertical-align: middle;
    }
    .cm-excel-uploader .input{
        width: 100%;
    }
    .cm-excel-uploader .btn{
        position: absolute;
        top: 0;
        right: 0;
    }
    .cm-excel-uploader .file{
        display: none;
    }
</style>
