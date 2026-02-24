export default function MiniBars({ bars }) {
  return (
    <div className="mt-4 flex h-44 items-end gap-2 rounded-2xl border border-line/85 bg-bg-elev/45 p-3 md:h-48">
      {bars.map((bar, index) => (
        <div
          key={`${bar}-${index}`}
          className="animate-float relative w-full overflow-hidden rounded-t-lg bg-gradient-to-t from-blue-strong/70 via-blue/72 to-teal/65"
          style={{
            height: `${bar}%`,
            animationDelay: `${index * 120}ms`,
          }}
        >
          <span className="absolute inset-x-0 top-0 h-1/3 bg-white/28 blur-[1px]" />
        </div>
      ))}
    </div>
  );
}
