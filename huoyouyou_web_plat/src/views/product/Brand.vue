<template>
    <section>
        <!--工具条-->
        <el-col :span="24" class="toolbar" style="padding-bottom: 0px;">
            <el-form :inline="true" :model="filters">
                <el-form-item>
                    <el-input v-model="filters.keyword" placeholder="关键字"></el-input>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" v-on:click="getBrands">查询</el-button>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleAdd">新增</el-button>
                </el-form-item>
            </el-form>
        </el-col>

        <!--列表-->
        <el-table :data="brands" highlight-current-row v-loading="listLoading" @selection-change="selsChange"
                  style="width: 100%;">
            <el-table-column type="selection" width="55">
            </el-table-column>
            <el-table-column type="index" width="60">
            </el-table-column>
            <el-table-column prop="name" label="名称" width="180" sortable>
            </el-table-column>
            <el-table-column prop="englishName" label="英文名" width="200" sortable>
            </el-table-column>
            <!--有点屌-->
            <el-table-column prop="productType.name" label="商品类型" width="180" sortable>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="250" sortable>
            </el-table-column>
            <el-table-column label="操作" width="150">
                <template scope="scope">
                    <el-button size="small" @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
                    <el-button type="danger" size="small" @click="handleDel(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>

        <!--工具条-->
        <el-col :span="24" class="toolbar">
            <el-button type="danger" @click="batchRemove" :disabled="this.sels.length===0">批量删除</el-button>
            <el-pagination layout="prev, pager, next" @current-change="handleCurrentChange" :page-size="10"
                           :total="total" style="float:right;">
            </el-pagination>
        </el-col>

        <!--新增界面-->
        <el-dialog title="新增" v-model="formVisible" :close-on-click-modal="false">
            <el-form :model="form" label-width="80px" :rules="formRules" ref="form">
                <el-form-item label="名称" prop="name">
                    <el-input v-model="form.name" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="英文名" prop="englishName">
                    <el-input v-model="form.englishName" auto-complete="off"></el-input>
                </el-form-item>
                <el-form-item label="logo" prop="logo">
                    <el-upload
                            class="upload-demo"
                            action="http://127.0.0.1:9527/services/common/upload"
                            :on-preview="handlePreview"
                            :on-remove="handleRemove"
                            :on-success="handSuccess"
                            :file-list="fileList2"
                            list-type="picture">
                        <el-button size="small" type="primary">点击上传</el-button>
                        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
                    </el-upload>
                </el-form-item>
                <el-form-item label="sortIndex" prop="sortIndex">
                    <el-input v-model="form.sortIndex" auto-complete="off"></el-input>
                </el-form-item>

                <el-form-item label="商品类型" prop="productTypeId">
                    <!--<el-input v-model="form.productTypeId" auto-complete="off"></el-input>-->
                    <el-cascader
                            placeholder="试试搜索：指南"
                            :options="options"
                            :props="BrandDefaultProps"
                            @change="brandChange"
                            change-on-select
                    ></el-cascader>
                </el-form-item>
                <el-form-item label="描述">
                    <el-input type="textarea" v-model="form.description"></el-input>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button @click.native="formVisible = false">取消</el-button>
                <el-button type="primary" @click.native="addSubmit" :loading="addLoading">提交</el-button>
            </div>
        </el-dialog>
    </section>
</template>

<script>
    import util from '../../common/js/util'

    export default {
        data() { //数据
            return {
                options: [],
                fileList2: [],
                filters: {
                    keyword: ''
                },
                brands: [],
                total: 0,
                page: 1,
                listLoading: false,
                sels: [],//列表选中列
                formVisible: false,//新增界面是否显示
                addLoading: false,
                formRules: {
                    name: [
                        {required: true, message: '请输入姓名', trigger: 'blur'}
                    ]
                },
                //新增界面数据
                form: {
                    name: '',
                    englishName: '',
                    productTypeId: '',
                    description: '',
                    sortIndex: '',
                    logo: ''
                },
                BrandDefaultProps: {
                    children: 'children',
                    label: 'name',
                    value: "id"
                }
            }
        },
        methods: { //方法
            /*级联选择器如何让form表单提交值商品类型*/
            brandChange(value){
               // console.debug(value);
                this.form.productTypeId =value[value.length-1];
            },
            removeArr(list) {
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    if (item['children'].length > 0) {
                        this.removeArr(item.children)
                    } else {
                        delete item.children;
                    }

                }
            },
            /*文件图片上传 -文件列表移除文件时的钩子*/
            handleRemove(file, fileList) {
                console.log(file, fileList);
                let filePath = file.response ? file.response.resultObj : this.$filePathImg;
                //想办法获取图片的路径
                //console.debug(this.fileList2.length);
                //var filePath = this.fileList2[0].url;
                //console.debug();
                this.form.logo = '';
                this.$http.delete("/common/filePath?filePath=" + filePath)
                    .then(res => {
                        console.debug(res)
                        if (res.data.success) {
                            this.$message({
                                message: "删除成功",
                                type: "success"
                            });
                        } else {
                            this.$message({
                                message: "删除失败",
                                type: "error"
                            });
                        }
                    })
            },
            /*文件图片上传 -成功时的钩子函数*/
            handSuccess(response, file, fileList) {
                // console.debug(response,file,fileList);
                this.form.logo = file.response.resultObj;
            },
            /*点击文件列表中已上传的文件时的钩子*/
            handlePreview(file) {
                console.log("handlePreview:" + file);
            },

            handleCurrentChange(val) {
                this.page = val;
                this.getBrands();
            },
            //获取用户列表
            getBrands() {
                let para = {
                    page: this.page,
                    keyword: this.filters.keyword
                };
                this.listLoading = true;

                this.$http.post("/product/brand/json", para)
                    .then((res) => {
                        //console.log(this);
                        this.total = res.data.total;
                        this.brands = res.data.rows;
                        this.listLoading = false;
                    });
            },

            //获取商品类型
            getPruductType() {
                this.$http.get("/product/productType/treeData")
                    .then(res => {
                        // console.log(this);
                        let arr = res.data;
                       this.removeArr(arr);
                        this.options = arr;
                        console.debug(res.data.length);
                    });
            },
            //删除
            handleDel: function (index, row) {
                this.$confirm('确认删除该记录吗?', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    //let para = { id: row.id };
                    this.$http.delete("/product/brand/" + row.id).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getBrands();
                    });
                }).catch(() => {

                });
            },
            //显示编辑界面
            handleEdit: function (index, row) {
                this.formVisible = true;
                //回显
                this.form = Object.assign({}, row);
                this.fileList2.splice(0, this.fileList2.length);//清空数组
                console.debug(this.fileList2.length);
                this.$filePathImg = row.logo;
                if (row.logo == '') {
                    return;
                }
                this.fileList2.push({"url": "http://192.168.43.138" + row.logo})
            },
            //显示新增界面
            handleAdd: function () {
                this.formVisible = true;
                this.fileList2.splice(0, this.fileList2.length);
                this.form = {
                    name: '',
                    englishName: '',
                    productTypeId: -1,
                    description: '',
                    sortIndex: '',
                    logo: ''
                };
            },

            //新增
            addSubmit: function () {
                this.$refs.form.validate((valid) => {
                    if (valid) {
                        this.$confirm('确认提交吗？', '提示', {}).then(() => {
                            this.addLoading = true;
                            //NProgress.start();
                            let para = Object.assign({}, this.form);
                            console.debug(para);
                            //para.birth = (!para.birth || para.birth == '') ? '' : util.formatDate.format(new Date(para.birth), 'yyyy-MM-dd');
                            this.$http.post("/product/brand/save", para).then((res) => {
                                this.addLoading = false;
                                //NProgress.done();
                                this.$message({
                                    message: '提交成功',
                                    type: 'success'
                                });
                                this.$refs['form'].resetFields();
                                this.formVisible = false;
                                this.getBrands();
                            });
                        });
                    }
                });
            },
            selsChange: function (sels) {
                this.sels = sels;
            },
            //批量删除
            batchRemove: function () {
                var ids = this.sels.map(item => item.id).toString();
                this.$confirm('确认删除选中记录吗？', '提示', {
                    type: 'warning'
                }).then(() => {
                    this.listLoading = true;
                    //NProgress.start();
                    let para = {ids: ids};
                    this.$http.delete("/product/brand/ids/" + ids).then((res) => {
                        this.listLoading = false;
                        //NProgress.done();
                        this.$message({
                            message: '删除成功',
                            type: 'success'
                        });
                        this.getBrands();
                    });
                }).catch(() => {

                });
            }
        }, // $(function()) 加载完毕后执行
        mounted() {
            this.getBrands();
            this.getPruductType();
        }
    }

</script>

<style scoped>

</style>