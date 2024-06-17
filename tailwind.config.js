/** @type {import('tailwindcss').Config} */
console.log(process.env.NODE_ENV);
const purge = process.env.NODE_ENV == "production" ? true : false;

module.exports = {
  content: ["./build/**/*.html"], // updated to the new 'content' key
  darkMode: "media", // changed from 'false' to 'media'
  theme: {
    extend: {},
  },
  plugins: [],
};
