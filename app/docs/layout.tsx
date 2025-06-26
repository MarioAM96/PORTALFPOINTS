export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col items-center justify-center gap-2 px-4 py-2 md:py-4 md:px-6 lg:px-8">
      <div className="inline-block text-center justify-center w-full max-w-5xl">
        {children}
      </div>
    </section>
  );
}