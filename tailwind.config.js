/** @type {import('tailwindcss').Config} */
export default { // <-- Confirme que está 'export default' (era 'module.exports' antes)
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
