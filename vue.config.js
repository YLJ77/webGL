module.exports = {
    chainWebpack: config => {
        config.module
            .rule('webgl')
            .test(/\.(glsl|vs|fs|vert|frag)$/)
            .use('raw-loader')
            .loader('raw-loader')
            .end()
            .test(/\.(glsl|vs|fs|vert|frag)$/)
            .use('glslify-loader')
            .loader('glslify-loader')
            .end()
    }
}
