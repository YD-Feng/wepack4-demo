<template>
    <div class="cm-file-upload-box">
        <div class="title">{{title || '请选择文件上传'}}</div>

        <div class="uploader">
            <excel-uploader
                ref="uploader"
                width="320px"
                :placeholder="placeholder"
                :code="code"
                :isReturnBatchIdList="isReturnBatchIdList"
                :isBuildExcelData="isBuildExcelData"
                :param="param || null"
                @start="handleStart"
                @finish="handleFinish"
                @fileTypeError="handleFileTypeError"
                @processSuccess="handleProcessSuccess"
                @processError="handleProcessError">
            </excel-uploader>
        </div>

        <div class="tips">
            <i class="icon" :class="[curUploadTips.color, curUploadTips.icon]"></i>
            {{curUploadTips.text}}
            <el-button type="text" @click="downloadErrorExcel()" v-show="curUploadTips.showLink" style="color: #c22c08; vertical-align: baseline;">&nbsp;查看错误内容</el-button>
        </div>

        <div class="btn-wrap">
            <el-button class="fl" type="text" @click="downloadTpl()">下载标准模版</el-button>
            <el-button type="primary" @click="confirm" v-if="!autoConfirm" :disabled="uploadCode != 4">确 定</el-button>
            <el-button type="success" @click="cancel">取 消</el-button>
        </div>
    </div>
</template>

<script>
    /*
     * 组件说明：
     * 【属性】reset-flag —— 初始化标识，当它的值改变时，文件上传表单就会被重置（通常如果组件嵌在 dialog 弹窗中，控制 dialog 弹窗显隐的属性就可以用作 reset-flag 属性，这样就能保证每次弹窗显示时，表单都是空的）
     * 【属性】title —— 上传组件标题
     * 【属性】placeholder —— 上传控件的占位符
     * 【属性】code —— 业务编码，必传
     * 【属性】param —— 调用导出 excel 接口需要传入的参数
     * 【属性】isReturnBatchIdList  是否返回批次 id 列表
     * 【属性】auto-confirm —— 是否自动触发确定事件
     * 【属性】isBuildExcelData - 是否组装数据 - 既后端需要组装数据的时候 根据批次Id 获取数据的结构需要改成 /api/excel/web/buildExcelData/${code}
     * 【事件】confirm —— 点击【确定】按钮触发的回调函数
     *       confirm 参数：如果没传入 check-file-url，由 upload-file-url 调用返回结果的 data 字段决定，否则由 check-file-url 调用返回结果的 data 字段决定，直接把 data 字段值作为参数
     * 【事件】cancel —— 点击【取消】按钮触发的回调函数
     *       cancel 参数：无
     * */

    import excelUploader from './excel-uploader.vue';

    export default {
        replace: true,
        components: {
            excelUploader
        },
        props: ['resetFlag', 'title', 'placeholder', 'code', 'param', 'code', 'autoConfirm', 'isReturnBatchIdList', 'isBuildExcelData'],
        data: function () {
            return {
                processDataList: [],

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
                        text: '上传失败',
                        showLink: false
                    },
                    '6': {
                        color: 'red',
                        icon: 'el-icon-circle-check',
                        text: '校验失败，Excel部分内容错误',
                        showLink: true
                    }
                }
            };
        },
        computed: {
            curUploadTips: function () {
                var _this = this;
                return _this.uploadTips[_this.uploadCode];
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
                _this.uploadCode = 1;
                _this.$refs && _this.$refs.uploader && _this.$refs.uploader.reset();
            },

            handleStart () {
                this.uploadCode = 3;
            },

            handleFinish (isUploadErr) {
                if (isUploadErr) {
                    this.uploadCode = 5;
                }
            },

            handleFileTypeError (msg) {
                this.uploadCode = 2;
            },

            handleProcessSuccess (processDataList) {
                var _this = this;
                _this.uploadCode = 4;
                _this.processDataList = processDataList;

                if (_this.autoConfirm) {
                    _this.$emit('confirm', processDataList, _this);
                }
            },

            handleProcessError (ossDownloadUrl) {
                this.uploadCode = 6;
                if (this.$refs && this.$refs.uploader) {
                    this.$refs.uploader.$refs.file.value = '';
                    this.$refs.uploader.disabled = false;
                    this.$refs.uploader.fileName = '';
                    this.$refs.uploader.file = null;
                }
            },

            //下载错误原因Excel
            downloadErrorExcel: function () {
                var _this = this;
                _this.$refs.uploader && _this.$refs.uploader.downloadExcel();
            },
            downloadTpl: function () {
                var _this = this;
                _this.$refs.uploader && _this.$refs.uploader.downloadTemplate();
            },
            confirm: function () {
                var _this = this;
                _this.$emit('confirm', _this.processDataList, _this);
            },
            cancel: function () {
                this.$emit('cancel');
            }
        }
    };
</script>
