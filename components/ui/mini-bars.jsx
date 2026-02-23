export default function MiniBars({ bars }) {
  return (
    <div className="mt-4 flex h-40 items-end gap-2 rounded-xl border border-line bg-bg-elev/45 p-3">
      {bars.map((bar, index) => (
        <div
          key={`${bar}-${index}`}
          className="animate-float w-full rounded-t-md bg-gradient-to-t from-blue-strong/68 to-teal/58"
          style={{
            height: `${bar}%`,
            animationDelay: `${index * 120}ms`,
          }}
        />
      ))}
    </div>
  );
}
