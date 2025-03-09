import { BaseService } from './core/baseService'


export interface UserInfo {
  id: string
  username?: string
  email?: string
  created_at?: string
  updated_at?: string
}

export interface UserCreate {
  email: string
  username?: string
  code: string
  password: string
}

export interface UserLoginResponse {
  access_token: string
  token_type: string
  user: UserInfo
}

export interface UserLogin {
  email: string
  password: string
}


export class UserService extends BaseService {
  async getUserInfo(): Promise<UserInfo> {
    return this.get<UserInfo>('/user/info')
  }

  async register(user: UserCreate): Promise<UserInfo> {
    return this.post<UserInfo>('/register', user)
  }

  async login(user: UserLogin): Promise<UserLoginResponse> {
    return this.post<UserLoginResponse>('/login', user)
  }

  async sendVerificationCode(email: string): Promise<void> {
    return this.post('/send-verification-code', { email })
  }
  async forgotPassword(email: string): Promise<void> {
    return this.post('/forgot-password', { email })
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<void> {
    return this.post('/reset-password', {
      email,
      code,
      new_password: newPassword
    })
  }
}

export const userService = new UserService()
