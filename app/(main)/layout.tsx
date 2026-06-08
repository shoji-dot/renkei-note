import { requireSession } from "@/lib/session";
import HeaderNav from "@/components/HeaderNav";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const user = session.user as any;

  return (
    <div className="min-h-screen pb-16">
      <HeaderNav name={user?.name} role={user?.role} locationName={user?.locationName} />
      <main className="max-w-2xl mx-auto px-4 py-4">{children}</main>
    </div>
  );
}
