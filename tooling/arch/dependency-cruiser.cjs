module.exports = {
	forbidden: [
		{
			name: "no-cross-package-src-imports",
			comment:
				"Do not import other packages' src files. Use package entry points instead.",
			severity: "error",
			from: {
				path: "^(packages|apps)/.+",
			},
			to: {
				path: "@.+/src/",
			},
		},
		{
			name: "no-feature-to-api",
			comment: "Feature layer must not depend on API layer exports.",
			severity: "error",
			from: {
				path: "^packages/features/.+",
			},
			to: {
				path: "^@repo/(api|orpc).+",
			},
		},
	],
	options: {
		doNotFollow: {
			path: "node_modules",
		},
		exclude: "(^|/)(dist|build|node_modules)/",
		reporterOptions: {
			dot: {
				collapsePattern: "^node_modules",
			},
		},
	},
};
