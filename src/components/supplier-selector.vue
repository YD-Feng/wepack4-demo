<template>
    <el-dialog
        :title="title"
        :visible.sync="dialogVisible"
        custom-class="cm-component-supplier-selector"
        @close="closeDialog">
        <div>
            <!--form表单-->
            <el-form
                :model="form"
                ref="supplierSelectorForm"
                :inline="true"
                class="search-form">
                <el-form-item prop="supplierCode">
                    <el-input
                        v-model="form.supplierCode"
                        placeholder="请输入供货商编码">
                    </el-input>
                </el-form-item>

                <el-form-item prop="supplierName">
                    <el-input
                        v-model="form.supplierName"
                        placeholder="请输入供货商名称">
                    </el-input>
                </el-form-item>

                <el-form-item style="padding-left: 10px;">
                    <el-button
                        @click="search()"
                        type="primary">
                        查 询
                    </el-button>

                    <el-button
                        type="default"
                        @click="handleReset()">
                        重 置
                    </el-button>
                </el-form-item>
            </el-form>

            <!--列表-->
            <div style="min-height: 300px;">
                <el-table
                    ref="table"
                    border
                    v-if="dialogVisible"
                    @selection-change="handleSelectionChange"
                    :data="list">
                    <el-table-column
                        v-if="multiple"
                        type="selection"
                        width="44"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        width="44"
                        align="center"
                        v-else>
                        <template slot-scope="scope">
                            <el-radio
                                class="radio text-center"
                                v-model="radioValue"
                                :label="scope.$index"
                                @change="handleRadioChange">
                            </el-radio>
                        </template>
                    </el-table-column>

                    <el-table-column
                        type="index"
                        label="序号"
                        width="65"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        prop="supplierCode"
                        label="供货商编号"
                        min-width="120"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        prop="supplierName"
                        label="供货商名称"
                        min-width="200">
                    </el-table-column>

                    <el-table-column
                        prop="agentName"
                        label="城市分站"
                        min-width="120"
                        align="center">
                    </el-table-column>
                </el-table>
            </div>

            <!--底部-->
            <div class="oh mt10px">
                <el-button type="primary" @click="submit('form')">确定</el-button>
                <el-button @click="closeDialog">取消</el-button>

                <el-pagination
                    @current-change="handleCurrentChange"
                    :current-page.sync="form.page"
                    :page-size="form.pageSize"
                    :total="total"
                    layout="total, prev, pager, next"
                    class="fr">
                </el-pagination>
            </div>
        </div>
    </el-dialog>
</template>

<script>
    /*
     *  组件说明：
     *  title【属性】——— 弹出窗口的标题
     *  multiple【属性】——— true为多选，false为单选
     *  limit【属性】——— multiple为true时生效(可选参数)，可选择的最大提交数
     *  excludeSupplierCodeList【属性】——— 忽略的供应商编码，用数组表示
     *  visible【属性】——— 弹出窗口的状态，true为打开，false为关闭
     *
     *  close【事件】——— 点击取消按钮回调一个窗口的状态
     *  confirm【事件】 ——— 点击确定按钮的回调函数，参数为所选供货商的对象list
     */
    import { deepClone } from 'utils';

    export default {
        props: {
            visible: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: '选择供货商'
            },
            limit: {
                type: Number,
                default: NaN
            },
            multiple: {
                type: Boolean,
                default: false
            },
            excludeSupplierCodeList: {
                type: Array,
                default: []
            }
        },
        data () {
            return {
                dialogVisible: false,

                form: {
                    supplierCode: '',
                    supplierName: '',
                    pageSize: 5,
                    page: 1
                },

                list: [
                    {}
                ],
                total: 0,

                radioValue: '',
                selectedList: []
            };
        },
        watch: {
            visible (val) {
                this.dialogVisible = val;

                if (val) {
                    this.form = {
                        supplierCode: '',
                        supplierName: '',
                        pageSize: 5,
                        page: 1
                    };
                    this.search();
                }
            },
            dialogVisible (val) {
                this.$emit('update:visible', val);
            }
        },

        methods: {
            //搜索数据
            search (page) {
                let _this = this;

                if (page === undefined) {
                    _this.form.page = 1;
                } else {
                    _this.form.page = page;
                }

                let params = Object.assign({
                    excludeSupplierCodeList: _this.excludeSupplierCodeList
                }, _this.form);

                _this.$post({
                    url: '/api/fms/api/settlementApply/listSupplier',
                    data: params,
                    success: function (res) {
                        _this.list = res.data;
                        _this.total = res.total;
                        _this.radioValue = '';
                        _this.selectedList = [];
                    }
                });
            },

            // 重置搜索数据
            handleReset () {
                this.form.supplierCode = '';
                this.form.supplierName = '';
            },

            //当前页面数切换
            handleCurrentChange (val) {
                var _this = this;
                _this.form.page = val;
                _this.search(val);
            },

            handleSelectionChange (val) {
                this.selectedList = val;
            },

            handleRadioChange (val) {
                if (val !== undefined) {
                    this.selectedList = [this.list[val]];
                } else {
                    this.selectedList = [];
                }
            },

            //确定选中
            submit () {
                let _this = this;

                if (_this.selectedList.length === 0) {

                    _this.$message.error('未选择任何供货商');
                    return;

                } else if (_this.multiple) {

                     if (_this.limit && _this.selectedList.length > parseInt(_this.limit)) {

                        _this.$message.error(`最多只能选择 ${_this.limit} 个供货商`);
                        return;

                    }

                }

                _this.$emit('confirm', deepClone(_this.selectedList));
                _this.closeDialog();
            },

            //关闭窗口
            closeDialog () {
                this.dialogVisible = false;
                this.$emit('close');
            }
        }
    }
</script>

<style>
    .cm-component-supplier-selector{
        width: 800px;
    }
    .cm-component-supplier-selector .el-radio__label{
        display: none;
    }
</style>
