

export interface IUser {
  id: number,
  fullName: string,
  gender: string,
  email: string,
  photo: any
}

export interface IApiResponse<T> {
  data: T,
  success: boolean,
  errors: Record<string, any>
}

export interface ILoginRequestModel {
  email: string,
  password: string
}

export interface IUserSession {
  token: string,
  user: IUser
}

export interface IRegisterUserRequestModel {
  fullName: string,
  gender: string,
  email: string,
  password: string,
  photo: any
}

export interface IUpdateUserRequestModel {
  id: number,
  fullName: string,
  gender: string,
  email: string,
  password: string,
  photo: any
}