<script setup>
import { ref } from 'vue'
import { Edit, Delete } from '@element-plus/icons-vue'
import ChannelSelect from './components/ChannelSelect.vue'
import ArticleEdit from './components/ArticleEdit.vue'
import { artGetListService } from '@/api/article.js'
import { formatTime } from '@/utils/format.js'
const articleList = ref([]) // 文章列表
const total = ref(0) // 總條數
const loading = ref(false) // loading狀態

// 定義請求參數對象
const params = ref({
  pagenum: 1, // 當前頁
  pagesize: 5, // 當前生效的每頁條數
  cate_id: '',
  state: ''
})

// 基於 params 參數，獲取文章列表
const getArticleList = async () => {
  loading.value = true

  const res = await artGetListService(params.value)
  articleList.value = res.data.data
  total.value = res.data.total

  loading.value = false
}
getArticleList()

// 處理分頁邏輯
const onSizeChange = (size) => {
  // console.log('當前每頁條數', size)
  // 只要是每頁條數變化了，那麼原本正在訪問的當前頁意義不大了，數據大概率已經不在原來那一頁了
  // 重新從第一頁渲染即可
  params.value.pagenum = 1
  params.value.pagesize = size
  // 基於最新的當前頁 和 每頁條數，渲染數據
  getArticleList()
}

const onCurrentChange = (page) => {
  // console.log('頁碼變化了', page)
  // 更新當前頁
  params.value.pagenum = page
  // 基於最新的當前頁，渲染數據
  getArticleList()
}

// 搜索邏輯 => 按照最新條件，重新檢索，從第一頁開始展示
const onSearch = () => {
  params.value.pagenum = 1 // 重置頁碼
  getArticleList()
}

// 重置邏輯
const onReset = () => {
  params.value.pagenum = 1 // 重置頁碼
  params.value.cate_id = ''
  params.value.state = ''
  getArticleList()
}

const articleEditRef = ref()
// 新增邏輯
const onAddArticle = () => {
  articleEditRef.value.open({})
}
// 編輯邏輯
const onEditArticle = (row) => {
  articleEditRef.value.open(row)
}

// 刪除邏輯
const onDeleteArticle = (row) => {
  console.log(row)
}

// 添加或者編輯 成功的回調
const onSuccess = (type) => {
  if (type === 'add') {
    // 如果是添加，最好渲染最後一頁
    const lastPage = Math.ceil((total.value + 1) / params.value.pagesize)
    // 更新成最大頁碼數，再渲染
    params.value.pagenum = lastPage
    getArticleList()
  } else {
    // 如果是編輯 渲染當前頁即可
    getArticleList()
  }
}
</script>
<template>
  <page-container title="文章管理">
    <template #extra>
      <el-button type="primary" @click="onAddArticle">添加文章</el-button>
    </template>

    <!-- 表單區域 -->
    <el-form inline>
      <el-form-item label="文章分類:">
        <!-- Vue2 => v-model :value 和 @input的簡寫 -->
        <!-- Vue3 => v-model :modelValue 和 @update:modelValue的簡寫 -->
        <channel-select v-model="params.cate_id"></channel-select>

        <!-- Vue3 => v-model:cid  :cid 和 @update:cid 的簡寫 -->
        <!--            v-model:cid="params.cate_id" -->
      </el-form-item>
      <el-form-item label="發布狀態:">
        <!-- 這裡後臺標記已發布狀態，就是通過中文標記的， 已發布/草稿 -->
        <el-select v-model="params.state">
          <el-option label="已发布" value="已发布"></el-option>
          <el-option label="草稿" value="草稿"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button @click="onSearch" type="primary">搜索</el-button>
        <el-button @click="onReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格區域 -->
    <el-table :data="articleList" v-loading="loading">
      <el-table-column label="文章標題" prop="title">
        <template #default="{ row }">
          <el-link type="primary" :underline="false">{{ row.title }}</el-link>
        </template>
      </el-table-column>
      <el-table-column label="分類" prop="cate_name"></el-table-column>
      <el-table-column label="發表時間" prop="pub_date">
        <template #default="{ row }">
          {{ formatTime(row.pub_date) }}
        </template>
      </el-table-column>
      <el-table-column label="狀態" prop="state"></el-table-column>
      <el-table-column label="操作">
        <!-- 利用作用域插槽 row 可以獲取當前行的數據 => v-for 便歷 item -->
        <template #default="{ row }">
          <el-button
            circle
            plain
            type="primary"
            :icon="Edit"
            @click="onEditArticle(row)"
          ></el-button>
          <el-button
            circle
            plain
            type="danger"
            :icon="Delete"
            @click="onDeleteArticle(row)"
          ></el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分頁區域 -->
    <el-pagination
      v-model:current-page="params.pagenum"
      v-model:page-size="params.pagesize"
      :page-sizes="[2, 3, 5, 10]"
      :background="true"
      layout="jumper, total, sizes, prev, pager, next"
      :total="total"
      @size-change="onSizeChange"
      @current-change="onCurrentChange"
      style="margin-top: 20px; justify-content: right"
    />

    <!-- 添加編輯的抽屜 -->
    <article-edit ref="articleEditRef" @success="onSuccess"></article-edit>
  </page-container>
</template>

<style lang="scss" scoped></style>
