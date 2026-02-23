export default function FloatingLinesBg({ mode = "section" }) {
  const modeClass = mode === "page" ? "floating-lines-page" : "";

  return (
    <div aria-hidden className={`floating-lines-root ${modeClass}`}>
      <svg
        viewBox="0 0 1200 700"
        preserveAspectRatio="none"
        className="floating-lines-svg"
      >
        <defs>
          <linearGradient id="lineBlue" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5f8dff" />
            <stop offset="55%" stopColor="#6f6bff" />
            <stop offset="100%" stopColor="#4b9dff" />
          </linearGradient>
          <linearGradient id="linePink" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#7ad3ff" />
            <stop offset="55%" stopColor="#a3f0ef" />
            <stop offset="100%" stopColor="#d6f6ff" />
          </linearGradient>
          <filter id="glowBlue" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glowPink" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blurred" />
            <feMerge>
              <feMergeNode in="blurred" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g className="track-a">
          <path
            d="M -120 182 C 170 360, 420 402, 790 340 C 1000 304, 1220 446, 1360 518"
            className="line-main line-blue"
          />
          <path
            d="M -120 205 C 170 383, 420 428, 790 358 C 1000 322, 1220 464, 1360 540"
            className="line-soft line-blue"
          />
          <path
            d="M -120 227 C 170 404, 420 447, 790 374 C 1000 338, 1220 478, 1360 558"
            className="line-soft line-blue"
          />
        </g>

        <g className="track-b">
          <path
            d="M -160 158 C 240 300, 560 296, 830 372 C 1030 428, 1208 520, 1360 606"
            className="line-main line-pink"
          />
          <path
            d="M -160 178 C 240 322, 560 320, 830 390 C 1030 446, 1208 538, 1360 624"
            className="line-soft line-pink"
          />
          <path
            d="M -160 198 C 240 338, 560 338, 830 406 C 1030 462, 1208 556, 1360 640"
            className="line-soft line-pink"
          />
        </g>

        <g className="track-c">
          <path
            d="M 720 780 C 840 560, 920 386, 1010 250 C 1118 84, 1225 -50, 1342 -150"
            className="line-fine line-blue"
          />
          <path
            d="M 700 780 C 826 560, 906 386, 996 250 C 1104 84, 1211 -50, 1328 -150"
            className="line-fine line-pink"
          />
        </g>
      </svg>
    </div>
  );
}
