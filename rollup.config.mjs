const buildPath = 'static';

import sass from 'rollup-plugin-sass';
// sass test setup not final sass
const sassConfig = {
    input: 'sass/app.scss',
    output: {
        dir:  buildPath,
    },
    plugins: [
        sass({
            output: "static/output.css",
            outputStyle: "compressed",
        })
    ]
}

export default [sassConfig]