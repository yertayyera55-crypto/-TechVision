import { AppSidebar } from "@/components/app-sidebar";
import { MobileNavigation } from "@/components/mobile-navigation";
import { ToastNotification } from "@/components/ui/toast-notification";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <AppSidebar />
      <main className="min-h-screen pb-24 lg:pl-[248px] lg:pb-0">
        <div className="mx-auto w-full max-w-[1440px] px-4 py-5 sm:px-7 md:py-8 lg:px-10 xl:px-12">{children}</div>
      </main>
      <MobileNavigation />
      <ToastNotification />
    </div>
  );
}
