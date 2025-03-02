import Nav, { NavLink } from "@/components/Nav";

export const dynamic = "force-dynamic"; // This is to prevent all admin pages from being cached in order to ensure that the data is always up to date

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <nav>
        <Nav>
          <NavLink href="/admin">Dashboard</NavLink>
          <NavLink href="/admin/products">Products</NavLink>
          <NavLink href="/admin/users">Customers</NavLink>
          <NavLink href="/admin/orders">Sales</NavLink>
        </Nav>
      </nav>
      <main className="px-4 py-6">
        <div className="container mx-auto">{children}</div>
      </main>
    </>
  );
}
