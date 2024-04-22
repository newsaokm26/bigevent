import request from '@/utils/request'

// 註冊接口
export const userRegisterService = ({ username, password, repassword }) => {
  return request.post('/api/reg', { username, password, repassword })
}

// 登入接口
export const userLoginSerivce = ({ username, password }) =>
  request.post('/api/login', { username, password })

// 獲取用戶基本信息
export const userGetInfoService = () => request.get('/my/userinfo')
