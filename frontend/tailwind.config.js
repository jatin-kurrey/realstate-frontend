/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {

            colors: {
                primary: "#40a28f",
            }
        },
    },
    plugins: [],
}
