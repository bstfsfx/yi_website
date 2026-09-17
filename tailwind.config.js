/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#f7f2e9',
        paper: '#fffdf8',
        green: '#185f59',
        green2: '#2b756d',
        ink: '#24302f',
        muted: '#6f7773',
        line: '#e6dfd3',
        soft: '#edf3ef',
        warm: '#ead9bf',
        danger: '#f5e6df',
        gold: '#c9a35f'
      },
      boxShadow: {
        soft: '0 10px 30px rgba(54,45,33,.08)',
        card: '0 4px 18px rgba(50,45,35,.04)'
      },
      fontFamily: {
        heading: ['Noto Serif TC', 'Songti TC', 'serif'],
        body: ['Noto Sans TC', 'PingFang TC', 'Microsoft JhengHei', 'sans-serif']
      }
    }
  },
  plugins: []
};