module.exports = {
    presets: [
        '@vue/cli-plugin-babel/preset'
    ],
    plugins: [
        "@babel/plugin-transform-runtime",
        "@babel/plugin-proposal-logical-assignment-operators",
        ["@babel/plugin-proposal-pipeline-operator", { "proposal": "minimal" }],
        "@babel/plugin-proposal-do-expressions",
        "@babel/plugin-proposal-optional-chaining",
        'glslify'
    ]
}
