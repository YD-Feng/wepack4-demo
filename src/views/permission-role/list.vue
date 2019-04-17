<template>
    <div class="cm-page">
        <el-form class="cm-page-title"
                 :inline="true"
                 :model="form"
                 ref="form"
                 label-width="80px">
            <el-form-item label="创建时间" prop="dateTime">
                <el-date-picker
                    v-model="form.dateTime"
                    type="daterange"
                    :editable="false"
                    :picker-options="pickerOptions"
                    placeholder="选择时间范围"
                    @change="handleDatetimeChange"
                    style="width: 220px;">
                </el-date-picker>
            </el-form-item>

            <el-form-item label="角色名称" prop="name">
                <el-input v-model="form.name" style="width: 220px;"></el-input>
            </el-form-item>

            <el-form-item label="角色类型" prop="roleType">
                <el-select v-model="form.roleType" clearable filterable style="width: 220px;">
                    <el-option
                        v-for="item in roleType"
                        :label="item.name"
                        :value="item.id"
                        :key="item.id">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="角色状态" prop="status">
                <el-select v-model="form.status" clearable filterable style="width: 220px;">
                    <el-option
                        v-for="item in status"
                        :label="item.name"
                        :value="item.id" :key="item.id">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item label="上级角色" prop="pId">
                <el-select v-model="form.pId" clearable filterable style="width: 220px;">
                    <el-option
                        v-for="item in listNextRoles"
                        :label="item.name"
                        :value="item.roleId" :key="item.roleId">
                    </el-option>
                </el-select>
            </el-form-item>

            <el-form-item style="padding-left: 40px;">
                <el-button type="primary" @click="search()">查询</el-button>
                <el-button type="default" @click="handleReset('form')">重置</el-button>
            </el-form-item>
        </el-form>

        <div class="cm-page-content">
            <div class="oh">
                <el-button
                    class="mb10px"
                    v-if="hasRight('rights-role-create')"
                    type="primary"
                    @click="goToDetail('add')">
                    新增角色
                </el-button>
            </div>
            <!--列表-->
            <el-table
                :data="list"
                border
                style="width: 100%;">
                <el-table-column
                    prop="name"
                    label="名称"
                    min-width="160">
                    <template slot-scope="scope">
                        <a class="cm-text-orange cm-cursor"
                           @click="goToDetail(scope.row.canEdit == 1 ? 'edit' : 'look', scope.row.roleId)">
                            {{ scope.row.name }}
                        </a>
                    </template>
                </el-table-column>

                <el-table-column
                    prop="roleType"
                    label="类型"
                    align="center">
                    <template slot-scope="scope">
                        {{scope.row.roleType | roleTypeFilter}}
                    </template>
                </el-table-column>

                <el-table-column
                    prop="creationDate"
                    label="创建时间"
                    min-width="120">
                </el-table-column>

                <el-table-column
                    prop="status"
                    label="状态"
                    align="center">
                    <template slot-scope="scope">
                        {{scope.row.status | statusFilter}}
                    </template>
                </el-table-column>

                <el-table-column
                    prop="parentRoleName"
                    label="上级角色"
                    min-width="120">
                </el-table-column>

                <el-table-column
                    prop="enableAccountTotal"
                    label="有效账号数"
                    align="center">
                </el-table-column>

                <el-table-column
                    prop="accountTotal"
                    label="总账号数"
                    align="center">
                </el-table-column>

                <el-table-column
                    label="操作"
                    width="130"
                    align="center">
                    <template slot-scope="scope">
                        <el-button
                            size="mini"
                            type="primary"
                            @click="handleEnable(scope.$index, scope.row)"
                            v-if="hasRight('rights-role-enable') && scope.row.canEnable == 1">
                            启用
                        </el-button>
                        <el-button
                            size="mini"
                            type="warning"
                            @click="handleStop(scope.$index, scope.row)"
                            v-if="hasRight('rights-role-stop') && scope.row.canStop == 1">
                            停用
                        </el-button>
                        <el-button
                            size="mini"
                            type="danger"
                            @click="handleDelete(scope.$index, scope.row)"
                            v-if="hasRight('rights-role-delete') && scope.row.canDel == 1">
                            删除
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
    export default {
        data () {
            return {
                pickerOptions: {
                    shortcuts: [{
                        text: '最近一周',
                        onClick(picker) {
                            var now = new Date(),
                                end = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                                start = new Date(end.valueOf() - 3600 * 1000 * 24 * 7);

                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近一个月',
                        onClick(picker) {
                            var now = new Date(),
                                end = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                                start = new Date(end.valueOf() - 3600 * 1000 * 24 * 30);

                            picker.$emit('pick', [start, end]);
                        }
                    }, {
                        text: '最近三个月',
                        onClick(picker) {
                            var now = new Date(),
                                end = new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                                start = new Date(end.valueOf() - 3600 * 1000 * 24 * 90);
                            picker.$emit('pick', [start, end]);
                        }
                    }]
                },

                roleType: [
                    {id: 'sys', name: "系统"},
                    {id: 'common', name: "普通"}
                ],

                status: [
                    {id: 'stop', name: "停用"},
                    {id: 'enable', name: "启用"},
                    {id: 'unable', name: "未启用"}
                ],

                list: [],
                total: 0,

                form: {
                    pageSize: 10,
                    page: 1,
                    name: '',
                    roleType: '',
                    status: '',
                    pId: '',
                    dateTime: null,
                },

                listNextRoles: [],
                currentSearch: {
                    // 保存页面返回时的查询参数
                }
            }
        },
        computed: {
            refreshListFlag () {
                return this.$store.state.flags.refreshListFlag;
            }
        },
        watch: {
            refreshListFlag () {
                this.search();
            }
        },
        methods: {
            handleDatetimeChange (date) {
                this.form.start = '';
                this.form.end = '';

                if (date) {
                    this.form.start = new Date(date[0]).format('yyyy-MM-dd') + ' 00:00:00';
                    this.form.end = new Date(date[1]).format('yyyy-MM-dd') + ' 23:59:59';
                }
            },
            search (page) {
                if (page === undefined) {
                    this.form.page = 1;
                }
                var params = Object.assign({}, this.form);

                params.limit = params.pageSize;
                params.offset = (params.page - 1) * params.pageSize;

                this.$get({
                    url: '/api/permission/role/list',
                    data: params,
                    success: res => {
                        this.list = res.data;
                        this.total = res.total;
                    }
                });
            },
            handleSizeChange (pageSize) {
                this.form.pageSize = pageSize;
                this.form.page = 1;
                this.search();
            },
            handleCurrentChange (page) {
                this.form.page = page;
                this.search(page);
            },
            handleReset (formName) {
                this.$refs[formName].resetFields();
            },
            //获取下级角色列表（包含当前角色）
            loadNextRoles () {
                this.$get({
                    url: '/api/permission/listNextRoles',
                    success: res => {
                        this.listNextRoles = res.data;
                        this.listNextRoles.unshift({
                            roleId: '',
                            name: '全部'
                        });
                    }
                });
            },
            handleDelete (index, row) {
                this.$confirm('此操作将删除角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.deal(row.roleId, 'delete');
                }).catch(() => {});
            },
            handleEnable (index, row) {
                this.$confirm('此操作将启用角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'info'
                }).then(() => {
                    this.deal(row.roleId, 'enable');
                }).catch(() => {});
            },
            handleStop (index, row) {
                this.$confirm('此操作将停用角色, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    this.deal(row.roleId, 'stop');
                }).catch(() => {});
            },
            deal (roleId, type) {
                var obj = {
                        delete: '/api/permission/deleteRole/' + roleId,
                        enable: '/api/permission/role/' + roleId + '/enable',
                        stop: '/api/permission/role/' + roleId + '/stop'
                    };

                this.$get({
                    url: obj[type],
                    success: res => {
                        this.$message.success(res.desc);
                        this.search();
                    },
                    error: res => {
                        this.$message.error(res.desc);
                    }
                });
            },
            goToDetail (type, roleId) {
                this.$emit('pageChange', type, roleId);
            }
        },
        filters: {
            roleTypeFilter (val) {
                switch (val) {
                    case 'sys':
                        return '系统';
                        break;
                    case 'common':
                        return '普通';
                        break;
                    default:
                        return '';
                }
            },
            statusFilter (val) {
                switch (val) {
                    case 'enable':
                        return '启用';
                        break;
                    case 'unable':
                        return '未启用';
                        break;
                    default:
                        return '停用';
                }
            }
        },
        created () {
            this.search();
            this.loadNextRoles();
        }
    }
</script>
