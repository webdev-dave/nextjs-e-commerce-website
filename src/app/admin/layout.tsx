import Nav, { NavLink } from "@/components/Nav";

export const dynamic = "force-dynamic"; // This is to prevent all admin pages from being cached in order to ensure that the data is always up to date

export default function AdminLayout({ children, }: Readonly<{ children: React.ReactNode }>) {
    return <>
    <Nav>
        <NavLink href="/admin">Dashboard</NavLink>
        <NavLink href="/admin/products">Products</NavLink>
        <NavLink href="/admin/users">Customers</NavLink>
        <NavLink href="/admin/orders">Sales</NavLink>
    </Nav>
    <div className="container my-4 mx-auto">{children}</div>
    </>

}
