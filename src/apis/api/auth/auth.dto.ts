/**
 * 로그인 API 요청 타입
 */
export type LoginAPIRequest = {
  email: string;
  password: string;
};

export type SignUpAPIRequest = {
  email: string;
  password: string;
  name: string;
  mobileNumber: string;
};
