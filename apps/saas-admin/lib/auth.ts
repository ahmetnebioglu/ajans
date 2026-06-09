export function requireAdminAuth() {
  return {
    user: {
      role: "ADMIN",
      name: "SaaS Yönetici",
    },
  };
}
