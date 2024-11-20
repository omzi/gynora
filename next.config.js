/** @type {import('next').NextConfig} */
const nextConfig = {
	skipMiddlewareUrlNormalize: true,
	images: {
		dangerouslyAllowSVG: true,
		domains: ['api.dicebear.com', 'files.edgestore.dev', 'lh3.googleusercontent.com']
	}
};

module.exports = nextConfig;
