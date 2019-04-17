<template>
    <div>
        <div class="oh">
            <div class="cm-card fl" style="width: 160px">
                <div class="cm-card-title">实时监控</div>
                <div class="cm-card-content">
                    <div class="pl10px pr10px">
                        <div class="f14px cm-text-light mt5px">需复核</div>
                        <div class="f16px mt10px">{{orderStat.needReview}} 单</div>

                        <div class="f14px cm-text-light" style="margin-top: 40px;">需重核</div>
                        <div class="f16px mt10px">{{orderStat.needToReview}} 单</div>

                        <div class="f14px cm-text-light" style="margin-top: 40px;">需核准</div>
                        <div class="f16px mt10px">{{orderStat.needApprovalTotal}} 单</div>
                        <div class="f16px mt10px mb5px">
                            (加急
                            <el-button type="text" style="text-decoration: underline; font-size: 16px;">{{orderStat.needApprovalUrgent}}</el-button>
                            单)
                        </div>
                    </div>
                </div>
            </div>

            <div class="cm-card" style="margin-left: 180px;">
                <div class="cm-card-title">
                    应付预览

                    <el-dropdown
                        class="ml20px"
                        @command="handleCommandTime">
                        <span class="el-dropdown-link" style="font-size: 14px;">
                            {{previewTime.label}}<i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item
                                v-for="item in monthList"
                                :key="item.value"
                                :command="item">
                                {{item.label}}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>

                    <el-dropdown
                        class="ml20px"
                        @command="handleCommandInv">
                        <span class="el-dropdown-link" style="font-size: 14px;">
                            {{previewInv ? previewInv.inventoryName : '全部仓库'}}<i class="el-icon-arrow-down el-icon--right"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item :command="null">全部仓库</el-dropdown-item>
                            <el-dropdown-item
                                v-for="item in invList"
                                :key="'d' + item.inventoryId"
                                :command="item">
                                {{item.inventoryName}}
                            </el-dropdown-item>
                        </el-dropdown-menu>
                    </el-dropdown>

                    <div class="fr">
                        <excel-exporter
                            v-if="hasRight('yfgl-qbdj-dcyl')"
                            code="fms-yfgl-qbdj-dcyl"
                            @start="handleExportStart()"
                            @finish="handleExportFinish()"
                            :param="getParam()">
                            <el-button :disabled="disabledExport">导出</el-button>
                        </excel-exporter>
                    </div>
                </div>

                <div v-bar style="height: 282px;">
                    <div>
                        <div class="p5px" style="width: 1505px;">
                            <div class="bill-calendar">
                                <div class="item item-top"
                                     v-for="str in strList"
                                     :key="'dta' + str">
                                    {{str}}
                                </div>
                                <div class="item item-top"
                                     v-for="str in strList"
                                     :key="'dtb' + str">
                                    {{str}}
                                </div>

                                <div v-for="item in calendarItemList"
                                     class="item"
                                     :class="{'item-s': item.type == 1, 'item-day': item.type == 2, 'item-e': item.type == 3}">
                                    <template v-if="item.type == 2">
                                        <div class="date"
                                             :class="{'date-active': item.isToday}">
                                            {{item.isToday ? '今' : item.date}}
                                        </div>
                                        <template v-if="item.data">
                                            <div class="total">{{ transMoney(toDecimal2(item.data.totalPayment)) }}</div>
                                            <div class="text-a">{{ transMoney(toDecimal2(item.data.actualPayment)) }}</div>
                                            <div class="text-b">{{ transMoney(toDecimal2(item.data.estimatedPayment)) }}</div>
                                        </template>
                                    </template>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-right pt15px pb20px pl20px pr20px">
                    <span class="cm-text-light">*以上金额不含采退，采退将在结算时进行抵扣</span>
                    <span class="ml20px"><i class="bill-color-point bill-color-point-a"></i>实际款项</span>
                    <span class="ml20px"><i class="bill-color-point bill-color-point-b"></i>预估款项</span>
                </div>
            </div>
        </div>

        <div class="cm-card mt20px">
            <el-form
                class="cm-form-wrap"
                :inline="true"
                :model="form"
                ref="form">
                <el-form-item prop="test">
                    <el-select
                        v-model="form.timeType"
                        class="clear-border"
                        style="width: 102px;">
                        <el-option
                            v-for="(value, key) in dict.timeType"
                            :label="value"
                            :value="key"
                            :key="key">
                        </el-option>
                    </el-select>
                    <el-date-picker
                        value-format="yyyy-MM-dd 00:00:00"
                        style="width: 150px;"
                        v-model="form.timeStart"
                        type="date"
                        placeholder="选择日期">
                    </el-date-picker>
                    -
                    <el-date-picker
                        value-format="yyyy-MM-dd 23:59:59"
                        style="width: 150px;"
                        v-model="form.timeEnd"
                        type="date"
                        placeholder="选择日期">
                    </el-date-picker>
                </el-form-item>

                <el-form-item prop="orderCode">
                    <el-input
                        v-model="form.orderCode"
                        placeholder="单据号"
                        style="width: 150px;">
                    </el-input>
                </el-form-item>

                <el-form-item prop="relCode">
                    <el-input
                        v-model="form.relCode"
                        placeholder="关联单号"
                        style="width: 150px;">
                    </el-input>
                </el-form-item>

                <el-form-item prop="orderType">
                    <el-select
                        v-model="form.orderType"
                        placeholder="类型"
                        clearable
                        style="width: 150px;">
                        <el-option
                            v-for="(value, key) in dict.orderType"
                            :label="value"
                            :value="key"
                            :key="key">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item prop="supplierCode">
                    <el-input
                        v-model="form.supplierCode"
                        placeholder="供货商编码"
                        style="width: 150px;">
                    </el-input>
                </el-form-item>

                <el-form-item prop="supplierName">
                    <el-input
                        v-model="form.supplierName"
                        placeholder="供货商名称"
                        style="width: 150px;">
                    </el-input>
                </el-form-item>

                <el-form-item prop="contractCode">
                    <el-input
                        v-model="form.contractCode"
                        placeholder="合同编码"
                        style="width: 150px;">
                    </el-input>
                </el-form-item>

                <el-form-item prop="taxReceiptStatus">
                    <el-select
                        v-model="form.taxReceiptStatus"
                        placeholder="税票"
                        clearable
                        style="width: 150px;">
                        <el-option label="有" :value="true"></el-option>
                        <el-option label="无" :value="false"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item prop="estimatedPaymentDate">
                    <el-select
                        v-model="form.estimatedPaymentDate"
                        placeholder="预估账期"
                        clearable
                        style="width: 150px;">
                        <el-option label="是" :value="true"></el-option>
                        <el-option label="否" :value="false"></el-option>
                    </el-select>
                </el-form-item>

                <el-form-item prop="inventoryId">
                    <el-select
                        v-model="form.inventoryId"
                        placeholder="仓库"
                        clearable
                        style="width: 150px;">
                        <el-option
                            v-for="item in invList"
                            :label="item.inventoryName"
                            :value="item.inventoryId"
                            :key="'s' + item.inventoryId">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item prop="applyStatus">
                    <el-select
                        v-model="form.applyStatus"
                        placeholder="申请状态"
                        clearable
                        style="width: 150px;">
                        <el-option
                            v-for="(value, key) in dict.applyStatus"
                            :label="value"
                            :value="key"
                            :key="key">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item prop="inoutStatus">
                    <el-select
                        v-model="form.inoutStatus"
                        placeholder="出入库状态"
                        clearable
                        style="width: 150px;">
                        <el-option
                            v-for="(value, key) in dict.inoutStatus"
                            :label="value"
                            :value="key"
                            :key="key">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item prop="test">
                    <el-button @click="search()">查询</el-button>
                    <el-button @click="reset()">重置</el-button>
                </el-form-item>
            </el-form>

            <div class="cm-card-content">
                <div class="text-right pb10px">
                    <el-radio-group v-model="form.urgent" size="small">
                        <el-radio-button :label="false"><span class="pl5px pr5px">全部</span></el-radio-button>
                        <el-radio-button :label="true"><span class="pl5px pr5px">加急</span></el-radio-button>
                    </el-radio-group>
                </div>

                <el-table
                    :data="list"
                    border>
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
                        <template slot-scope="scope">
                            <span class="cm-text-orange cm-cursor"
                                  @click="pageChange('detail', scope.row.orderCode, scope.row.orderType)">
                                {{ scope.row.orderCode }}
                            </span>
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="关联单号"
                        min-width="150"
                        align="center">
                        <template slot-scope="scope">
                            {{ scope.row.relCode || '-' }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="类型"
                        min-width="80"
                        align="center">
                        <template slot-scope="scope">
                            {{ dict.orderType[scope.row.orderType] }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        prop="submitTime"
                        label="提交时间"
                        min-width="150"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        prop="supplierCode"
                        label="供货商编码"
                        min-width="120"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        prop="supplierName"
                        label="供货商名称"
                        min-width="140"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        prop="contractCode"
                        label="合同编码"
                        min-width="160"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        label="税票"
                        min-width="80"
                        align="center">
                        <template slot-scope="scope">
                            {{ scope.row.taxReceiptStatus ? '有' : '无' }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        prop="paymentDay"
                        label="账期（天）"
                        min-width="120"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        label="账期到期"
                        min-width="140"
                        align="center">
                        <template slot-scope="scope">
                            {{ scope.row.duePaymentDate ? scope.row.duePaymentDate : '未计算' }}
                            <p v-if="scope.row.duePaymentDate && scope.row.applyStatus == 2"
                               class="cm-text-light">
                                （预估）
                            </p>
                        </template>
                    </el-table-column>

                    <el-table-column
                        prop="inventoryName"
                        label="仓库"
                        min-width="140"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        label="应付金额（元）"
                        min-width="120"
                        align="center">
                        <template slot-scope="scope">
                            {{ (scope.row.orderType == 2 ? '-' : '') + transMoney(toDecimal2(scope.row.originPrice)) }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="实际应付（元）"
                        min-width="120"
                        align="center">
                        <template slot-scope="scope">
                            {{ scope.row.actualPrice ? ( (scope.row.orderType == 2 ? '-' : '') + transMoney(toDecimal2(scope.row.actualPrice)) ) : '未复核' }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="申请状态"
                        min-width="120"
                        align="center">
                        <template slot-scope="scope">
                            {{ dict.applyStatus[scope.row.applyStatus] }}
                        </template>
                    </el-table-column>

                    <el-table-column
                        label="出入库状态"
                        min-width="120"
                        align="center">
                        <template slot-scope="scope">
                            {{ dict.inoutStatus[scope.row.inoutStatus] }}
                        </template>
                    </el-table-column>
                </el-table>

                <!--分页-->
                <div class="cm-pagination-wrap">
                    <el-pagination
                        @size-change="handleSizeChange"
                        @current-change="handleCurrentChange"
                        :current-page="form.page"
                        :page-sizes="[10, 20, 50, 100]"
                        :page-size="form.pageSize"
                        layout="total, sizes, prev, pager, next, jumper"
                        :total="total">
                    </el-pagination>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import excelExporter from './../../components/excel-exporter';
    import { toDecimal2, transMoney } from 'utils';

    export default {
        name: 'payment-management-list',
        components: {
            excelExporter
        },
        data () {
            return {
                orderStat: {
                    needReview: 0,
                    needToReview: 0,
                    needApprovalTotal: 0,
                    needApprovalNormal: 0,
                    needApprovalUrgent: 0
                },

                previewData: {},

                previewTime: null,
                monthList: [],

                previewInv: null,
                invList: [],

                strList: ['日', '一', '二', '三', '四', '五', '六'],

                form: {
                    timeType: 'submitTime',
                    timeStart: null,
                    timeEnd: null,
                    inventoryId: '',
                    orderCode: '',
                    orderType: '',
                    relCode: '',
                    applyStatus: '',
                    inoutStatus: '',
                    supplierCode: '',
                    supplierName: '',
                    taxReceiptStatus: '',
                    contractCode: '',
                    estimatedPaymentDate: '',
                    urgent: false,
                    page: 1,
                    pageSize: 10,
                },

                list: [],
                total: 0,

                disabledExport: false
            }
        },
        computed: {
            dict () {
                return this.$store.state.dict.allBill;
            },
            calendarItemList () {
                let _this = this,
                    arr = [],

                    now = new Date(),
                    nowMonth = now.getMonth(),
                    nowDate = now.getDate(),

                    start = new Date(this.previewTime.value),
                    startYear = start.getFullYear(),
                    startMonth = start.getMonth(),
                    startDay = start.getDay(),

                    end = new Date(startYear, startMonth + 1, 0),
                    endDate = end.getDate();

                for (let i = 0; i < startDay; i++) {
                    arr.push({
                        type: 1,
                        date: '',
                        isToday: false,
                        data: undefined
                    });
                }

                for (let i = 1; i <= endDate; i++) {

                    arr.push({
                        type: 2,
                        date: i,
                        isToday: nowMonth == startMonth && nowDate == i,
                        data: _this.previewData[new Date(startYear, startMonth, i).format('yyyy-MM-dd')]
                    });
                }

                for (let i = startDay + endDate; i < 42; i++) {
                    arr.push({
                        type: 3,
                        date: '',
                        isToday: false,
                        data: undefined
                    });
                }

                return arr;
            }
        },
        methods: {
            transMoney,
            toDecimal2,

            getInvList () {
                let _this = this;

                _this.$get({
                    url: `/api/fms/api/inventory/list`,
                    success: res => {
                        _this.invList = res.data;
                    }
                });

            },
            getOrderStat () {
                let _this = this;

                _this.$get({
                    url: `/api/fms/api/inout/orderStat`,
                    success: res => {
                        _this.orderStat = res.data;
                    }
                });
            },
            getPreviewData () {
                let _this = this,
                    param = _this.getParam();

                _this.$get({
                    url: `/api/fms/api/inout/payablePreview`,
                    data: param,
                    success: res => {
                        var obj = {};

                        res.data.forEach((item) => {
                            obj[item.date] = item;
                        });

                        _this.previewData = obj;
                    }
                });
            },
            getParam () {
                let _this = this,
                    start = new Date(_this.previewTime.value),
                    end = new Date(start.getFullYear(), start.getMonth() + 1, 0),
                    param = {
                        timeStart: start.format('yyyy-MM-dd'),
                        timeEnd: end.format('yyyy-MM-dd')
                    };

                if (_this.previewInv) {
                    param.inventoryId = _this.previewInv.inventoryId;
                }

                return param;
            },

            search (page) {
                let _this = this;

                if (page !== undefined) {
                    _this.form.page = page;
                } else {
                    _this.form.page = 1;
                }

                var params = Object.assign({}, _this.form);

                for (var key in params) {
                    if (params[key] === '' || params[key] === null) {
                        delete params[key];
                    }
                }

                _this.$post({
                    url: `/api/fms/api/inout/list`,
                    data: params,
                    success: res => {
                        _this.list = res.data;
                        _this.total = res.total;
                    }
                });
            },
            reset () {
                this.$refs.form.resetFields();
                Object.assign(this.form, {
                    timeType: 'submitTime',
                    timeStart: '',
                    timeEnd: ''
                });
            },
            handleSizeChange (pageSize) {
                this.form.pageSize = pageSize;
                this.search();
            },
            handleCurrentChange (page) {
                this.search(page);
            },

            handleCommandTime (month) {
                this.previewTime = month;
                this.getPreviewData();
            },
            handleCommandInv (inv) {
                this.previewInv = inv;
                this.getPreviewData();
            },

            handleExportStart () {
                this.disabledExport = true;
            },
            handleExportFinish () {
                this.disabledExport = false;
            },

            pageChange (type, id, orderType) {
                this.$emit('pageChange', type, id, orderType);
            }
        },
        created () {
            let _this = this,
                now = new Date(),
                year = now.getFullYear(),
                month = now.getMonth(),
                time1 = new Date(year, month, 1),
                time2 = new Date(year, month + 1, 1),
                time3 = new Date(year, month + 2, 1);

            _this.monthList = [
                {
                    value: time1.format('yyyy-MM'),
                    label: time1.format('yyyy年M月')
                },
                {
                    value: time2.format('yyyy-MM'),
                    label: time2.format('yyyy年M月')
                },
                {
                    value: time3.format('yyyy-MM'),
                    label: time3.format('yyyy年M月')
                }
            ];
            _this.previewTime = _this.monthList[0];

            _this.getInvList();
            _this.getOrderStat();
            _this.getPreviewData();
            _this.search();
        }
    }
</script>

<style scoped>
    .bill-calendar{
        width: 100%;
        font-size: 0;
    }
    .bill-calendar .item{
        display: inline-block;
        width: 7.14%;
        vertical-align: top;
    }
    .bill-calendar .item-top{
        height: 30px;
        line-height: 30px;
        text-align: center;
        font-size: 14px;
    }
    .bill-calendar .item-day, .bill-calendar .item-s, .bill-calendar .item-e{
        height: 80px;
        border-top: 1px solid #eaeaea;
        border-left: 1px solid #eaeaea;
        border-bottom: 1px solid #eaeaea;
        margin-top: -1px;
        position: relative;
    }
    .bill-calendar .item-day::after{
        content: '';
        position: absolute;
        top: -1px;
        bottom: -1px;
        right: -1px;
        border-right: 1px solid #eaeaea;
    }
    .bill-calendar .item-s{
        border-top: none;
        border-left: none;
    }
    .bill-calendar .item-e{
        border-left: none;
        border-bottom: none;
    }
    .bill-calendar .item .date{
        display: inline-block;
        font-size: 12px;
        width: 18px;
        height: 18px;
        line-height: 18px;
        border-radius: 50%;
        margin: 1px 0 2px 2px;
    }
    .bill-calendar .item .date-active{
        background-color: #FF9640;
        color: #ffffff;
        text-align: center;
    }
    .bill-calendar .item .total{
        font-size: 14px;
        font-weight: bold;
        padding: 0 3px;
    }
    .bill-calendar .item .text-a, .bill-calendar .item .text-b{
        margin-top: 3px;
        padding: 0 8px;
        position: relative;
        background-color: #fff2f9;
        color: #FF438E;
        font-size: 12px;
        height: 16px;
        line-height: 16px;
        overflow: hidden;
    }
    .bill-calendar .item .text-a:before, .bill-calendar .item .text-b:before{
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 3px;
        height: 16px;
        background-color: #FF438E;
    }
    .bill-calendar .item .text-b{
        background-color: #f8f9ff;
        color: #0077FF;
    }
    .bill-calendar .item .text-b:before{
        background-color: #0077FF;
    }

    .bill-color-point{
        display: inline-block;
        width: 12px;
        height: 12px;
        vertical-align: middle;
        position: relative;
        top: -1px;
        border-radius: 50%;
        margin-right: 5px;
    }
    .bill-color-point-a{
        background-color: #FF438E;
    }
    .bill-color-point-b{
        background-color: #0077FF;
    }
</style>
