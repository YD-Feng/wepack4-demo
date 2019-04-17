module.exports = {
    state: {
        rightList: [], //登录者拥有的权限列表
    },
    mutations: {
        setRights: function (state, rights) {
            state.rightList = rights;
        }
    }
};
