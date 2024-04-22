<script setup>
import { ref } from 'vue'
import { artEditChannelService, artAddChannelService } from '@/api/article.js'
const dialogVisible = ref(false)
const formRef = ref()
const formModel = ref({
  cate_name: '',
  cate_alias: ''
})

const rules = {
  cate_name: [
    { required: true, message: '請輸入分類名稱', trigger: 'blur' },
    {
      pattern: /^\S{1,10}$/,
      message: '分類名必須為1-10非空字符',
      trigger: 'blur'
    }
  ],
  cate_alias: [
    { required: true, message: '請輸入分類別名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9]{1,15}$/,
      message: '分類名必須為1-15非空字母或數字',
      trigger: 'blur'
    }
  ]
}

// 子傳父，編輯完通知老爹更新
const emit = defineEmits(['success'])
const onSubmit = async () => {
  await formRef.value.validate()
  const isEdit = formModel.value.id
  if (isEdit) {
    await artEditChannelService(formModel.value)
    ElMessage.success('編輯成功')
  } else {
    await artAddChannelService(formModel.value)
    ElMessage.success('添加')
  }
  dialogVisible.value = false
  emit('success')
}

// 組件對外暴露一個方法 open，基於 open 傳來的參數，區分是添加還是編輯
// open({}) => 表單無需渲染，說明是添加
// open({ id, cate_name, ... }) => 表單需渲染，說明是編輯
// open調用後，可以打開彈窗

const open = (row) => {
  dialogVisible.value = true
  formModel.value = { ...row } // 添加 -> 重置了表單內容， 編輯 -> 存儲了需要回顯得數據
}

// 向外暴露方法
defineExpose({
  open
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :title="formModel.id ? '编辑分类' : '添加分类'"
    width="30%"
  >
    <el-form
      ref="formRef"
      :model="formModel"
      :rules="rules"
      label-width="100px"
      style="padding-right: 30px"
    >
      <el-form-item label="分類名稱" prop="cate_name">
        <el-input
          v-model="formModel.cate_name"
          placeholder="請輸入分類名稱"
        ></el-input>
      </el-form-item>
      <el-form-item label="分類別名" prop="cate_alias">
        <el-input
          v-model="formModel.cate_alias"
          placeholder="請輸入分類別名"
        ></el-input>
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="onSubmit"> 確認 </el-button>
      </span>
    </template>
  </el-dialog>
</template>
