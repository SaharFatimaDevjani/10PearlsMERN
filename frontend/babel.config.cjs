// frontend/babel.config.cjs
// Babel config used only by Jest (Vite itself doesn't need Babel — it uses
// esbuild). Transpiles modern JS + JSX to something Node can run directly
// when executing the test suite.
module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
    ['@babel/preset-react', {runtime: 'automatic'}],
  ],
};
