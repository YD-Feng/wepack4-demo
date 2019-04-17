<template>
    <div>
        <div ref="wrap" class="audit-purchase-img-wrap">
            <div class="inner">
                <img ref="img" :src="dialogImageUrl">
            </div>
        </div>
        <div class="text-center mt20px">
            <el-button type="primary" icon="el-icon-plus" @click="updateImgWidth('add')"></el-button>
            <el-button type="success" icon="el-icon-minus" @click="updateImgWidth('del')"></el-button>
        </div>
    </div>
</template>

<script>
    module.exports = {
        data: function () {
            return {
                dialogImageUrl: '',
                imgWidth: 100
            }
        },
        methods: {
            updateImgWidth (type) {
                var _this = this,
                    img = _this.$refs.img;

                if (type == 'add') {
                    if (_this.imgWidth < 300) {
                        _this.imgWidth = _this.imgWidth + 20;
                        img.width = img.width * 1.2;
                    }
                } else {
                    if (_this.imgWidth > 100) {
                        _this.imgWidth = _this.imgWidth - 20;
                        img.width = Math.floor(img.width / 1.2);
                    }
                }
            },
        },
        created () {
            var _this = this;
            _this.dialogImageUrl = _this.$route.query.imgUrl;
        },
        mounted: function () {
            var _this = this,
                img = _this.$refs.img,
                wrap = _this.$refs.wrap;

            wrap.style.height = (window.innerHeight - 100) + 'px';
            wrap.style.lineHeight = (window.innerHeight - 100) + 'px';

            img.onload = function () {
                console.info(234);
                img.width = img.width > 1000 ? 1000 : img.width;
            };
        }
    };
</script>

<style>
    .purchase-img-view-dialog{
        width: 1200px;
    }
    .audit-purchase-img-wrap{
        overflow: auto;
        text-align: center;
        height: 670px;
        line-height: 670px;
    }
    .audit-purchase-img-wrap .inner{
        width: 100%;
        display: inline-block;
        text-align: center;
    }
</style>
