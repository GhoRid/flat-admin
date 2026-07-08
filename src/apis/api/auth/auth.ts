import { appInstance } from "../..";
import type { LoginAPIRequest, SignUpAPIRequest } from "./auth.dto";

export const login = async (payload: LoginAPIRequest) => {
  return await appInstance.post("/auth/login", payload);
};

export const checkDuplicateEmail = async (params: { email: string }) => {
  return await appInstance.get("/auth/is-duplicated", { params });
};

export const sendVerification = async (payload: { mobileNumber: string }) => {
  return await appInstance.post("/auth/send-verification", payload);
};

export const checkVerificationCode = async (params: {
  mobileNumber: string;
  verificationCode: string;
}) => {
  return await appInstance.get("/auth/verification-code", { params });
};

// 비밀번호 초기화 관련 API

export const checkEmailForReset = async (params: { email: string }) => {
  return await appInstance.get("/auth/reset-password/is-registration", {
    params,
  });
};

export const sendResetPasswordVerification = async (payload: {
  mobileNumber: string;
}) => {
  return await appInstance.post("/auth/reset-password/send-verification", payload);
};

export const checkResetPasswordOtp = async (params: {
  mobileNumber: string;
  verificationCode: string;
}) => {
  return await appInstance.get("/auth/reset-password/verification-code", {
    params,
  });
};

export const resetPassword = async (payload: {
  email: string;
  password: string;
  otp: number;
}) => {
  return await appInstance.post("/auth/reset-password/reset", payload);
};

// 회원가입 API
export const signUp = async (payload: SignUpAPIRequest) => {
  return await appInstance.post("/auth/registration", payload);
};

export const sendVerificationCodeFindId = async (payload: {
  mobileNumber: string;
}) => {
  return await appInstance.post("/auth/find-id/send-verification", payload);
};

export const checkVerificationCodeFindId = async (params: {
  name: string;
  mobileNumber: string;
  verificationCode: string;
}) => {
  return await appInstance.get("/auth/find-id/verification-code", { params });
};

// 비밀번호 재설정 api 필요
