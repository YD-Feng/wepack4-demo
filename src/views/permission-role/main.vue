<template>
    <div>
        <list v-show="pageType == 'list'" @pageChange="pageChange"></list>
        <detail v-if="pageType != 'list'" :role-id="curId" :page-type="pageType" @pageChange="pageChange"></detail>
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
                pageType: 'list', //list-列表页，add-新增，edit-编辑，look-查看
                curId: ''
            }
        },
        methods: {
            pageChange (type, id) {
                this.pageType = type;
                this.curId = id;
            }
        },
        created () {
            this.$store.commit('setBreadcrumbList', ['权限管理', '角色模板']);
        }
    };
</script>
