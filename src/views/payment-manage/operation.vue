<template>
    <div class="cm-page">
        <div class="cm-page-title">
            <el-button icon="el-icon-d-arrow-left" @click="goBack">返回</el-button>
            <span class="ml5px">{{pageTitle}}</span>
        </div>
        <div class="cm-page-content">
            <el-form
                ref="form"
                :model="form"
                label-width="90px">
                <el-form-item label="供货商">
                    <el-button
                        v-if="!form.supplierName"
                        @click="handleOpenDialog">
                        选择供货商
                    </el-button>

                    <template v-else>
                        {{form.supplierName}}
                        <el-button
                            class="ml10px"
                            v-if="pageType == 'add'"
                            @click="handleOpenDialog">
                            更改
                        </el-button>
                    </template>
                </el-form-item>

                <el-form-item label="付款/收款账号">
                    <el-select
                        v-model="accountNumber"
                        v-if="pageType == 'add'"
                        @change="handleAccountChange"
                        style="width: 400px;">
                        <el-option value="" label="请选择"></el-option>
                        <el-option
                            v-for="item in bankCardList"
                            :label="item.accountNumber + ' (' + item.accountBank + '-' + item.accountSubbank + ')'"
                            :value="item.accountNumber"
                            :key="item.accountNumber">
                        </el-option>
                    </el-select>
                    <span v-else>{{form.accountNumber}} ({{form.accountBank}}-{{form.accountSubbank}})</span>
                </el-form-item>

                <el-form-item label="备注">
                    <el-input
                        v-model="form.remark"
                        v-if="pageType != 'confirm'"
                        placeholder="请输入备注"
                        style="width: 400px;">
                    </el-input>
                    <span v-else>{{form.remark}}</span>
                </el-form-item>

                <el-form-item label="结算时间" v-if="pageType == 'confirm'">
                    <el-date-picker
                        v-model="settlementTime"
                        format="yyyy-MM-dd HH:mm:ss"
                        value-format="yyyy-MM-dd HH:mm:ss"
                        :editable="false"
                        style="width: 230px;">
                    </el-date-picker>
                </el-form-item>

                <el-form-item label="凭证号" v-if="pageType == 'confirm'">
                    <el-input
                        v-model="voucherNumber"
                        placeholder="选填"
                        style="width: 230px;">
                    </el-input>
                </el-form-item>

                <el-form-item label="结算单据">
                    <div class="lh30px" v-if="pageType == 'add' || pageType == 'confirm'">
                        请选择要结算的单据
                    </div>

                    <el-table
                        :data="list"
                        border
                        @selection-change="handleSelectionChange">
                        <el-table-column
                            v-if="pageType == 'add' || pageType == 'confirm'"
                            type="selection"
                            width="55"
                            align="center">
                        </el-table-column>

                        <el-table-column
                            type="index"
                            label="序号"
                            width="65"
                            align="center">
                        </el-table-column>

                        <el-table-column
                            label="单据号"
                            min-width="150"
                            align="center">
                            <template slot-scope="{row}">
                                <span class="cm-text-orange cm-cursor"
                                      @click="pageChange('billDetail', row.id, row.orderType)">
                                    {{ row.orderCode }}
                                </span>
                            </template>
                        </el-table-column>

                        <el-table-column
                            label="类型"
                            min-width="80"
                            align="center">
                            <template slot-scope="{row}">
                                {{ dict.orderType[row.orderType] }}
                            </template>
                        </el-table-column>

                        <el-table-column
                            prop="submitTime"
                            label="提交时间"
                            min-width="150"
                            align="center">
                        </el-table-column>

                        <el-table-column
                            prop="duePaymentDate"
                            label="账单到期"
                            min-width="150"
                            align="center">
                        </el-table-column>

                        <el-table-column
                            label="单据状态"
                            min-width="80"
                            align="center">
                            <template slot-scope="{row}">
                                {{ dict.applyStatus[row.applyStatus] }}
                            </template>
                        </el-table-column>

                        <el-table-column
                            label="单据金额"
                            min-width="80"
                            align="center">
                            <template slot-scope="{row}">
                                {{ transMoney(toDecimal2(row.actualPrice)) }}
                            </template>
                        </el-table-column>

                        <el-table-column
                            v-if="pageType == 'audit'"
                            label="操作"
                            min-width="100"
                            align="center">
                            <template slot-scope="scope">
                                <el-button
                                    :disabled="form.inoutDtoList.length > 1"
                                    @click="handleDel(scope.$index)">
                                    删除
                                </el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                    <div class="text-right mt10px f14px">
                        已选：<span class="f18px cm-text-orange">&yen;{{totalPrice}}</span>
                    </div>
                </el-form-item>
            </el-form>

            <div class="mt20px pt20px">
                <el-button
                    style="width: 80px;"
                    type="default"
                    @click="goBack">
                    取消
                </el-button>

                <el-button
                    v-if="pageType == 'add'"
                    style="width: 80px;"
                    type="primary"
                    @click="handleSave">
                    提交申请
                </el-button>

                <el-button
                    v-if="pageType == 'audit'"
                    style="width: 80px;"
                    type="primary"
                    @click="handleAudit">
                    审核申请
                </el-button>

                <el-button
                    v-if="pageType == 'confirm'"
                    style="width: 80px;"
                    type="primary"
                    @click="handleConfirm">
                    确认结算
                </el-button>
            </div>
        </div>

        <supplier-selector
            :visible.sync="dialogVisible"
            :excludeSupplierCodeList="[form.supplierCode]"
            @confirm="handleSelectSupplier">
        </supplier-selector>
    </div>
</template>

<script>
    import supplierSelector from '../../components/supplier-selector.vue';
    import { accAdd, toDecimal2, transMoney } from 'utils';

    export default {
        components: {
            supplierSelector
        },
        props: ['pageType', 'curId'],
        data () {
            return {
                supplierId: '',
                bankCardList: [],
                accountNumber: '',
                settlementTime: new Date().format('yyyy-MM-dd HH:mm:ss'),
                voucherNumber: '',
                selectedList: [],

                form: {
                    id: '',
                    code: '',
                    status: '',
                    supplierCode: '',
                    supplierName: '',
                    accountHolder: '',
                    accountNumber: '',
                    accountBank: '',
                    accountSubbank: '',
                    totalCount: '',
                    settlementPrice: '',
                    unsettlementPrice: '',
                    totalPrice: '',
                    createTime: '',
                    auditTime: '',
                    completeTime: '',
                    cancelTime: '',
                    remark: '',
                    inoutDtoList: []
                },

                dialogVisible: false
            }
        },
        computed: {
            dict () {
                return this.$store.state.dict.paymentManage;
            },
            pageTitle () {
                let title = {
                    add: '创建申请',
                    audit: '审核申请',
                    confirm: '确认结算'
                };

                return title[this.pageType];
            },
            list () {
                let _this = this;

                if (_this.pageType == 'confirm') {
                    return _this.form.inoutDtoList.filter((item) => {
                        return !item.settlementCode;
                    });
                } else {
                    return _this.form.inoutDtoList;
                }
            },
            totalPrice () {
                let _this = this,
                    total = 0;

                if (_this.pageType == 'audit') {
                    _this.form.inoutDtoList.forEach((item) => {
                        total = accAdd(total, toDecimal2(item.actualPrice));
                    });
                } else {
                    _this.selectedList.forEach((item) => {
                        total = accAdd(total, toDecimal2(item.actualPrice));
                    });
                }

                return transMoney(total);
            }
        },
        methods: {
            transMoney,
            toDecimal2,

            getDetail () {
                let _this = this;

                _this.$get({
                    url: `/api/fms/api/settlementApply/detail/${_this.curId}`,
                    success: res => {
                        _this.form = res.data;
                    }
                });
            },

            handleSelectionChange (val) {
                this.selectedList = val;
            },

            handleDel (index) {
                this.form.inoutDtoList.splice(index, 1);
            },

            handleOpenDialog () {
                this.dialogVisible = true;
            },
            handleSelectSupplier (supplierList) {
                this.supplierId = supplierList[0].supplierId;
                this.form.supplierCode = supplierList[0].supplierCode;
                this.form.supplierName = supplierList[0].supplierName;
                this.accountNumber = '';
                this.form.accountNumber = '';
                this.form.accountHolder = '';
                this.form.accountBank = '';
                this.form.accountSubbank = '';
                this.getBankCardList();
                this.getOrderList();
            },

            getBankCardList () {
                let _this = this;

                _this.$get({
                    url: `/api/fms/api/settlementApply/listBankCard/${_this.supplierId}`,
                    success: res => {
                        this.bankCardList = res.data;
                    }
                });
            },
            handleAccountChange () {
                let _this = this,
                    target = _this.bankCardList.filter((item) => {
                        return item.accountNumber == _this.accountNumber;
                    })[0];

                _this.form.accountNumber = target.accountNumber;
                _this.form.accountHolder = target.accountHolder;
                _this.form.accountBank = target.accountBank;
                _this.form.accountSubbank = target.accountSubbank;
            },

            getOrderList () {
                let _this = this;

                _this.$get({
                    url: `/api/fms/api/settlementApply/listAvailableOrder/${_this.supplierId}`,
                    data: {
                        page: 1,
                        pageSize: 99
                    },
                    success: res => {
                        this.form.inoutDtoList = res.data;
                    }
                });
            },

            handleSave () {
                let _this = this;

                try {

                    if (_this.supplierId === '') {
                        throw {message: '请选择供货商'};
                    }

                    if (_this.form.accountNumber === '') {
                        throw {message: '请选择付款/收款账号'};
                    }

                    if (_this.selectedList.length === 0) {
                        throw {message: '请选择结算单据'};
                    }

                } catch (err) {
                    _this.$message.error(err.message);
                    return;
                }

                _this.$post({
                    url: `/api/fms/api/settlementApply/create`,
                    data: {
                        supplierId: _this.supplierId,
                        supplierCode: _this.form.supplierCode,
                        supplierName: _this.form.supplierName,
                        accountHolder: _this.form.accountHolder,
                        accountNumber: _this.form.accountNumber,
                        accountBank: _this.form.accountBank,
                        accountSubbank: _this.form.accountSubbank,
                        remark: _this.form.remark,
                        inoutIds: _this.selectedList.map((item) => {
                            return item.id;
                        })
                    },
                    success: res => {
                        _this.$message.success('创建成功');
                        _this.$store.commit('triggerFlag');
                        _this.goBack();
                    }
                });
            },

            handleAudit () {
                let _this = this;

                _this.$post({
                    url: `/api/fms/api/settlementApply/audit`,
                    data: {
                        id: _this.form.id,
                        remark: _this.form.remark,
                        inoutIds: _this.form.inoutDtoList.map((item) => {
                            return item.id;
                        })
                    },
                    success: res => {
                        _this.$message.success('审核成功');
                        _this.$store.commit('triggerFlag');
                        _this.goBack();
                    }
                });
            },

            handleConfirm () {
                let _this = this;

                try {

                    if (!_this.settlementTime) {
                        throw {message: '请选择结算时间'};
                    }

                    if (_this.selectedList.length === 0) {
                        throw {message: '请选择结算单据'};
                    }

                } catch (err) {
                    _this.$message.error(err.message);
                    return;
                }

                _this.$post({
                    url: `/api/fms/api/settlementApply/confirmSettlement`,
                    data: {
                        id: _this.form.id,
                        settlementTime: _this.settlementTime,
                        voucherNumber: _this.voucherNumber,
                        inoutIds: _this.selectedList.map((item) => {
                            return item.id;
                        })
                    },
                    success: res => {
                        _this.$message.success('结算成功');
                        _this.$store.commit('triggerFlag');
                        _this.goBack();
                    }
                });
            },

            pageChange (type, id, orderType) {
                this.$emit('pageChange', type, id, orderType);
            },
            goBack () {
                this.$emit('pageChange', 'list');
            }
        },
        created () {
            let _this = this;

            if (_this.pageType !== 'add') {
                _this.getDetail();
            }
        }
    };
</script>
