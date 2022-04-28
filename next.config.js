/** @type {import('next').NextConfig} */
module.exports = {
	reactStrictMode: true,
	webpack: (config) => {
		config.module.rules.push({
			test: /\.(woff|woff2|eot|ttf|otf)$/i,
			type: "asset/resource"
		});
		return config;
	},
	async redirects() {
		return [
			{
				source: "/",
				destination: "https://app.cennz.net/bridge",
				permanent: true
			},
			{
				source: "/:path",
				destination: "https://app.cennz.net/bridge",
				permanent: true
			}
		];
	}
};
