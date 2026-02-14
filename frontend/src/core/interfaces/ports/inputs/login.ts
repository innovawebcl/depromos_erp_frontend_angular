export interface ILoginInput {
  username: string;
  password: string;
}

export interface IForgotPasswordInput {
  email: string;
}

export interface IValidateCodeInput {
  email: string;
  code: string;
}


export interface IResetPasswordInput {
  password: string;
}

