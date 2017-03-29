var webpack = require('webpack');

module.exports = {
	entry : {
		chat: './assets/main.js'
	},
	output: {
		filename: './public/bundle/[name]-bundle.min.js'
	},
	watch: true,
	module: {
		loaders: [{
			test: /\.js$/,
			loader: 'babel-loader',
			query: {
				presets: ['es2015']
			}
		},
		{
			test: /\.json$/,
			loader: 'json'
		},
		{
			test: /\.css$/,
			loader: 'style!css'
		},
		{
			test: /\.(eot|svg|ttf|woff|woff2)$/,
			loader: 'file?name=public/bundle/fonts/[name].[ext]'
		}]
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: "jquery"
		})
	]
};