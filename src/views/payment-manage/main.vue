<template>
    <div>
        <list
            v-show="pageType == 'list'"
            @pageChange="pageChange">
        </list>

        <detail
            v-if="pageType == 'detail'"
            :curId="curId"
            @pageChange="pageChange">
        </detail>

        <operation
            v-if="pageType == 'add' || pageType == 'audit' || pageType == 'confirm'"
            :pageType="pageType"
            :curId="curId"
            @pageChange="pageChange">
        </operation>

        <bill-detail
            v-if="pageType == 'billDetail'"
            :curId="curId"
            :orderType="orderType"
            :from="from"
            @pageChange="pageChange">
        </bill-detail>
    </div>
</template>

<script>
    import list from './list.vue';
    import detail from './detail.vue';
    import operation from './operation.vue';
    import billDetail from '../all-bill/detail.vue';

    export default {
        components: {
            list,
            detail,
            operation,
            billDetail
        },
        data () {
            return {
                pageType: 'list', //list-列表  detail-申请详情  add-创建申请  audit-审核申请  confirm-确认结算  billDetail-单据详情
                curId: '',
                orderType: '',
                from: ''
            }
        },
        watch: {
            pageType: {
                handler (val) {
                    let breadcrumb = {
                        list: ['应付管理', '付款管理'],
                        detail: ['应付管理', '申请详情'],
                        add: ['应付管理', '创建申请'],
                        audit: ['应付管理', '审核申请'],
                        confirm: ['应付管理', '确认结算'],
                        billDetail: ['应付管理', '单据详情']
                    };
                    this.$store.commit('setBreadcrumbList', breadcrumb[val]);
                },
                immediate: true
            }
        },
        methods: {
            pageChange (pageType, id, orderType) {
                if (pageType == 'billDetail') {
                    this.from = `${this.pageType}@${this.curId}`
                }
                this.pageType = pageType;
                this.curId = id;
                this.orderType = orderType;
            }
        }
    }
</script>
