const buildPath = './../static';

import sass from 'rollup-plugin-sass';
// sass test setup not final sass
const sassConfig = {

    input: 'app.scss',
    output: {
        dir:  buildPath,
        inlineDynamicImports: true
    },
    plugins: [
        sass({
            output: buildPath + "output.css",
            outputStyle: "compressed",
        })
    ]
}

export default [configSvelte, sassConfig]