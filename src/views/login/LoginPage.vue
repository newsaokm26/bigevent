<script setup>
import { userRegisterService, userLoginSerivce } from '@/api/user.js'
import { User, Lock } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { useUserStore } from '@/stores'
import { useRouter } from 'vue-router'
const isRegister = ref(false)
const form = ref()

// 整個用於提交的form數據對象
const formModel = ref({
  username: '',
  password: '',
  repassword: ''
})
// 整個表單的校驗規則 此處沒做響應式處理 (規則式數組，表示可以做很多條規則)
// 1. 非空校驗 required: true    message消息提示，trigger觸發時效驗的時機 blur change
// 2. 長度校驗 min: xx , max: xx
// 3. 正則校驗 pattern: 正則校驗 \S 非空
// 4. 自訂義校驗 => 自己寫邏輯校驗 (校驗函數)
//    validator: (rule, value, callback)
//    (1) rule  當前校驗規則的相關信息
//    (2) value 所校驗表單元素目前的表單值
//    (3) callback 當無論成功或失敗，都需要 callback 回調
//        - callback() 校驗成功
//        - callback(new Error(錯誤信息)) 校驗失敗
const rules = {
  username: [
    { required: true, message: '請輸入用戶名', trigger: 'blur' },
    { min: 5, max: 10, message: '必須5-10', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { pattern: /^\S{6,15}$/, message: '密碼必須6-15非空', trigger: 'blur' }
  ],
  repassword: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { pattern: /^\S{6,15}$/, message: '密碼必須6-15非空', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        // 判斷 value 和 當前 form 中收集的 password 是否一致
        if (value !== formModel.value.password) {
          callback(new Error('兩次密碼不一致'))
        } else {
          callback() // 就算校驗成功，也需要callback
        }
      },
      trigger: 'blur'
    }
  ]
}

const register = async () => {
  // 註冊成功之前，先進行校驗，校驗成功 -> 請求，較驗失敗 -> 自動提示
  await form.value.validate()
  await userRegisterService(formModel.value)
  ElMessage.success('註冊成功')
  isRegister.value = false
}

const userStore = useUserStore()

const router = useRouter()
// shuai008
const login = async () => {
  await form.value.validate() // form表單需綁好ref
  const res = await userLoginSerivce(formModel.value)
  console.log('開始登入', res)
  userStore.setToken(res.data.token)
  ElMessage.success('登录成功')
  router.push('/')
}

// 切換的時候，重置表單內容
watch(isRegister, () => {
  formModel.value = {
    username: '',
    password: '',
    repassword: ''
  }
})
</script>

<template>
  <!--  
    1. 結構相關
      el-row表示一行，一行分成24份
        el-col表示列
        (1) :span="12" 代表在一行中，占12份(50%)
        (2) :span="6"  表示在一行中，占6份 (25%)
        (3) :offset="3"代表在一行中，左側margin份數

        el-form 整個表單組件
        el-form-item 表單的一行 (表單域)
        el-input 表單元素 (輸入框)
    2. 校驗相關
        (1) el-form => :model="ruleForm"       綁定整個form的數據對象 { xxx, xxx, xxx }
        (2) el-form => :rules="rules"          綁定整個rules規則對象 { xxx, xxx, xxx }
        (3) 表單元素 => v-model="ruleForm.xxx"  給表單元素，綁定form子屬性
        (4) el-form-itme => prop配置生效的是哪個校驗規則 (和rules中的字段要對應)
  -->
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <!-- 註冊相關表單 -->
      <el-form
        :model="formModel"
        :rules="rules"
        ref="form"
        size="large"
        autocomplete="off"
        v-if="isRegister"
      >
        <el-form-item>
          <h1>注册</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="formModel.username"
            :prefix-icon="User"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item prop="repassword">
          <el-input
            v-model="formModel.repassword"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入再次密码"
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="register"
            class="button"
            type="primary"
            auto-insert-space
          >
            注册
          </el-button>
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = false">
            ← 返回
          </el-link>
        </el-form-item>
      </el-form>
      <!-- 登入相關表單 -->
      <el-form
        :model="formModel"
        :rules="rules"
        ref="form"
        size="large"
        autocomplete="off"
        v-else
      >
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="username">
          <el-input
            v-model="formModel.username"
            :prefix-icon="User"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formModel.password"
            name="password"
            :prefix-icon="Lock"
            type="password"
            placeholder="请输入密码"
          ></el-input>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        <el-form-item>
          <el-button
            @click="login"
            class="button"
            type="primary"
            auto-insert-space
            >登录</el-button
          >
        </el-form-item>
        <el-form-item class="flex">
          <el-link type="info" :underline="false" @click="isRegister = true">
            注册 →
          </el-link>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  background-color: #fff;
  .bg {
    background:
      url('@/assets/logo2.png') no-repeat 60% center / 240px auto,
      url('@/assets/login_bg.jpg') no-repeat center / cover;
    border-radius: 0 20px 20px 0;
  }
  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;
    .title {
      margin: 0 auto;
    }
    .button {
      width: 100%;
    }
    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}
</style>
