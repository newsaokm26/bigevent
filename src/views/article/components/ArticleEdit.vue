<script setup>
import { ref } from 'vue'
import ChannelSelect from './ChannelSelect.vue'
import { Plus } from '@element-plus/icons-vue'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import {
  artPublishService,
  artGetDetailService,
  artEditService
} from '@/api/article.js'
import { baseURL } from '@/utils/request.js'
import axios from 'axios'
// 控制抽屜顯示隱藏
const visibleDrawer = ref(false)

// 默認數據
const defaultForm = {
  title: '', // 標題
  cate_id: '', // 分類id
  cover_img: '', // 封面圖片 file對象
  content: '', // string 內容
  state: '' // 狀態
}
// 準備數據
const formModel = ref({ ...defaultForm })

// 圖片上傳相關邏輯
const imgUrl = ref('')
const onSelectFile = (uploadFile) => {
  // 透過前端 api 語法
  // console.log(uploadFile)
  imgUrl.value = URL.createObjectURL(uploadFile.raw) // 預覽圖片
  // 立刻將圖片對象，存入 formModel.value.cover_img 將來用於提交
  formModel.value.cover_img = uploadFile.raw
}

// 提交
const emit = defineEmits(['success'])
const onPublish = async (state) => {
  // 將已發布或還是草稿狀態，存入 formModel
  formModel.value.state = state

  // 注意: 當前接口，需要的是 formData 對象
  // 將js普通對象 => 轉換成 => formData對象
  const fd = new FormData()
  for (let key in formModel.value) {
    fd.append(key, formModel.value[key])
  }

  // 發請求
  if (formModel.value.id) {
    // 編輯操作
    await artEditService(fd)
    ElMessage.success('修改成功')
    visibleDrawer.value = false
    emit('success', 'edit')
  } else {
    // 添加操作
    await artPublishService(fd)
    ElMessage.success('添加成功')
    visibleDrawer.value = false
    // 通知父組件，添加成功了
    emit('success', 'add')
  }
}

// 組件對外暴露一個方法 open，基於 open 傳來的參數，區分是添加還是編輯
// open({}) => 表單無需渲染，說明是添加
// open({ id, ... }) => 表單需渲染，說明是編輯
// open調用後，可以打開抽屜
const editorRef = ref()
const open = async (row) => {
  visibleDrawer.value = true // 顯示抽屜

  if (row.id) {
    // console.log('編輯回顯') 需要基於 row.id 發送請求，獲取編輯對應的詳情數據，進行回顯
    const res = await artGetDetailService(row.id)
    formModel.value = res.data.data
    // 圖片需要單獨處理回顯
    imgUrl.value = baseURL + formModel.value.cover_img
    // 注意: 提交給後台，需要數據格式，是file對象格式
    // 需要將圖片網路地址 => 轉換成 file 對象，存儲起來，將來便於提交
    const file = await imageUrlToFile(imgUrl.value, formModel.value.cover_img)
    formModel.value.cover_img = file
  } else {
    formModel.value = { ...defaultForm } // 基於默認的數據，重製form數據
    // 這裡重置了表單的數據，但是圖片上傳img地址，富文本編輯器內容 => 需要手動重置
    imgUrl.value = ''
    editorRef.value.setHTML('')
    console.log('添加')
  }
}

// 将网络图片地址转换为File对象
async function imageUrlToFile(url, fileName) {
  try {
    // 第一步：使用axios获取网络图片数据
    const response = await axios.get(url, { responseType: 'arraybuffer' })
    const imageData = response.data

    // 第二步：将图片数据转换为Blob对象
    const blob = new Blob([imageData], {
      type: response.headers['content-type']
    })

    // 第三步：创建一个新的File对象
    const file = new File([blob], fileName, { type: blob.type })

    return file
  } catch (error) {
    console.error('将图片转换为File对象时发生错误:', error)
    throw error
  }
}

defineExpose({
  open
})
</script>
<template>
  <el-drawer
    v-model="visibleDrawer"
    :title="formModel.id ? '编辑文章' : '添加文章'"
    direction="rtl"
    size="50%"
  >
    <!-- 发表文章表单 -->
    <el-form :model="formModel" ref="formRef" label-width="100px">
      <el-form-item label="文章标题" prop="title">
        <el-input v-model="formModel.title" placeholder="请输入标题"></el-input>
      </el-form-item>
      <el-form-item label="文章分类" prop="cate_id">
        <!-- 封裝成組件後 上面東西(width="100%") 都變成屬性 要生效得配邏輯-->
        <channel-select
          v-model="formModel.cate_id"
          width="100%"
        ></channel-select>
      </el-form-item>
      <el-form-item label="文章封面" prop="cover_img">
        <!-- 此處需要關閉 element-plus 的自動上傳，不需要配置 action 等參數
              只需要做前端的本地預覽圖片即可，無需在提交前上傳圖標
              語法: URL.createObjectURL(...) 創建本地預覽的地址，來預覽
        -->
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :auto-upload="false"
          :on-change="onSelectFile"
        >
          <img v-if="imgUrl" :src="imgUrl" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
      <el-form-item label="文章内容" prop="content">
        <div class="editor">
          <quill-editor
            ref="editorRef"
            v-model:content="formModel.content"
            content-type="html"
            theme="snow"
          ></quill-editor>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button @click="onPublish('已发布')" type="primary">发布</el-button>
        <el-button @click="onPublish('草稿')" type="info">草稿</el-button>
      </el-form-item>
    </el-form>
  </el-drawer>
</template>

<style lang="scss" scoped>
.avatar-uploader {
  :deep() {
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }
    .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }
    .el-upload:hover {
      border-color: var(--el-color-primary);
    }
    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }
  }
}

.editor {
  width: 100%;
  :deep(.ql-editor) {
    min-height: 200px;
  }
}
</style>
