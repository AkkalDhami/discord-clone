import { NavigationSidebar } from "@/components/layouts/navigation-sidebar";

export default function ServerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full">
      <div className="fixed inset-y-0 z-30 ml-1 hidden h-full w-18 flex-col border-l md:flex">
        <NavigationSidebar />
      </div>
      <main className="h-full md:pl-18"> {children}</main>
    </section>
  );
}
