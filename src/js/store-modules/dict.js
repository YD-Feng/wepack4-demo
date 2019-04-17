module.exports = {
    state: {
        //通用
        common: {
            status: {
                enable: '启用',
                disable: '停用'
            }
        },
        paymentManage: {
            timeType: {
                createTime: '提交时间',
                auditTime: '审核时间',
                completeTime: '完成时间',
                cancelTime: '取消时间'
            },
            status: {
                '1': '已提交',
                '2': '已审核',
                '3': '部分结算',
                '4': '已完成',
                '5': '已取消'
            },
            orderType: {
                '1': '采购单',
                '2': '退供单'
            },
            applyStatus: {
                '1': '已提交',
                '2': '已审核',
                '3': '已复核',
                '4': '待重核',
                '5': '已核准',
                '6': '已完成',
                '7': '已取消'
            }
        },
        allBill: {
            timeType: {
                submitTime: '提交时间',
                auditTime: '审核时间',
                inoutTime: '出入库时间',
                reviewTime: '复核时间',
                approveTime: '核准时间',
                duePaymentDate: '账期到期时间',
                doneTime: '完成时间',
                cancelTime: '取消时间'
            },
            orderType: {
                '1': '采购单',
                '2': '退供单'
            },
            applyStatus: {
                '1': '已提交',
                '2': '已审核',
                '3': '已复核',
                '4': '待重核',
                '5': '已核准',
                '6': '已完成',
                '7': '已取消'
            },
            inoutStatus: {
                '1': '未创建',
                '2': '未确认',
                '3': '已确认',
                '4': '已到货',
                '5': '部分入库',
                '6': '完全入库',
                '7': '已出库',
                '8': '已取消',
            },
            itemType: {
                ZP: '正品',
                CP: '残品'
            },
            payChannel: {
                cash: '现金',
                weixin: '微信',
                alipay: '支付宝',
                bankcard: '银行卡',
                other: '其他'
            },
            salesType: {
                whole: '整件',
                piece: '拆零'
            }
        }
    },
    mutations: {
        setDict: function (state, mod, key, value) {
            if (!state[mod]) {
                state[mod] = {};
            }
            state[mod][key] = value;
        }
    }
};
