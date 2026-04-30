import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";

export default async function DashboardLayout({ children }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="flex min-h-screen w-full bg-slate-50">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-[240px]">
        <Sidebar user={user} />
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-1 md:ml-[240px]">
        <Topbar user={user} />
        
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
