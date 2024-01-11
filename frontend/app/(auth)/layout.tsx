export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="grid place-content-center h-[90vh]">{children}</div>;
}
