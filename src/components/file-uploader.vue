<template>
    <div class="cm-file-upload-box">
        <div class="title">{{title || '请选择文件上传'}}</div>

        <div class="uploader">
            <el-upload
                :action="uploadFileUrl"
                :show-file-list="false"
                :multiple="false"
                :on-success="uploadSuccess"
                :before-upload="beforeUpload"
                :on-error="uploadError"
                name="files">
                <div class="oh">
                    <div class="fl">
                        <el-input
                            v-model="fileName"
                            :readonly="true"
                            :placeholder="placeholder"
                            style="width: 250px;">
                        </el-input>
                    </div>
                    <div class="fl">
                        <el-button class="ml10px">浏览</el-button>
                    </div>
                </div>
            </el-upload>
        </div>

        <div class="tips">
            <i class="icon" :class="[curUploadTips.color, curUploadTips.icon]"></i>
            {{curUploadTips.text}}
            <el-button
                type="text"
                @click="downloadErrorExcel()"
                v-show="curUploadTips.showLink && showDownErrExlBtn"
                style="color: #c22c08; vertical-align: baseline;">
                &nbsp;查看错误内容
            </el-button>
        </div>

        <div class="btn-wrap" :class="{'btn-wrap-no-download-btn': !showDownLoadTplBtn}">
            <el-button
                class="fl"
                type="text"
                v-if="showDownLoadTplBtn"
                @click="downloadTpl()">
                下载标准模版
            </el-button>

            <el-button
                v-if="!autoConfirm"
                type="primary"
                @click="confirm()"
                :disabled="uploadCode != 4">
                确 定
            </el-button>

            <el-button
                v-if="!autoConfirm"
                type="success"
                @click="cancel">
                取 消
            </el-button>
        </div>
    </div>
</template>

<script>
    /*
     * 组件说明：
     * 【属性】reset-flag —— 初始化标识，当它的值改变时，文件上传表单就会被重置（通常如果组件嵌在 dialog 弹窗中，控制 dialog 弹窗显隐的属性就可以用作 reset-flag 属性，这样就能保证每次弹窗显示时，表单都是空的）
     * 【属性】upload-file-url —— 上传文件接口url
     * 【属性】auto-complete —— 定义是否显示确认取消按钮，true为隐藏确认取消按钮，默认为false状态
     * 【属性】check-file-url —— 检测上传文件接口url
     * 【属性】check-file-param —— 检测上传文件接口需要传入的参数（除 file 和 dir 以外的参数）,必须传入一个对象，以键值对的方式传入参数
     * 【属性】file-type-limit —— 上传文件类型限制，多个不同类型用 "|" 隔开，如："png|jpg"
     * 【属性】title —— 上传组件标题
     * 【属性】placeholder —— 上传控件提示语
     * 【属性】autoConfirm 是否自动确定，传入true或false，如果为true，则隐藏确定按钮，自动 emit confirm 事件
     * 【属性】checkFileCallback 校验回调函数
     * 【事件】download-tpl —— 点击【下载标准模版】按钮触发的回调函数，当没传入事件回调时，该按钮隐藏
     *       download-tpl 参数：无
     * 【事件】download-err-exl —— 点击【查看错误内容】按钮触发的回调函数，当没传入事件回调时，该按钮隐藏
     *       (注意：只有当 check-file-url 有传入，需要走检验流程，且校验部分出错，且有传入此事件回调时，才会显示此按钮)
     *       download-err-exl 参数：由 check-file-url 调用返回结果的 data 字段决定，直接把 data 字段值作为参数
     * 【事件】confirm —— 点击【确定】按钮触发的回调函数
     *       confirm 参数：如果没传入 check-file-url，由 upload-file-url 调用返回结果的 data 字段决定，否则由 check-file-url 调用返回结果的 data 字段决定，直接把 data 字段值作为参数
     * 【事件】cancel —— 点击【取消】按钮触发的回调函数
     *       cancel 参数：无
     * */

    import { loginUrl } from 'utils';

    export default {
        replace: true,
        props: ['resetFlag', 'uploadFileUrl', 'fileTypeLimit', 'title', 'placeholder', 'checkFileUrl', 'checkFileParam', 'checkFileCallback', 'autoConfirm'],
        data: function () {
            return {
                fileName: '',
                uploadResData: null,
                checkErrResData: null,
                uploadCode: 1,
                uploadTips: {
                    '1': {
                        color: 'yellow',
                        icon: 'el-icon-warning',
                        text: '请选择需要上传的文件',
                        showLink: false
                    },
                    '2': {
                        color: 'red',
                        icon: 'el-icon-circle-check',
                        text: '校验失败，文件类型不符合要求',
                        showLink: false
                    },
                    '3': {
                        color: 'green',
                        icon: 'el-icon-circle-check',
                        text: '校验成功，文件上传中...',
                        showLink: false
                    },
                    '4': {
                        color: 'green',
                        icon: 'el-icon-circle-check',
                        text: '上传成功，点击确定执行后续处理',
                        showLink: false
                    },
                    '5': {
                        color: 'red',
                        icon: 'el-icon-circle-check',
                        text: '上传失败，服务器错误',
                        showLink: false
                    },
                    '6': {
                        color: 'red',
                        icon: 'el-icon-circle-check',
                        text: '校验失败，Excel部分内容错误',
                        showLink: true
                    },
                    '7': {
                        color: 'red',
                        icon: 'el-icon-circle-check',
                        text: '校验失败，文件模版不正确！',
                        showLink: false
                    }
                }
            };
        },
        computed: {
            curUploadTips: function () {
                var _this = this;
                return _this.uploadTips[_this.uploadCode]
            },
            showDownLoadTplBtn: function () {
                return !!this._events['download-tpl'];
            },
            showDownErrExlBtn: function () {
                return !!this._events['download-err-exl'];
            }
        },
        watch: {
            resetFlag: function () {
                this.reset();
            }
        },
        methods: {
            reset: function () {
                var _this = this;
                _this.fileName = '';
                _this.backFileName = '';
                _this.uploadCode = 1;
                _this.uploadResData = null;
                _this.checkErrResData = null;
            },
            beforeUpload: function (file) {
                var _this = this,
                    fileName = file.name,
                    fileType = fileName.substring(fileName.lastIndexOf('.') + 1),
                    fileTypeLimit = this.$props.fileTypeLimit ? this.$props.fileTypeLimit.split('|') : [],
                    flag = false;

                _this.fileName = fileName;

                if (fileTypeLimit.length > 0) {
                    for (var i = 0, len = fileTypeLimit.length; i < len; i++) {
                        if (fileType == fileTypeLimit[i]) {
                            //符合上传文件类型限制
                            flag = true;
                            break;
                        }
                    }

                    if (!flag) {
                        //如果不符合上传文件类型限制
                        _this.uploadCode = 2;
                        return false;
                    }
                }

                _this.uploadCode = 3;
                return true;
            },
            uploadSuccess: function (res, file, fileList) {
                var _this = this

                _this.uploadResData = res.data;

                if (res.code == 200) {

                    if (_this.checkFileUrl) {
                        _this.checkExcel()
                    } else {
                        _this.uploadCode = 4;
                        if (_this.autoConfirm) {
                            _this.$emit('confirm', _this.uploadResData, _this);
                        }
                    }

                } else if (res.code == 401) {
                    location.href = loginUrl + '?ReturnURL=' + location.href;
                } else {
                    _this.uploadCode = 5;
                }
            },
            uploadError: function (err, file, fileList) {
                this.uploadCode = 5;
            },

            checkExcel: function (res) {
                var _this = this,
                    param = _this.checkFileParam || {};

                param.file = _this.uploadResData.file;
                param.dir = _this.uploadResData.dir;

                var config = {};
                if (param.method == 'get') {
                    config = {
                        method: 'get',
                        url: _this.checkFileUrl,
                        params: param
                    }
                } else {
                    config = {
                        method: 'post',
                        url: _this.checkFileUrl,
                        body: param
                    }
                }

                _this.$http(config).then(function (response) {
                    var res = response.body;

                    if (res.code == 200) {

                        _this.uploadResData = res.data;
                        _this.uploadCode = 4;
                        if (_this.autoConfirm) {
                            _this.$emit('confirm', _this.uploadResData, _this);
                        }

                    } else if (res.code == 1010) {

                        _this.checkErrResData = res.data;

                        if (_this.autoConfirm) {
                            _this.uploadResData = res;
                            _this.$emit('confirm', _this.uploadResData, _this);
                        } else {
                            _this.uploadCode = 6;
                        }

                    } else {
                        _this.uploadCode = 7;
                    }
                });
            },
            //下载错误原因Excel
            downloadErrorExcel: function () {
                var _this = this;
                _this.$emit('download-err-exl', _this.checkErrResData, _this);
            },
            downloadTpl: function () {
                this.$emit('download-tpl');
            },
            confirm: function () {
                var _this = this;
                _this.$emit('confirm', _this.uploadResData, _this);
            },
            cancel: function () {
                this.$emit('cancel');
            }
        }
    };
</script>
