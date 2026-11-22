/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: "#080D18",
          panel: "#111C2D",
          panelHover: "#16243A",
          border: "#1A2A42",
          borderLight: "#243859",
          borderGlow: "rgba(0, 213, 255, 0.35)",
          cyan: "#00D5FF",
          cyanDim: "rgba(0, 213, 255, 0.12)",
          violet: "#8B5CF6",
          violetDim: "rgba(139, 92, 246, 0.12)",
          critical: "#EF4444",
          high: "#F97316",
          medium: "#F59E0B",
          low: "#10B981",
          text: "#F8FAFC",
          muted: "#94A3B8",
          darkMuted: "#64748B"
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace']
      },
      boxShadow: {
        glowCyan: "0 0 20px -4px rgba(0, 213, 255, 0.35)",
        glowViolet: "0 0 20px -4px rgba(139, 92, 246, 0.3)",
        glowCritical: "0 0 20px -4px rgba(239, 68, 68, 0.35)",
        card: "0 4px 20px -2px rgba(0, 0, 0, 0.5)",
      }
    },
  },
  plugins: [],
}
