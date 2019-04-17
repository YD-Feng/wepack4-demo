<template>
    <div class="cm-page">
        <el-form
            class="cm-form-wrap"
            :inline="true"
            :model="form"
            ref="form">
            <el-form-item>
                <el-select
                    v-model="form.timeType"
                    class="clear-border"
                    style="width: 78px;">
                    <el-option
                        v-for="(value, key) in dict.timeType"
                        :label="value"
                        :value="key"
                        :key="key">
                    </el-option>
                </el-select>
                <el-date-picker
                    :editable="false"
                    value-format="yyyy-MM-dd 00:00:00"
                    v-model="form.timeStart"
                    type="date"
                    placeholder="选择日期"
                    style="width: 150px;">
                </el-date-picker>
                -
                <el-date-picker
                    :editable="false"
                    value-format="yyyy-MM-dd 23:59:59"
                    v-model="form.timeEnd"
                    type="date"
                    placeholder="选择日期"
                    style="width: 150px;">
                </el-date-picker>
            </el-form-item>

            <el-form-item prop="code">
                <el-input v-model="form.code" placeholder="申请单号" style="width: 150px;"></el-input>
            </el-form-item>

            <el-form-item prop="supplierCode">
                <el-input v-model="form.supplierCode" placeholder="供货商编码" style="width: 150px;"></el-input>
            </el-form-item>

            <el-form-item prop="supplierName">
                <el-input v-model="form.supplierName" placeholder="供货商名称" style="width: 150px;"></el-input>
            </el-form-item>

            <el-form-item prop="status">
                <el-select
                    clearable
                    v-model="form.status"
                    placeholder="状态"
                    style="width: 150px;">
                    <el-option
                        v-for="(value, key) in dict.status"
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

        <div class="cm-page-content">
            <div class="clearfix mb10px">
                <el-button
                    v-if="hasRight('yfgl-fkgl-cjsq')"
                    @click="pageChange('add')"
                    class="fl">
                    创建申请
                </el-button>

                <excelExporter
                    v-if="hasRight('yfgl-fkgl-dcmx')"
                    class="fr ml10px"
                    code="fms-yfgl-fkgl-dcmx"
                    @start="exportDetailStart"
                    @finish="exportDetailFinish"
                    :param="exportParams">
                    <el-button
                        :disabled="disabledExportDetail">
                        导出明细
                    </el-button>
                </excelExporter>

                <excelExporter
                    v-if="hasRight('yfgl-fkgl-dcjs')"
                    class="fr"
                    code="fms-yfgl-fkgl-dcjs"
                    @start="exportSettlementStart"
                    @finish="exportSettlementFinish"
                    :param="exportParams">
                    <el-button
                        :disabled="disabledExportSettlement">
                        导出结算
                    </el-button>
                </excelExporter>
            </div>

            <el-table
                ref="table"
                border
                :data="list"
                @selection-change="handleSelectionChange"
                row-key="id"
                :expand-row-keys="expandRowKeys">
                <el-table-column
                    width="40"
                    align="center"
                    type="selection">
                    <template slot-scope="scope" slot="expand">
                        <el-table
                            :data="scope.row.inoutDtoList"
                            border
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
                    </template>
                </el-table-column>

                <el-table-column
                    label="序号"
                    align="center"
                    type="index"
                    width="50">
                </el-table-column>

                <el-table-column
                    label="申请单号"
                    align="center"
                    min-width="140">
                    <template slot-scope="scope">
                        <span class="cm-text-orange cm-cursor"
                              @click="pageChange('detail', scope.row.id)">
                            {{scope.row.code}}
                        </span>
                    </template>
                </el-table-column>

                <el-table-column
                    prop="createTime"
                    label="提交时间"
                    align="center"
                    min-width="150">
                </el-table-column>

                <el-table-column
                    prop="supplierCode"
                    label="供货商编码"
                    align="center"
                    min-width="120">
                </el-table-column>

                <el-table-column
                    prop="supplierName"
                    label="供货商名称"
                    align="center"
                    min-width="140">
                </el-table-column>

                <el-table-column
                    prop="accountNumber"
                    label="银行卡号"
                    align="center"
                    min-width="180">
                </el-table-column>

                <el-table-column
                    prop="accountHolder"
                    label="户名"
                    align="center"
                    min-width="140">
                </el-table-column>

                <el-table-column
                    label="所属银行"
                    align="center"
                    min-width="140">
                    <template slot-scope="scope">
                        {{scope.row.accountBank}}（{{scope.row.accountSubbank}}）
                    </template>
                </el-table-column>

                <el-table-column
                    label="单据数"
                    align="center"
                    min-width="120">
                    <template slot-scope="scope">
                        <el-button type="text" @click="triggerRow(scope.row.id)">
                            单据数
                            <i class="el-icon--right"
                               style="font-size: 12px;"
                               :class="{'el-icon-arrow-down': expandRowKeys[0] != scope.row.id, 'el-icon-arrow-up': expandRowKeys[0] == scope.row.id}">
                            </i>
                        </el-button>
                    </template>
                </el-table-column>

                <el-table-column
                    label="待结算"
                    align="center"
                    min-width="120">
                    <template slot-scope="scope">
                        <p>{{ transMoney(toDecimal2(scope.row.unsettlementPrice)) }}</p>
                        <p>（共{{ transMoney(toDecimal2(scope.row.totalPrice)) }}）</p>
                    </template>
                </el-table-column>

                <el-table-column
                    label="状态"
                    align="center"
                    min-width="80">
                    <template slot-scope="scope">
                        {{ dict.status[scope.row.status] }}
                    </template>
                </el-table-column>

                <el-table-column
                    label="操作"
                    align="center"
                    width="200">
                    <template slot-scope="scope">
                        <el-button
                            v-if="hasRight('yfgl-fkgl-qxsq')"
                            :disabled="scope.row.status != 1"
                            type="default"
                            @click="handleCancel(scope.row.id)">
                            取消申请
                        </el-button>

                        <el-button
                            v-if="scope.row.status == 1 && hasRight('yfgl-fkgl-shsq')"
                            type="primary"
                            @click="pageChange('audit', scope.row.id)">
                            审核申请
                        </el-button>

                        <el-button
                            v-if="scope.row.status != 1 && hasRight('yfgl-fkgl-qrjs')"
                            :disabled="scope.row.status == 4 || scope.row.status == 5"
                            type="primary"
                            @click="pageChange('confirm', scope.row.id)">
                            确认结算
                        </el-button>
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
                form: {
                    showDetail: true,
                    code: '',
                    status:'',
                    supplierCode: '',
                    supplierName: '',
                    timeType: 'createTime',
                    timeStart: null,
                    timeEnd: null,
                    page: 1,
                    pageSize: 10,
                },

                list: [],
                total: 0,

                expandRowKeys: [],
                selectionList: [],

                spanMethodCache: {},

                disabledExportSettlement: false,
                disabledExportDetail: false
            }
        },
        computed: {
            dict () {
                return this.$store.state.dict.paymentManage;
            },
            refreshListFlag () {
                return this.$store.state.flags.refreshListFlag;
            },
            exportParams () {
                let params = Object.assign({}, this.form);
                delete params.page;
                delete params.pageSize;
                return params;
            }
        },
        watch: {
            refreshListFlag () {
                this.search();
            }
        },
        methods: {
            transMoney,
            toDecimal2,

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
                    url: `/api/fms/api/settlementApply/list`,
                    data: params,
                    success: res => {
                        res.data.forEach((item) => {
                            item.inoutDtoList.forEach((dto) => {
                                if (_this.spanMethodCache[dto.settlementCode]) {
                                    _this.spanMethodCache[dto.settlementCode]++;
                                } else {
                                    _this.spanMethodCache[dto.settlementCode] = 1;
                                }
                            });
                        });

                        _this.list = res.data;
                        _this.total = res.total;
                    }
                });
            },
            reset () {
                this.$refs.form.resetFields();
                Object.assign(this.form, {
                    timeType: 'createTime',
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
            handleSelectionChange (selection) {
                this.selectionList = selection;
            },

            // 导出结算
            exportSettlementStart () {
                this.disabledExportSettlement = true;
            },
            exportSettlementFinish () {
                this.disabledExportSettlement = false;
            },
            // 导出明细
            exportDetailStart () {
                this.disabledExportDetail = true;
            },
            exportDetailFinish () {
                this.disabledExportDetail = false;
            },
            triggerRow (id) {
                if (this.expandRowKeys[0] == id) {
                    this.expandRowKeys = [];
                } else {
                    this.expandRowKeys = [id];
                }
            },
            spanMethod ({ row, column, rowIndex, columnIndex }) {
                if (columnIndex > 7) {
                    return {
                        rowspan: this.spanMethodCache[row.settlementCode],
                        colspan: 1
                    };
                }
            },

            handleCancel (id) {
                let _this = this;

                _this.$confirm(`确定取消该申请？`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning',
                    customClass: 'cm-confirm-box'
                }).then(() => {
                    _this.doCancel(id);
                }, () => {});
            },
            doCancel (id) {
                let _this = this;

                _this.$get({
                    url: `/api/fms/api/settlementApply/cancel/${id}`,
                    success: res => {
                        _this.$message.success('取消申请成功');
                        _this.search();
                    }
                });
            },

            pageChange (type, id, orderType) {
                this.$emit('pageChange', type, id, orderType);
            }
        },
        mounted () {
            this.$refs.table.renderExpanded = (h, data) => {
                return this.$refs.table.$children[0].$scopedSlots.expand(data);
            };
        },
        created () {
            this.search();
        }
    }
</script>
