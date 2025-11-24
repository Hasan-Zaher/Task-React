 
export const API_BASE_URL = "https://dynamic-test.s-apps.net/api";

 
export const API_ENDPOINTS = {
 
  LOGIN: "/user/login",
  REGISTER: "/user/register",
  
 
  FORMS: "/form",
  FORM_BY_ID: (id: string) => `/form/${id}`,
  
  
  USER_PROFILE: "/user/profile",
} as const;

 
export const API_CONFIG = {
  TIMEOUT: 10000, 
  RETRY_ATTEMPTS: 3,
} as const;