"use client";

interface SectionDividerProps {
  variant?: "wave" | "diagonal" | "dots" | "simple";
  color?: "blue" | "purple" | "green" | "orange";
  className?: string;
}

export function SectionDivider({ 
  variant = "wave", 
  color = "blue",
  className = "" 
}: SectionDividerProps) {
  const colorClasses = {
    blue: "from-blue-500/20 to-indigo-500/20",
    purple: "from-purple-500/20 to-pink-500/20", 
    green: "from-green-500/20 to-emerald-500/20",
    orange: "from-orange-500/20 to-red-500/20"
  };

  const WaveVariant = () => (
    <div className={`relative h-24 ${className}`}>
      <svg
        className="absolute bottom-0 w-full h-24"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <path
          d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"
          className={`fill-current text-gradient-to-r ${colorClasses[color]} opacity-30`}
        />
        <path
          d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
          className={`fill-current text-gradient-to-r ${colorClasses[color]} opacity-50`}
        />
        <path
          d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
          className={`fill-current text-gradient-to-r ${colorClasses[color]}`}
        />
      </svg>
    </div>
  );

  const DiagonalVariant = () => (
    <div className={`relative h-16 ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]} transform -skew-y-1`} />
    </div>
  );

  const DotsVariant = () => (
    <div className={`relative h-8 flex items-center justify-center ${className}`}>
      <div className="flex space-x-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full bg-gradient-to-r ${colorClasses[color]} animate-pulse`}
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  );

  const SimpleVariant = () => (
    <div className={`relative h-1 ${className}`}>
      <div className={`absolute inset-0 bg-gradient-to-r ${colorClasses[color]}`} />
    </div>
  );

  const variants = {
    wave: WaveVariant,
    diagonal: DiagonalVariant,
    dots: DotsVariant,
    simple: SimpleVariant
  };

  const SelectedVariant = variants[variant];

  return <SelectedVariant />;
} 