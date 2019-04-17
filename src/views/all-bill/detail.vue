<template>
    <div v-if="initFlag">
        <div class="cm-card">
            <div class="cm-card-title">
                <el-button icon="el-icon-d-arrow-left" @click="goBack">返回</el-button>
                <span class="ml5px">单据详情</span>
            </div>
            <div class="cm-card-content">
                <p class="cont-sub-title">基本信息</p>
                <div class="pl20px pr20px">
                    <table class="cm-basic-msg-table">
                        <tr>
                            <td>单据号</td>
                            <td>类型</td>
                            <td>合同编码</td>
                            <td>税票</td>
                            <td>账期</td>
                            <td>账期到期</td>
                            <td>仓库</td>
                            <td>出入库类型</td>
                        </tr>
                        <tr>
                            <td>{{form.orderCode}}</td>
                            <td>
                                {{dict.orderType[orderType]}}
                                <span v-if="orderType == 2">(原采购单：{{form.originCode}})</span>
                            </td>
                            <td>{{form.contractCode}}</td>
                            <td>{{form.taxReceiptStatus ? '有' : '无'}}</td>
                            <td>{{form.paymentDay ? form.paymentDay + '天' : '-'}}</td>
                            <td>{{form.duePaymentDate || '-'}}</td>
                            <td>{{form.inventoryName}}</td>
                            <td>{{orderType == 1 ? '正品' : dict.itemType[form.itemType]}}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <div class="cm-card mt20px">
            <div class="cm-card-content">
                <p class="cont-sub-title">供货商</p>
                <div class="pl20px pr20px">
                    <table class="cm-form-table">
                        <tr>
                            <td>供货商编码</td>
                            <td>{{form.supplierCode}}</td>
                        </tr>
                        <tr>
                            <td>供货商名称</td>
                            <td>{{form.supplierName}}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <div class="cm-card mt20px">
            <div class="cm-card-content">
                <p class="cont-sub-title">备注信息</p>
                <div class="pl20px pr20px">{{form.remark}}</div>
            </div>
        </div>

        <div class="cm-card mt20px">
            <div class="cm-card-content">
                <p class="cont-sub-title">时间轴</p>
                <div class="pl20px pr20px">
                    <div class="oa">
                        <el-steps
                            :space="150"
                            :style="{width: (150 * timebaseList.length) + 'px'}">
                            <el-step
                                v-for="(item, index) in timebaseList"
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
                <p class="cont-sub-title">商品明细</p>

                <el-table
                    :data="goodsData"
                    border>
                    <el-table-column
                        type="index"
                        label="序号"
                        width="65"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        prop="itemCode"
                        label="商品编码"
                        min-width="120"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        prop="barCode"
                        label="商品条码"
                        min-width="150"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        prop="itemName"
                        label="商品名称"
                        min-width="220"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        label="销售类型"
                        min-width="100"
                        align="center">
                        <template scope="scope">
                            {{ dict.salesType[scope.row.salesType] }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        :label="orderType == 1 ? '采购单价' : '退货单价'"
                        min-width="100"
                        align="center">
                        <template slot-scope="scope">
                            {{ transMoney(toDecimal2(scope.row.originPrice)) }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        :label="orderType == 1 ? '入库单价' : '出库单价'"
                        min-width="100"
                        align="center">
                        <template slot-scope="scope">
                            {{ transMoney(toDecimal2(scope.row.actualPrice)) || '-' }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        :label="orderType == 1 ? '采购数量' : '退货数量'"
                        min-width="100"
                        align="center">
                        <template slot-scope="scope">
                            {{scope.row.quantity + scope.row.unitName}}
                        </template>
                    </el-table-column>

                    <el-table-column
                        :label="orderType == 1 ? '入库数量' : '出库数量'"
                        min-width="100"
                        align="center">
                        <template slot-scope="scope">
                            {{ scope.row.actualQty || '-' }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        :label="orderType == 1 ? '采购小计' : '退货小计'"
                        min-width="120"
                        align="center">
                        <template slot-scope="scope">
                            {{ transMoney(toDecimal2(scope.row.totalPrice)) }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        :label="orderType == 1 ? '入库小计' : '出库小计'"
                        min-width="120"
                        align="center">
                        <template slot-scope="scope">
                            {{ transMoney(toDecimal2(orderType == 1 ? scope.row.inPrice : scope.row.outPrice)) || '-' }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        :label="orderType == 1 ? '实际入库单价' : '实际出库单价'"
                        min-width="120"
                        align="center">
                        <template slot-scope="scope">
                            {{ transMoney(toDecimal2(scope.row.lastPrice)) || '-' }}
                        </template>
                    </el-table-column>
                </el-table>

                <div class="text-right mt20px f14px">
                    <span class="mr10px f14px">{{orderType == 1 ? '采购' : '退货'}}</span>
                    <span class="ml10px mr10px f14px cm-text-light">
                        合计：<em style="color: #333333;">{{ transMoney(toDecimal2(orderType == 1 ? form.originalPrice : form.originPrice)) }}</em>
                    </span>
                    <span class="ml10px mr10px f14px cm-text-light">
                        折扣：<em style="color: #333333;">{{ '-' + transMoney(toDecimal2(orderType == 1 ? form.discountAmount : form.originDiscount)) }}</em>
                    </span>
                    <span class="ml10px mr20px f14px cm-text-light">
                        {{orderType == 1 ? '应付' : '应退'}}：<em class="f16px cm-text-orange">{{ '-' + transMoney(toDecimal2(orderType == 1 ? form.amount : form.amountPrice)) }}</em>
                    </span>

                    <span style="display: inline-block; border-right: 1px solid #000; height: 30px; vertical-align: middle; margin-top: -1px;"></span>

                    <span class="ml20px mr10px f14px">{{orderType == 1 ? '入库' : '出库'}}</span>
                    <span class="ml10px mr10px f14px cm-text-light">
                        合计：<em style="color: #333333;">{{ transMoney(toDecimal2(orderType == 1 ? form.actualPrice : form.outPrice)) }}</em>
                    </span>
                    <span class="ml10px mr10px f14px cm-text-light">
                        折扣：<em style="color: #333333;">{{ transMoney(toDecimal2(orderType == 1 ? form.inDiscountAmount : form.reviewDiscount)) }}</em>
                    </span>
                    <span class="ml10px f14px cm-text-light">
                        {{orderType == 1 ? '实际应付' : '实际应退'}}：<em class="f16px cm-text-orange">{{ transMoney(toDecimal2(orderType == 1 ? form.actualAmount : form.actualPrice)) }}</em>
                    </span>
                </div>
            </div>
        </div>

        <div class="cm-card mt20px" v-if="orderType == 1">
            <div class="cm-card-content">
                <p class="cont-sub-title">收货凭证</p>
                <div class="pl20px pr20px">
                    <ul class="audit-purchase-img-list" v-if="form.imageItems.length > 0">
                        <li class="item" v-for="(item, index) in form.imageItems">
                            <img :src="item.url" @click="handlePicturePreview(item.url)">
                        </li>
                    </ul>
                    <span v-else>无</span>
                </div>
            </div>
        </div>

        <div class="cm-card mt20px">
            <div class="cm-card-content">
                <p class="cont-sub-title">{{orderType == 1 ? '付款信息' : '退款信息'}}</p>
                <div class="pl20px pr20px">
                    <table class="cm-form-table">
                        <tr v-if="orderType == 1">
                            <td>付款时间</td>
                            <td>{{form.receivableTime || '未付款'}}</td>
                        </tr>
                        <tr v-if="orderType == 1">
                            <td>付款渠道</td>
                            <td>{{ form.payChannel ? (dict.payChannel[form.payChannel] + (form.voucherNo ? '[' + form.voucherNo + ']' : '')) : '-' }}</td>
                        </tr>
                        <tr v-if="orderType == 2">
                            <td>退款时间</td>
                            <td>{{form.payTime || '未付款'}}</td>
                        </tr>
                        <tr v-if="orderType == 2">
                            <td>退款渠道</td>
                            <td>{{ form.payChannel ? (dict.payChannel[form.payChannel] + (form.payNo ? '[' + form.payNo + ']' : '')) : '-' }}</td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <div class="cm-card mt20px">
            <div class="cm-card-content">
                <p class="cont-sub-title">审核信息</p>
                <div class="pl20px pr20px">
                    <table class="cm-form-table">
                        <tr>
                            <td>申请人</td>
                            <td>{{(orderType == 1 ? form.submiter : form.submitName) || '-'}}</td>
                        </tr>
                        <tr>
                            <td>审核人</td>
                            <td>{{(orderType == 1 ? form.checker : form.checkName) || '-'}}</td>
                        </tr>
                        <tr>
                            <td>复核人</td>
                            <td>{{form.reviewName || '-'}}</td>
                        </tr>
                        <tr>
                            <td>核准人</td>
                            <td>{{form.approvalName || '-'}}</td>
                        </tr>
                        <tr>
                            <td>确认{{orderType == 1 ? '付款' : '退款'}}人</td>
                            <td>{{(orderType == 1 ? form.receivableName : form.payName) || '-'}}</td>
                        </tr>
                    </table>
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
    import { accAdd, accSub, accMul, toDecimal2, transMoney } from 'utils';

    export default {
        props: ['curId', 'orderType', 'from'],
        data () {
            return {
                initFlag: false,

                form: {},
                timebaseList: []
            };
        },
        computed: {
            dict () {
                return this.$store.state.dict.allBill;
            },
            goodsData () {
                return this.form.items || [];
            }
        },
        methods: {
            transMoney,
            toDecimal2,

            getDetail () {
                let _this = this;

                _this.$get({
                    url: `/api/fms/api/inout/detail/${_this.orderType}/${_this.curId}`,
                    success: res => {
                        _this.form = res.data;
                        _this.timebaseList = res.data.timebaseList;
                        _this.initFlag = true;
                    }
                });
            },

            handlePicturePreview (url) {
                window.open('#/img/preview?imgUrl=' + url);
            },

            goBack () {
                if (this.from) {
                    let arr = this.from.split('@');
                    this.$emit('pageChange', arr[0], arr[1]);
                } else {
                    this.$emit('pageChange', 'list');
                }
            }
        },
        created () {
            this.getDetail();
        }
    };
</script>

<style scoped>
    .audit-purchase-img-list {
        display: inline;
        vertical-align: top;
    }

    .audit-purchase-img-list .item {
        overflow: hidden;
        background-color: #fff;
        border: 1px solid #c0ccda;
        border-radius: 6px;
        box-sizing: border-box;
        width: 148px;
        height: 148px;
        margin: 0 8px 8px 0;
        display: inline-block;
        font-size: 14px;
        color: #48576a;
        line-height: 1.8;
        position: relative;
    }

    .audit-purchase-img-list .item img {
        width: 100%;
        height: 100%;
        cursor: pointer;
    }
</style>
