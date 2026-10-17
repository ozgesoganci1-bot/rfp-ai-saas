export async function getActiveTenantSession() {
  return {
    user: {
      id: "usr_demo_123",
      name: "Özge Soğancı",
      email: "ozge@demo-sirket.com",
      role: "manager",
    },
    tenant: {
      id: "tenant_demo_456",
      name: "Demo Teknoloji A.Ş.",
      plan: "pro",
    },
  };
}
