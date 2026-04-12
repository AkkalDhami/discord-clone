import { NavigationSidebar } from "@/components/layouts/navigation-sidebar";

export default function ServerLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="w-full">
      <div className="fixed border-l-4 ml-1 border-double inset-y-0 z-30 hidden h-full w-18 flex-col md:flex">
        <NavigationSidebar />
      </div>
      <main className="h-full md:pl-18"> {children}</main>
    </section>
  );
}
