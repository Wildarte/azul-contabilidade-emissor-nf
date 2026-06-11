/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        night: '#011530',
        abyss: '#061A33',
        deep: '#104596',
        primary: '#1755AA',
        mid: '#2676CA',
        bright: '#2F87DB',
        cyan: '#4CB5F7',
        cyanSoft: '#3B9BEB',
        textMain: '#EAF6FF',
        textSoft: '#8ABBEA',
      },
      boxShadow: {
        glow: '0 18px 60px rgba(47, 135, 219, 0.18)',
      },
      backgroundImage: {
        hero: 'radial-gradient(circle at top left, rgba(76,181,247,0.20), transparent 30%), radial-gradient(circle at top right, rgba(23,85,170,0.18), transparent 25%), linear-gradient(145deg, #011530 0%, #061A33 55%, #0b2040 100%)',
      },
      fontFamily: {
        display: ['Manrope', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
