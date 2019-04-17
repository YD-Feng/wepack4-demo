module.exports = {
    state: {
        refreshListFlag: true,
        breadcrumbList: []
    },
    mutations: {
        triggerFlag: function (state) {
            state.refreshListFlag = !state.refreshListFlag;
        },
        setBreadcrumbList (state, breadcrumbList) {
            state.breadcrumbList = breadcrumbList;
        },
    }
};
