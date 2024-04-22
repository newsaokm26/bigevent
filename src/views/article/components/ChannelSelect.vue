<script setup>
import { ref } from 'vue'
import { artGetChannelsService } from '@/api/article.js'

defineProps({
  modelValue: {
    type: [Number, String]
  },
  // 生效
  width: {
    type: String
  }
})

const emit = defineEmits(['update:modelValue'])

const channelList = ref([])
const getChannelList = async () => {
  const res = await artGetChannelsService()
  channelList.value = res.data.data
  console.log(channelList.value)
}
getChannelList()
</script>

<template>
  <!-- label 展示給用戶看，value 收集起來提交給後台的 -->
  <!-- 不要用 v-model ， v-model 是雙向綁定，這裡收集完要直接給父組件 -->
  <!-- :style="{ width }" -->
  <el-select
    :modelValue="modelValue"
    @update:modelValue="emit('update:modelValue', $event)"
    :style="{ width }"
  >
    <el-option
      v-for="channel in channelList"
      :key="channel.id"
      :label="channel.cate_name"
      :value="channel.id"
    ></el-option>
  </el-select>
</template>
