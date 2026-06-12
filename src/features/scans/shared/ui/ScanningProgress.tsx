

const RADIUS = 90;

/**
 * ScanningProgress
 *
 * Props:
 *   isCompleted {boolean}      whether the scan is fully 100% completed
 *   isFailed    {boolean}      whether the scan failed
 *   size        {number}       outer container px size (default: 340)
 *   color       {string}       arc stroke color (default: "#3D4EFF")
 *   trackColor  {string}       background track color (default: "#E8EAFF")
 */
export default function ScanningProgress({
  isCompleted = false,
  isFailed = false,
  size = 340,
  color = "#3D4EFF",
  trackColor = "#E8EAFF",
}: {
  isCompleted?: boolean;
  isFailed?: boolean;
  size?: number;
  color?: string;
  trackColor?: string;
}) {
  const svgSize = size * (220 / 280);
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const scaledRadius = RADIUS * (svgSize / 220);
  const scaledCircumference = 2 * Math.PI * scaledRadius;
  const ringBaseSize = scaledRadius * 2 + 14;

  const displayColor = isFailed ? "#ef4444" : color;
  const titleText = isFailed 
    ? "Scan Failed" 
    : isCompleted 
      ? "Scan Complete!" 
      : "Running comprehensive checks";
  
  const subtitleText = isFailed 
    ? "An error occurred during the scan." 
    : isCompleted 
      ? "Finalizing report..." 
      : "This usually takes 2-10 minutes";

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Inject style for keyframes */}
      <style>{`
        @keyframes sonar-ripple {
          0% {
            transform: scale(1);
            opacity: 0;
          }
          2% {
            opacity: 0.30;
          }
          20% {
            opacity: 0.25;
          }
          40% {
            opacity: 0.20;
          }
          60% {
            opacity: 0.10;
          }
          80% {
            opacity: 0.05;
          }
          100% {
            transform: scale(1.65);
            opacity: 0;
          }
        }
        .sonar-ring {
          animation: sonar-ripple 6s linear infinite;
        }
        
        @keyframes indeterminate-spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .indeterminate-spin {
          animation: indeterminate-spin 1.5s linear infinite;
          transform-origin: center;
        }

        @media (prefers-reduced-motion: reduce) {
          .sonar-ring, .indeterminate-spin {
            animation: none !important;
          }
        }
      `}</style>

      {/* Outer pulsing rings originating from the center and expanding outward */}
      {(!isCompleted && !isFailed) && [0, -1.2, -2.4, -3.6, -4.8].map((delay, i) => {
        return (
          <div
            key={i}
            className="sonar-ring"
            style={{
              position: "absolute",
              width: ringBaseSize,
              height: ringBaseSize,
              borderRadius: "50%",
              border: `1.2px solid ${displayColor}`,
              pointerEvents: "none",
              animationDelay: `${delay}s`,
            }}
          />
        );
      })}

      {/* Track SVG (Static) */}
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{ position: "absolute", transform: "rotate(-90deg)" }}
      >
        <circle
          cx={cx}
          cy={cy}
          r={scaledRadius}
          fill="none"
          stroke={isFailed ? "#fee2e2" : trackColor}
          strokeWidth={14}
        />
      </svg>

      {/* Progress arc SVG (Spinning or Filled) */}
      <svg
        width={svgSize}
        height={svgSize}
        viewBox={`0 0 ${svgSize} ${svgSize}`}
        style={{ position: "absolute", transform: "rotate(-90deg)" }}
        className={(!isCompleted && !isFailed) ? "indeterminate-spin" : ""}
      >
        <circle
          cx={cx}
          cy={cy}
          r={scaledRadius}
          fill="none"
          stroke={displayColor}
          strokeWidth={14}
          strokeLinecap="round"
          /* If completed/failed, fill it 100%. If running, 25% arc. */
          strokeDasharray={scaledCircumference}
          strokeDashoffset={(isCompleted || isFailed) ? 0 : scaledCircumference * 0.75}
          style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
        />
      </svg>

      {/* Center label */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: 24,
        }}
      >
        <span
          style={{
            fontSize: size * 0.055,
            fontWeight: 600,
            color: isFailed ? "#ef4444" : "#1e293b",
            lineHeight: 1.3,
            textAlign: "center",
          }}
        >
          {titleText}
        </span>
        <span
          style={{
            fontSize: size * 0.038,
            color: isFailed ? "#f87171" : "#64748b",
            textAlign: "center",
            marginTop: 4,
          }}
        >
          {subtitleText}
        </span>
      </div>
    </div>
  );
}
