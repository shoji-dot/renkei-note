import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import LoginForm from "./LoginForm";

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold text-center mb-6">連携ノート</h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          八ヶ岳トロバール × グートンデリ
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
