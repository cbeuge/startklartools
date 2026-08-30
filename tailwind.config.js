/** @type {import('tailwindcss').Config} */
// Tailwind v3, nicht v4. v4 nutzt ein Rust-Binary, das an den "##"-Zeichen
// im Pfad abstuerzt. Betrifft jedes Projekt unter ##BUSINESS/##webseiten.
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        marke: "#2563eb",
        akzent: "#f97316",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
