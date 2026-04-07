export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userByEmail: (email: string) => `user:email:${email}`,
  userList: (page: number, limit: number) => `users:list:${page}:${limit}`,
  // Thêm key mới ở đây khi cần — không hardcode string ở nơi khác
} as const;

export const CacheTTL = {
  USER: 300_000, // 5 phút
  USER_LIST: 60_000, // 1 phút
} as const;

// Legacy enum for backward compatibility
export enum CacheKey {
  AccessToken = 'auth:token:%s:access',
  EmailVerificationToken = 'auth:token:%s:email-verification',
}
