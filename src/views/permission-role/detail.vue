<template>
    <div class="cm-page">
        <div class="cm-page-title">
            <el-button class="mr10px" icon="el-icon-arrow-left" @click="goBack">返回</el-button>
            {{pageTypeName}}
        </div>

        <div class="cm-page-content" v-if="initFlag">
            <el-form ref="form"
                     :rules="rules"
                     :model="form"
                     label-width="100px">

                <p class="title">基本信息</p>
                <el-form-item label="创建时间" v-if="isUpdate">
                    <span class="lh30px">{{form.creationDate}}</span>
                </el-form-item>

                <el-form-item label="角色状态">
                    <span class="lh30px">{{form.status | statusFilter}}</span>
                </el-form-item>

                <el-form-item label="角色名称" prop="name">
                    <span class="lh30px" v-if="isAdminRole || !canEdit">{{form.name}}</span>
                    <el-input v-else v-model="form.name" placeholder="角色名称" style="width: 250px;"></el-input>
                </el-form-item>

                <el-form-item label="角色类型" prop="roleType">
                    <span class="lh30px" v-if="isAdminRole || !canEdit || (isUpdate && !isSuperAccount && form.roleType == 'sys')">{{form.roleType | roleTypeFilter}}</span>
                    <el-select v-model="form.roleType" clearable filterable placeholder="角色类型" v-else style="width: 250px;">
                        <el-option
                            v-for="item in roleTypes"
                            v-if="item.id == 'sys' && isSuperAccount || item.id != 'sys'"
                            :label="item.name"
                            :value="item.id" :key="item.id">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="上级角色" prop="pId">
                    <span class="lh30px" v-if="!isCanChangeParentRole || !canEdit">{{form.pId | getParentRoleName(parentRoleList)}}</span>
                    <el-select v-model="form.pId" clearable placeholder="上级角色" @change="handleChangeParentRole" v-else style="width: 250px;">
                        <el-option
                            v-for="item in parentRoleList"
                            :label="item.name"
                            :value="item.roleId" :key="item.roleId">
                        </el-option>
                    </el-select>
                </el-form-item>

                <el-form-item label="权限设置">
                    <el-tree
                        ref="tree"
                        :data="tree"
                        :props="defaultProps"
                        node-key="id"
                        default-expand-all
                        :expand-on-click-node="false"
                        :render-content="renderContent"
                        style="border:none; background-color: transparent;">
                    </el-tree>
                </el-form-item>
            </el-form>
            <div class="line"></div>

            <div class="mt20px">
                <el-button style="width: 80px;" type="primary" @click="handleSave" v-if="!isAdminRole && (hasRight('rights-role-edit') || hasRight('rights-role-create')) && canEdit">保存</el-button>
                <el-button style="width: 80px;" type="default" @click="goBack">返回</el-button>
            </div>


            <div v-if="isUpdate" class="mt20px">
                <p class="lh30px fBold f14px">账号列表</p>
                <el-table
                    :data="accountList"
                    border
                    style="width: 100%">
                    <el-table-column
                        label="序号"
                        width="80"
                        align="center">
                        <template slot-scope="scope">
                            {{scope.$index + 1}}
                        </template>
                    </el-table-column>

                    <el-table-column
                        prop="creationDate"
                        label="创建时间"
                        min-width="180">
                    </el-table-column>

                    <el-table-column
                        prop="name"
                        label="名称"
                        min-width="180">
                    </el-table-column>

                    <el-table-column
                        prop="operator.loginName"
                        label="账号"
                        min-width="180">
                    </el-table-column>

                    <el-table-column
                        label="状态"
                        min-width="80">
                        <template slot-scope="scope">
                            {{scope.row.status | statusFilter}}
                        </template>
                    </el-table-column>
                </el-table>
                <div class="line mt20px"></div>

                <p class="lh30px fBold f14px">操作记录</p>
                <el-table
                    border
                    :data="recordList"
                    style="width: 100%">
                    <el-table-column
                        type="index"
                        label="序号"
                        width="80"
                        align="center">
                    </el-table-column>

                    <el-table-column
                        prop="creationDate"
                        label="操作时间"
                        min-width="150">
                    </el-table-column>

                    <el-table-column
                        prop="title"
                        label="操作标题"
                        min-width="120">
                    </el-table-column>

                    <el-table-column
                        prop="content"
                        label="操作内容"
                        min-width="380">
                    </el-table-column>

                    <el-table-column
                        prop="operName"
                        label="操作人"
                        min-width="80">
                    </el-table-column>
                </el-table>
            </div>
            <br>

        </div>
    </div>

</template>

<script>
    export default {
        props: ['roleId', 'pageType'],
        data () {
            return {
                initFlag: false,

                rules: {
                    name: [
                        {
                            required: true,
                            message: '请输入角色名称',
                            trigger: 'blur'
                        }
                    ],
                    roleType: [
                        {
                            required: true,
                            message: '请选择角色类型'
                        }
                    ],
                    pId: [
                        {
                            required: true,
                            message: '请选择上级角色'
                        }
                    ]
                },

                isCanChangeParentRole: false,//是否可以更改上级角色

                accountList: [
                    /*{
                        "createdBy":1015763,
                        "creationDate":"2017-07-25 15:27:17",
                        "lastUpdatedBy":0,
                        "lastUpdateDate":"2017-07-25 16:42:19",
                        "id":127,
                        "status":"enable",
                        "name":"测试账号test",
                        "level":1,
                        "operId":1015907,
                        "operator":{
                            "operId":1015907,
                            "operType":"account_center",
                            "status":"enable",
                            "loginName":"test123",
                            "mobile":"13838384388",
                            "salt":"1500967637433"
                        }
                    }*/
                ],

                recordList: [
                    /*{
                        "createdBy":1015763,
                        "creationDate":"2017-07-25 15:39:30",
                        "lastUpdatedBy":1015763,
                        "lastUpdateDate":"2017-07-25 15:39:30",
                        "roleRecordId":223,
                        "systemCode":"newmanage",
                        "roleId":83,
                        "title":"创建角色",
                        "content":"创建新的角色",
                        "operName":"tmsly"
                    }*/
                ],

                tree: [],//所有资源列表，数据结构灰常复杂，请直接查看 /api/permission/listAllEnableResource 接口的返回数据

                defaultProps: {
                    children: 'children',
                    label: 'name'
                },
                form: {
                    roleId: '',
                    name: '',
                    roleType: '',
                    pId: '',
                    status: 'unable',
                    creationDate: '',
                    roleResourceRelList: [] //选中的
                },

                roleTypes:[
                    {
                        id: 'sys',
                        name: '系统'
                    },
                    {
                        id: 'common',
                        name: '普通'
                    }
                ],

                canSelect: [], //进来可选的

                nextRoles: [
                    /*{
                        "createdBy":0,
                        "creationDate":"2017-06-13 15:04:58",
                        "lastUpdatedBy":0,
                        "lastUpdateDate":"2017-07-01 17:38:56",
                        "roleId":40,
                        "systemCode":"newmanage",
                        "name":"超级管理员",
                        "level":0,
                        "roleType":"sys",
                        "status":"enable",
                        "children":[],
                        "roleResourceRelList":[],
                        "pId":0
                    }*/
                ], //下级角色列表（包含当前登录帐号角色）

                curRole: null, //页面展示角色的详细信息（此对象不允许变更，用于后续更新后，与form对象做比较）
                parentRole: null //页面展示角色父角色的详细信息
            }
        },
        computed: {
            pageTypeName: function () {
                var obj = {
                    list: '',
                    add: '新增角色',
                    edit: '编辑角色',
                    look: '查看角色'
                };
                return obj[this.pageType];
            },
            isUpdate: function () {
                return !!this.roleId;
            },
            //能否编辑表单，新增，编辑的时候可以
            canEdit: function () {
                return this.pageType == 'add' || this.pageType == 'edit';
            },
            //当前登录用户是否超级管理员
            isSuperAccount: function () {
                return this.$store.state.user.isSuperAccount;
            },
            //下级角色列表（不包含当前登录帐号角色）
            parentRoleList: function () {
                var _this = this;

                //查看，编辑的时候，有传入roleId
                if (!!_this.roleId) {
                    var arr = [],
                        flag = _this.curRole && _this.curRole.pId > 0 && !_this.nextRoles.some(function (item) {
                            return item.roleId == _this.curRole.pId;
                        }); //如果页面展示角色不是超管，且页面展示角色的父角色 不是 当前登录用户所属角色 及其 下级角色 （说白了就是当前登录用户无权限操作此角色）

                    //如果没有操作权限
                    if (_this.parentRole && flag) {
                        arr.push(_this.parentRole);
                    }

                    arr = arr.concat(_this.nextRoles);

                    return arr.filter(function (item) {
                        return item.roleId != _this.roleId;
                    });
                } else {
                    //新增的时候，没传入roleId
                    return _this.nextRoles;
                }
            },
            //页面展示的是否超级管理员角色
            isAdminRole: function () {
                return this.form.pId === 0;
            }
        },
        methods: {
            //初始化
            init () {
                var _this = this;

                //获取全部资源
                _this.getAllEnableResource();
                //获取下级角色列表
                _this.getNextRoles();

                //如果是查看/编辑角色（有传入roleId）
                if (_this.isUpdate) {
                    //获取当前角色的详细信息（权限）
                    _this.findRole(_this.form.roleId, function (curRoleRes) {

                        _this.initFlag = true;
                        curRoleRes.data.roleResourceRelList.forEach(function (item) {
                            item.code = item.resourceCode;
                        });
                        _this.curRole = Object.assign({}, curRoleRes.data);
                        _this.form = curRoleRes.data;

                        //如果当前展示角色不是超管
                        if (curRoleRes.data.pId > 0) {
                            //再获取父级角色的详细信息（权限）
                            _this.findRole(curRoleRes.data.pId, function (parentRoleRes) {
                                _this.parentRole = parentRoleRes.data;
                                _this.canSelect = parentRoleRes.data.roleResourceRelList;
                            });
                        }

                        _this.getAccountList();
                        _this.getRecordList();
                        _this.setCanSelect();
                    });
                    //检测是否可以编辑上级角色
                    _this.checkCanChangeParentRole(_this.form.roleId);
                } else {
                    //新增角色，直接可以编辑上级角色
                    _this.isCanChangeParentRole = true;
                    _this.initFlag = true;
                }
            },
            //获取全部资源
            getAllEnableResource () {
                var _this = this;
                _this.$get({
                    url: '/api/permission/listAllEnableResource',
                    success: function (res) {

                        _this.tree = res.data;

                    }
                });
            },
            //获取下级角色列表（包含当前角色）
            getNextRoles () {
                var _this = this;
                _this.$get({
                    url: '/api/permission/listNextRoles',
                    success: function (res) {

                        _this.nextRoles = res.data;

                    }
                });
            },
            //获取特定角色的详细信息（权限）
            findRole (roleId, callback) {
                var _this = this;
                _this.$get({
                    url: '/api/permission/findRole/' + roleId,
                    success: function (res) {

                        callback && callback(res);

                    }
                });
            },
            //检测是否可以编辑上级角色
            checkCanChangeParentRole (roleId) {
                var _this = this;
                //因为这个接口的返回结果与规范不一致，所以不能调用自定义全局方法
                _this.$http({
                    method: 'get',
                    url: '/api/permission/isCanChangeParentRole/' + roleId,
                    withoutGlobalCheck: true
                }).then(function (res) {
                    _this.isCanChangeParentRole = res.body;
                });
            },
            //角色对应的帐号列表
            getAccountList () {
                var _this = this;
                _this.$get({
                    url: '/api/permission/listAccountByRoleId/' + _this.form.roleId,
                    success: function (res) {

                        _this.accountList = res.data;

                    }
                });
            },
            //获取操作记录
            getRecordList () {
                var _this = this;
                _this.$get({
                    url: '/api/permission/listRecordByRoleId/' + _this.form.roleId,
                    success: function (res) {

                        _this.recordList = res.data;

                    }
                });
            },
            handleSave () {
                var _this = this;
                //验证
                if (_this.form.roleResourceRelList.filter(r => r.code == 'account-allow' || r.code == 'account-forbid').length == 0) {
                    _this.$msgbox({
                        type:'error',
                        message:'请选择账号创建[ 允许 / 禁止 ]'
                    });
                    return ;
                }

                _this.$refs['form'].validate((valid) => {
                    if (valid) {
                        _this.$confirm('确定保存？', '提示', {
                            customClass: 'cm-alert-box',
                            confirmButtonText: '确定',
                            cancelButtonText: '取消',
                            type: 'warning'
                        }).then(() => {
                            _this.doSave();
                        }).catch(() => {});
                    } else {
                        console.log('error submit!');
                        return false;
                    }
                });
            },
            doSave () {
                var _this = this,
                    url = '';

                if (!_this.isUpdate) {
                    url = '/api/permission/addRole';
                } else {
                    url = '/api/permission/updateRole/' + _this.form.roleId;
                }

                _this.$post({
                    url: url,
                    data: _this.form,
                    success: function (res) {

                        _this.$msgbox({
                            type: 'success',
                            customClass: 'cm-alert-box',
                            message: '保存成功，即将返回列表页',
                            callback: function () {
                                _this.goBack();
                                _this.$store.commit('triggerFlag');
                            }
                        });

                    },
                    error: function (res) {

                        _this.$message.error(res.desc);

                    }
                });
            },
            setCanSelect () {
                var _this = this;

                //如果角色不是【未启用】状态
                if (_this.curRole.status != 'unable') {
                    //把【仓库绑定】相关权限从可以修改列表中移除
                    _this.canSelect = _this.canSelect.filter(function (item) {
                        return (['ckbd', 'ckbd-qbck', 'ckbd-zdck'].indexOf(item.resourceCode) == -1);
                    });
                }
            },
            handleChangeParentRole () {
                var _this = this;

                _this.canSelect = [];

                if (_this.form.pId > 0) {
                    //如果上级角色不是超管

                    _this.findRole(_this.form.pId, function (res) {
                        res.data.roleResourceRelList.forEach(function (item) {
                            item.code = item.resourceCode;
                        });

                        _this.canSelect = res.data.roleResourceRelList;

                        if (!_this.isUpdate) {
                            //新增角色时，切换上级角色后，清空新增角色的所有权限重新编辑
                            _this.form.roleResourceRelList = [];
                        } else {
                            //更新角色时，上级角色变更后...
                            if (_this.curRole.pId != _this.form.pId) {
                                //如果页面展示角色【不是】【未启用】状态，则移除仓库绑定相关权限。否则，清空所有权限重新编辑
                                _this.form.roleResourceRelList = (_this.curRole.status != 'unable') ? _this.curRole.roleResourceRelList.filter(function (item) {
                                        return (['ckbd', 'ckbd-qbck', 'ckbd-zdck'].indexOf(item.resourceCode) > -1);
                                    }) : [];
                            } else {
                                //上级角色变回原来的值
                                _this.form.roleResourceRelList = _this.curRole.roleResourceRelList;
                            }
                            _this.setCanSelect();
                        }
                    });

                }
            },
            clickTreeNodeEvent (e, node, data, store) {
                var _this = this;
                if (e) {
                    //互斥
                    var huChi = [
                        ['account-allow', 'account-forbid'], //账号创建（【允许】和【禁止】禁止两者互斥）
                        ['agent-all-bind', 'agent-appoint-bind']  //仓库（供应商）绑定（【全部绑定】和【指定】两者互斥）
                    ];

                    //找到互斥的删除
                    var huChiDelete = huChi.find(function (item) {
                        return item.indexOf(data.code) > -1;
                    });

                    if (huChiDelete) {
                        var huChiCode = huChiDelete.find(function (code) {
                                return code != data.code;
                            }),
                            index = _this.form.roleResourceRelList.findIndex(function (item) {
                                return item.code == huChiCode;
                            });

                        index > -1 && _this.form.roleResourceRelList.splice(index, 1);
                    }

                    if (data.all == 1 && data.type == 'api') {
                        //如果选中全部，把他所有的兄弟节点够选中
                        node.parent.data.children.forEach(function (item) {
                            var index = _this.form.roleResourceRelList.findIndex(function (resource) {
                                return resource.code == item.code && resource.isAll == item.all;
                            });

                            if (index == -1) {
                                _this.form.roleResourceRelList.push({
                                    resourceId: item.resourceId,
                                    isAll: item.all,
                                    code: item.code
                                });
                            }
                        });

                    } else {
                        var index = _this.form.roleResourceRelList.findIndex(function (resource) {
                            return resource.code == data.code && resource.isAll == ((data.type == 'menu' || data.type == 'hide') ? 0 : data.all);
                        });

                        index == -1 && _this.form.roleResourceRelList.push({
                            resourceId: data.resourceId,
                            isAll: (data.type == 'menu' || data.type == 'hide') ? 0 : data.all,
                            code: data.code
                        });

                        if (data.type != 'menu' &&  data.type != 'hide') {

                            //检测下同级权限（全部除外）是否都已经选中，如果是，则把【全部】也勾选
                            var parentData = node.parent.data,
                                arr = [],
                                count = 0,
                                allItem = null;

                            if (parentData.children) {
                                parentData.children.forEach(function (item) {
                                    if (item.all == 0) {
                                        arr.push(item.resourceId);
                                    } else {
                                        allItem = item;
                                    }
                                });

                                _this.form.roleResourceRelList.forEach(function (resource) {
                                    var index = arr.findIndex(function (resourceId) {
                                        return resource.resourceId == resourceId;
                                    });
                                    index > -1 && count++;
                                });

                                if (allItem && arr.length == count) {
                                    _this.form.roleResourceRelList.push({
                                        resourceId: allItem.resourceId,
                                        isAll: allItem.all,
                                        code: allItem.code
                                    });
                                }
                            }

                        }
                    }

                    //父层的都要勾选
                    var selectParent = function (node) {
                        if (node == null) return;
                        var parent = node.data;
                        if (parent && parent.resourceId) {
                            var index = _this.form.roleResourceRelList.findIndex(function (resource) {
                                return resource.resourceId == parent.resourceId && resource.isAll == 0;
                            });
                            //假如父层未勾选，勾选之
                            index == -1 && _this.form.roleResourceRelList.push({
                                resourceId: parent.resourceId,
                                isAll: 0,
                                code: parent.code
                            });
                            selectParent(node.parent);
                        }
                    };
                    //父层的都要勾选
                    selectParent(node.parent);
                } else {
                    if (data.all == 1 && data.type == 'api') {
                        //如果取消勾选全部 , 则把兄弟级的所有权限清空
                        node.parent.data.children.forEach(function (item) {
                            var index = _this.form.roleResourceRelList.findIndex(function (resource) {
                                return resource.resourceId == item.resourceId && resource.isAll == item.all;
                            });
                            index > -1 && _this.form.roleResourceRelList.splice(index, 1);
                        });
                    } else if (data.type == 'menu' || data.type == 'hide') {
                        //如果取消勾选某一菜单
                        var deleteChildren = function (data) {
                            var index = _this.form.roleResourceRelList.findIndex(function (resource) {
                                return resource.resourceId == data.resourceId && resource.isAll == ((data.type == 'menu' || data.type == 'hide') ? 0 : data.all);
                            });
                            index > -1 && _this.form.roleResourceRelList.splice(index, 1);
                            data.children && data.children.forEach(function (item) {
                                deleteChildren(item);
                            });
                        };
                        deleteChildren(data);
                    } else if (data.type == 'api') {
                        var parent = node.parent ? node.parent.data : null,
                            allItem = null,
                            index = _this.form.roleResourceRelList.findIndex(function (resource) {
                                return resource.resourceId == data.resourceId && resource.isAll == data.all;
                            });

                        index > -1 && _this.form.roleResourceRelList.splice(index, 1);

                        if (parent && parent.children) {
                            allItem = parent.children.find(function (item) {
                                return item.all == 1;
                            });

                            if (allItem) {

                                var index = _this.form.roleResourceRelList.findIndex(function (resource) {
                                    return resource.resourceId == allItem.resourceId && resource.isAll == 1;
                                });
                                index > -1 && _this.form.roleResourceRelList.splice(index, 1);

                            }

                        }
                    }
                }
            },
            renderContent (h, opts) {
                var _this = this,
                    node = opts.node,
                    data = opts.data,
                    store = opts.store,
                    isInCanSelect = false,
                    checked;

                if (!_this.isAdminRole) {
                    //是否可选
                    if (_this.canEdit) {
                        var index = _this.canSelect.findIndex(function (item) {
                            return item.resourceId == data.resourceId && item.isAll == ((data.type == 'menu' || data.type == 'hide') ? 0 : data.all);
                        });
                        isInCanSelect = index > -1 ? true : false;
                    }

                    //是否选中
                    var index = _this.form.roleResourceRelList.findIndex(function (resource) {
                        return resource.resourceId == node.data.resourceId && resource.isAll == ((data.type == 'menu' || data.type == 'hide') ? 0 : data.all);
                    });

                    checked = index > -1 ? true : false;
                } else {
                    checked = true;
                }

                if (data.code == 'account-create' || data.code == 'account-allow' || data.code == 'account-forbid') {

                    var findInCanSelect = _this.canSelect.some(function (item) {
                        return item.resourceCode == 'account-allow';
                    });

                    if ((findInCanSelect || data.code == 'account-forbid') && (_this.form.status == 'unable' || _this.isCanChangeParentRole)) {
                        isInCanSelect = true;
                    } else if (_this.form.status != 'unable') {
                        isInCanSelect = false;
                    }

                } else if (data.code == 'agent-bind' || data.code == 'agent-all-bind' || data.code == 'agent-appoint-bind') {

                    var findInCanSelect = _this.canSelect.some(function (item) {
                        return item.resourceCode == 'agent-all-bind';
                    });

                    if ((findInCanSelect || data.code == 'agent-appoint-bind') && (_this.form.status == 'unable' || _this.isCanChangeParentRole)) {
                        isInCanSelect = true;
                    } else if (_this.form.status != 'unable') {
                        isInCanSelect = false;
                    }

                } else if (!_this.isUpdate && data.code == 'ckbd-zdck') {

                    var index = _this.canSelect.findIndex(function (item) {
                        return (item.resourceCode == 'ckbd-zdck' && item.isAll == 0) || (item.resourceCode == 'ckbd-qbck' && item.isAll == 0);
                    });
                    isInCanSelect = index > -1 ? true : false;

                } else if (!_this.isUpdate && data.code == 'ckbd-qbck') {
                    //创建角色时，只有上级角色为超级管理员时才允许选择仓库绑定为全部，其他均只能选指定
                    if (_this.form.pId == 1) {
                        //上级角色为超级管理员
                        isInCanSelect = true;
                        checked = false;
                    } else {
                        isInCanSelect = false;
                        checked = false;
                    }
                }

                return h('el-checkbox', {
                    key: data.code + checked + isInCanSelect,
                    attrs: {
                        checked: checked,
                        disabled: !isInCanSelect
                    },
                    on: {
                        change: function (e) {
                            _this.clickTreeNodeEvent(e, node, data, store);
                        }
                    }
                }, [node.label]);
            },
            goBack () {
                this.$emit('pageChange', 'list');
            }
        },
        created: function () {
            var _this = this;
            _this.form.roleId = _this.roleId;
            _this.init();
        },
        filters: {
            getParentRoleName: function (pId, parentRoleList) {
                var target = parentRoleList.filter(function (role) {
                    return role.roleId == pId;
                });
                return target.length ? target[0].name : '无';
            },
            statusFilter: function (val) {
                switch (val) {
                    case 'enable':
                        return '启用';
                    case 'unable':
                        return '未启用';
                    case 'stop':
                        return '停用';
                    default:
                        return '未启用';
                }
            },
            roleTypeFilter: function (val) {
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
            }
        }
    };
</script>
