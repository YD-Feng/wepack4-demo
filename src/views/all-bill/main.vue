<template>
    <div>
        <list
            v-show="pageType == 'list'"
            @pageChange="pageChange">
        </list>

        <detail
            v-if="pageType == 'detail'"
            :curId="curId"
            :orderType="orderType"
            @pageChange="pageChange">
        </detail>
    </div>
</template>

<script>
    import list from './list.vue';
    import detail from './detail.vue';

    export default {
        components: {
            list,
            detail
        },
        data () {
            return {
                pageType: 'list', //list-列表  detail-单据详情
                curId: '',
                orderType: ''
            }
        },
        watch: {
            pageType: {
                handler (val) {
                    let breadcrumb = {
                        list: ['应付管理', '全部单据'],
                        detail: ['应付管理', '单据详情']
                    };
                    this.$store.commit('setBreadcrumbList', breadcrumb[val]);
                },
                immediate: true
            }
        },
        methods: {
            pageChange (pageType, id, orderType) {
                this.pageType = pageType;
                this.curId = id;
                this.orderType = orderType;
            }
        }
    }
</script>
