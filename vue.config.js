module.exports = {
    chainWebpack: config => {
        config.module
            .rule('webgl')
            .test(/\.(vert|frag|geom)$/)
            .use('raw-loader')
            .loader('raw-loader')
            .end()
    }
}
