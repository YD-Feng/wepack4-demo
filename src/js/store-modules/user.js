module.exports = {
    state: {
        agentCode: '',
        isLogin: false,
        loginName: 'zskx',
        operId: 0,
        operType: '',
        mobile: '',
        employeeId: '',
        isSuperAccount: 0,
        account: {
            name: '',
            id: '',
            level: 0
        }
    },

    mutations: {
        setUserInfo: function (state, userInfo) {
            Object.assign(state, userInfo);
            state.isLogin = userInfo.operId == undefined ? false : true;
        }
    }
};
