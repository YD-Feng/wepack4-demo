<template>
    <div>
        <!--页头-->
        <div class="w-header oh">
            <img class="logo" src="../imgs/logo.png"/>
            <div class="nav">
                &nbsp;&nbsp;
                <span v-if="!user.isLogin" class="login-link" @click="toLoginPage">登录</span>
                <el-dropdown v-else trigger="click" class="account-name" @command="handleCommand">
                <span>
                  <span class="text">{{user.account.name}}</span>
                  <i class="icon el-icon-caret-bottom el-icon--right"></i>
                </span>
                    <el-dropdown-menu slot="dropdown" class="text-center">
                        <el-dropdown-item command="1"><span class="dropdown-item">我的账号</span></el-dropdown-item>
                        <el-dropdown-item command="2"><span class="dropdown-item">返回导航</span></el-dropdown-item>
                        <el-dropdown-item command="3"><span class="dropdown-item">退出</span></el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </div>
        </div>

        <div class="oh">
            <div class="menu-wrap" v-auto-height data-del-height="48">

                <!--菜单栏-->
                <el-menu class="sidebar-menu" :default-active="defaultActive" router>

                    <template v-for="(item, index) in menuList">

                        <el-submenu v-if="item.children && item.children.length > 0" :index="index + ''">
                            <template slot="title">{{item.name}}</template>

                            <template v-for="(item2, index2) in item.children"
                                      v-if="item.children && item.children.length > 0">
                                <el-menu-item :index="item2.menuRouterUrl" style="margin-left: -5px;">
                                    <span>{{item2.name}}</span>
                                </el-menu-item>
                            </template>
                        </el-submenu>

                        <el-menu-item v-if="!item.children || item.children.length == 0" :index="item.menuRouterUrl">
                            {{item.name}}
                        </el-menu-item>
                    </template>

                </el-menu>
            </div>

            <div class="content-wrap" id="content-wrap" v-auto-height data-del-height="48">
                <el-breadcrumb style="line-height: 40px;" v-if="breadcrumbList && breadcrumbList.length < 3" separator=">">
                    <el-breadcrumb-item> 首页 </el-breadcrumb-item>
                    <el-breadcrumb-item v-for="item in breadcrumbList" :key="item">{{item}}</el-breadcrumb-item>
                </el-breadcrumb>

                <div v-auto-height data-del-height="110">
                    <router-view></router-view>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import {loginUrl, accountHost} from 'utils';

    export default {
        data () {
            return {
                defaultActive: '',
                menuList: [] //登录者拥有的菜单列表
            }
        },
        computed: {
            user: function () {
                return this.$store.state.user;
            },
            breadcrumbList () {
                return this.$store.state.flags.breadcrumbList;
            }
        },
        watch: {
            '$route': function () {
                this.defaultActive = this.$router.currentRoute.path;
            }
        },
        methods: {
            init () {
                var _this = this;
                _this.getUserInfo();
                _this.getRights();
                _this.getMenu();

                //_this.getAgentCodeList();
            },

            getUserInfo () {
                var _this = this;

                _this.$get({
                    url: '/api/permission/getLoginUser',
                    success: function (res) {
                        _this.$store.commit('setUserInfo', res.data);
                    }
                });
            },

            getRights () {
                var _this = this;

                _this.$get({
                    url: '/api/permission/listRights',
                    success: function (res) {
                        _this.$store.commit('setRights', res.data);
                    }
                });
            },

            getMenu () {
                var _this = this;

                _this.$get({
                    url: '/api/permission/getMenu',
                    success: function (res) {
                        _this.menuList = res.data;
                        _this.$nextTick(function () {
                            _this.defaultActive = _this.$router.currentRoute.path;
                        });
                    }
                });
            },

            toLoginPage () {
                location.href = loginUrl + '?ReturnURL=' + location.href;
            },

            logout () {
                var _this = this;

                _this.$get({
                    url: '/api/user/logout',
                    success: function (res) {
                        location.href = loginUrl + '?ReturnURL=' + location.href;
                    }
                });
            },

            handleCommand (command) {
                if (command == 1) {
                    location.href = accountHost + '/account/my';
                } else if (command == 2) {
                    location.href = accountHost + '/choice';
                } else if (command == 3) {
                    this.logout();
                }
            },

            // 获取分站列表
            getAgentCodeList () {
                var _this = this;
                _this.$post({
                    url: '/api/agent/list',
                    success (res) {
                        _this.$store.commit('setAgentCodeList', res.data);
                    }
                });
            }
        },
        created () {
            this.init();
        }
    };
</script>

<style>
    .menu-wrap{
        background-color: #333333;
        overflow-x: hidden;
        overflow-y: auto;
        float: left;
        width: 180px;
    }
    .menu-wrap .el-submenu .el-submenu__title:hover, .menu-wrap .el-submenu .el-menu-item:hover{
        background-color: #FF9640;
        color: #ffffff;
    }
    .menu-wrap .el-submenu .el-menu-item:focus {
        color: #FF9640;
        background-color: transparent;
    }
    .content-wrap{
        margin-left: 200px;
        padding: 8px;
        overflow-x: hidden;
        overflow-y: scroll;
    }

    .w-header{
        width: 100%;
        height: 48px;
        line-height: 48px;
        background-color: #FF9640;
        padding: 0 8px;
        color: #fafafa;
    }

    .w-header .logo{
        padding-top: 13px;
        vertical-align: inherit;
    }

    .w-header .nav{
        font-size: 14px;
        float: right;
    }

    .w-header .login-link{
        color: #F9FAFC;
        vertical-align: middle;
        line-height: 30px;
    }

    .w-header .account-name{
        color: #F9FAFC;
        cursor: pointer;
    }

    .w-header .account-name .icon{
        position: relative;
        top: 1px;
    }

    .item-dot .el-badge__content.is-dot{
        right: 1px;
        top: 13px;
    }
</style>
