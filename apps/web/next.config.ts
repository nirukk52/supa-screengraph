import path from "node:path";
import { withContentCollections } from "@content-collections/next";
// @ts-expect-error - PrismaPlugin is not typed
import { PrismaPlugin } from "@prisma/nextjs-monorepo-workaround-plugin";
import type { NextConfig } from "next";
import nextIntlPlugin from "next-intl/plugin";

const withNextIntl = nextIntlPlugin("./modules/i18n/request.ts");

const nextConfig: NextConfig = {
	typescript: {
		ignoreBuildErrors: true,
	},
	experimental: {
		serverComponentsExternalPackages: ["pg", "pg-format", "pg-listen"],
	},
	transpilePackages: [
		"@repo/api",
		"@repo/auth",
		"@repo/database",
		"@sg/feature-agents-run",
		"@sg/agents-contracts",
		"@sg/eventbus",
		"@sg/eventbus-inmemory",
		"@sg/queue",
		"@sg/queue-inmemory",
	],
	images: {
		remotePatterns: [
			{
				// google profile images
				protocol: "https",
				hostname: "lh3.googleusercontent.com",
			},
			{
				// github profile images
				protocol: "https",
				hostname: "avatars.githubusercontent.com",
			},
		],
	},
	async redirects() {
		return [
			{
				source: "/app/settings",
				destination: "/app/settings/general",
				permanent: true,
			},
			{
				source: "/app/:organizationSlug/settings",
				destination: "/app/:organizationSlug/settings/general",
				permanent: true,
			},
			{
				source: "/app/admin",
				destination: "/app/admin/users",
				permanent: true,
			},
		];
	},
	eslint: {
		ignoreDuringBuilds: true,
	},
	webpack: (config, { webpack, isServer }) => {
		config.plugins.push(
			new webpack.IgnorePlugin({
				resourceRegExp: /^pg-native$|^cloudflare:sockets$/,
			}),
		);

		if (isServer) {
			config.plugins.push(new PrismaPlugin());
			// Ensure problematic CJS package with __dirname requires is kept external
			// to avoid Next.js bundler attempting to resolve server-relative imports.
			config.externals = config.externals || [];
			config.externals.push({ "pg-format": "commonjs pg-format" });
			config.externals.push({ pg: "commonjs pg" });
		}

		// Resolve local workspace packages without publishing
		config.resolve = config.resolve || {};
		config.resolve.alias = {
			...(config.resolve.alias || {}),
			"@repo/api": path.resolve(__dirname, "../../packages/api"),
			"@repo/api/*": path.resolve(__dirname, "../../packages/api"),
			"@sg/agents-contracts": path.resolve(
				__dirname,
				"../../packages/agents-contracts/src",
			),
			"@sg/eventbus": path.resolve(
				__dirname,
				"../../packages/eventbus/src",
			),
			"@sg/eventbus-inmemory": path.resolve(
				__dirname,
				"../../packages/eventbus-inmemory/src",
			),
			"@sg/queue": path.resolve(__dirname, "../../packages/queue/src"),
			"@sg/queue-inmemory": path.resolve(
				__dirname,
				"../../packages/queue-inmemory/src",
			),
			"@sg/feature-agents-run": path.resolve(
				__dirname,
				"../../packages/features/agents-run/src",
			),
		};

		return config;
	},
};

export default withContentCollections(withNextIntl(nextConfig));
