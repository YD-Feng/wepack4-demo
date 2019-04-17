module.exports = {
    state: {
        agentList: []
    },
    mutations: {
        setAgentList: function (state, agentList) {
            state.agentList = agentList;
        }
    }
};
