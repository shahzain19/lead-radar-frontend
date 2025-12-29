/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: '#0a0a0a',
                foreground: '#ededed',
                primary: '#3b82f6',
                card: '#111111',
                border: '#1f1f1f',
            }
        },
    },
    plugins: [],
}
