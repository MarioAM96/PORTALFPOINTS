export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-2 py-2 md:py-4"> {/* Reduje espaciado */}
      <div className="inline-block text-center justify-center">
        {children}
      </div>
    </section>
  );
}