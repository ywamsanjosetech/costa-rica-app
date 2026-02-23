export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen px-3 py-5 md:px-6 md:py-7">
      <div className="mx-auto w-full max-w-7xl">{children}</div>
    </div>
  );
}
