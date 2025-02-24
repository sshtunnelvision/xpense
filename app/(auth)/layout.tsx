export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="flex min-h-screen flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="mx-auto h-12 w-auto text-center text-4xl font-bold text-primary">
            Xpense
          </h1>
        </div>
        {children}
      </main>
    </div>
  );
}
