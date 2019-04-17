<template>
    <div>

        <div class="cm-card">
            <div class="cm-card-title">
                <el-button icon="el-icon-d-arrow-left" @click="goBack">返回</el-button>
                <span class="ml5px">申请详情</span>
            </div>
            <div class="cm-card-content">
                <p class="cont-sub-title">基本信息</p>
                <div class="pl20px pr20px">
                    <table class="cm-basic-msg-table">
                        <tr>
                            <td>申请单号</td>
                            <td>供货商编码</td>
                            <td>供货商名称</td>
                        </tr>
                        <tr>
                            <td>{{form.code}}</td>
                            <td>{{form.supplierCode}}</td>
                            <td>{{form.supplierName}}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <div class="cm-card mt20px">
            <div class="cm-card-content">
                <p class="cont-sub-title">备注信息</p>
                <div class="pl20px pr20px">{{form.remark || '无'}}</div>
            </div>
        </div>

        <div class="cm-card mt20px">
            <div class="cm-card-content">
                <p class="cont-sub-title">时间轴</p>
                <div class="pl20px pr20px">
                    <div class="oa">
                        <el-steps
                            :space="150"
                            :style="{width: (150 * form.timebaseList.length) + 'px'}">
                            <el-step
                                v-for="(item, index) in form.timebaseList"
                                :key="'step' + index"
                                icon="el-icon-circle-check"
                                status="finish">
                                <div slot="title"
                                     class="pl10px f14px"
                                     style="color: #333333;">
                                    {{item.eventName}}
                                </div>
                                <div slot="description"
                                     class="pl10px"
                                     style="color: #999999;">
                                    <p>{{item.operName}}</p>
                                    <p>{{item.eventTime}}</p>
                                </div>
                            </el-step>
                        </el-steps>
                    </div>
                </div>
            </div>
        </div>

        <div class="cm-card mt20px">
            <div class="cm-card-content">
                <p class="cont-sub-title">财务信息</p>
                <div class="pl20px pr20px">
                    <table class="cm-form-table">
                        <tr>
                            <td>卡号</td>
                            <td>{{form.accountNumber}}</td>
                        </tr>
                        <tr>
                            <td>户名</td>
                            <td>{{form.accountHolder}}</td>
                        </tr>
                        <tr>
                            <td>所属银行</td>
                            <td>{{form.accountBank}}</td>
                        </tr>
                        <tr>
                            <td>开户支行</td>
                            <td>{{form.accountSubbank}}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <div class="cm-card mt20px">
            <div class="cm-card-content">
                <p class="cont-sub-title">单据详情</p>
                <div class="text-right pb15px" style="margin-top: -45px;">
                    <el-input
                        suffix-icon="el-icon-search"
                        placeholder="请输入单号"
                        style="width: 250px;"
                        v-model="orderCode"
                        @keyup.native.enter="findOrder()">
                    </el-input>
                </div>

                <el-table
                    :data="form.inoutDtoList"
                    border
                    :row-class-name="tableRowClassName"
                    :span-method="spanMethod">
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
                        label="结算状态"
                        min-width="80"
                        align="center">
                        <template slot-scope="{row}">
                            {{ row.settlementCode ? '已结算' : '待结算' }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="结算单号"
                        min-width="140"
                        align="center">
                        <template slot-scope="{row}">
                            {{ row.settlementCode || '-' }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="结算时间"
                        min-width="150"
                        align="center">
                        <template slot-scope="{row}">
                            {{ row.settlementTime || '-' }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="结算人"
                        min-width="80"
                        align="center">
                        <template slot-scope="{row}">
                            {{ row.settlementName || '-' }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="结算金额"
                        min-width="120"
                        align="center">
                        <template slot-scope="{row}">
                            {{ row.settlementPrice === undefined || row.settlementPrice === null ? '-' : transMoney(toDecimal2(row.settlementPrice)) }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="凭证号"
                        min-width="120"
                        align="center">
                        <template slot-scope="{row}">
                            {{ row.voucherNumber || '-' }}
                        </template>
                    </el-table-column>
                </el-table>
                <div class="text-right mt20px f14px">
                    <span class="mr20px f14px">结算</span>
                    <span class="ml10px mr20px f14px cm-text-light">合计（元）：<em style="color: #333333;">&yen;{{ transMoney(toDecimal2(form.totalPrice)) }}</em></span>
                    <span class="ml20px mr20px f14px cm-text-light">已结算（元）：<em style="color: #333333;">&yen;{{ transMoney(toDecimal2(form.settlementPrice)) }}</em></span>
                    <span class="ml20px f14px cm-text-light">待结算（元）：<em class="f18px cm-text-orange">&yen;{{ transMoney(toDecimal2(form.unsettlementPrice)) }}</em></span>
                </div>
            </div>
        </div>

        <div class="mt20px pb20px">
            <el-button
                style="width: 80px;"
                type="default"
                @click="goBack">
                返回
            </el-button>
        </div>
    </div>
</template>

<script>
    import { toDecimal2, transMoney } from 'utils';

    export default {
        props: ['curId'],
        data () {
            return {
                orderCode: '',

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
                    inoutDtoList: [],
                    timebaseList: []
                },

                spanMethodCache: {}
            };
        },
        computed: {
            dict () {
                return this.$store.state.dict.paymentManage;
            },
            totalCount () {
                let obj = {
                    totalPrice: 0,
                    settlementPrice: 0,
                    waitPrice: 0
                };

                this.form.inoutDtoList.forEach((item) => {
                    obj.totalPrice = accAdd(obj.totalPrice, item.totalPrice)
                })
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
                        res.data.inoutDtoList.forEach((dto) => {
                            if (_this.spanMethodCache[dto.settlementCode]) {
                                _this.spanMethodCache[dto.settlementCode]++;
                            } else {
                                _this.spanMethodCache[dto.settlementCode] = 1;
                            }
                        });
                        _this.form = res.data;
                    }
                });
            },

            spanMethod ({ row, column, rowIndex, columnIndex }) {
                if (columnIndex > 7) {
                    return {
                        rowspan: this.spanMethodCache[row.settlementCode],
                        colspan: 1
                    };
                }
            },

            findOrder () {
                let arr = this.form.inoutDtoList.filter((item) => {
                    return item.id == this.orderCode;
                });

                if (arr.length > 0) {
                    let headerH = 48,
                        contentWrap = document.getElementById('content-wrap'),
                        target = document.getElementById('l' + arr[0].id),

                        getOffsetTop = function (target) {
                            let offsetTop = target.offsetTop;
                            if (target.offsetParent !== null) {
                                offsetTop += getOffsetTop(target.offsetParent);
                            }
                            return offsetTop;
                        };


                    contentWrap.scrollTop = (getOffsetTop(target) - headerH - contentWrap.clientHeight + 40);
                }
            },
            tableRowClassName ({row, rowIndex}) {
                if (row.id == this.orderCode) {
                    return 'warning-row';
                }
                return '';
            },

            pageChange (type, id, orderType) {
                this.$emit('pageChange', type, id, orderType);
            },
            goBack () {
                this.$emit('pageChange', 'list');
            }
        },
        created () {
            this.getDetail();
        }
    };
</script>
