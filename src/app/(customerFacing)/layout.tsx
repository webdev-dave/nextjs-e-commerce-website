import Nav, { NavLink } from "@/components/Nav";

export const dynamic = "force-dynamic"; // This is to prevent all admin pages from being cached in order to ensure that the data is always up to date

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <nav>
        <Nav>
          <NavLink href="/">Home</NavLink>
          <NavLink href="/products">Products</NavLink>
          <NavLink href="/orders">My Orders</NavLink>
        </Nav>
      </nav>
      <main className="px-4 py-6">
        <div className="container mx-auto">{children}</div>
      </main>
    </>
  );
}
