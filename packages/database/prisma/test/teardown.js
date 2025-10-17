var __importDefault =
	(this && this.__importDefault) ||
	((mod) => (mod?.__esModule ? mod : { default: mod }));
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = teardown;
const node_child_process_1 = require("node:child_process");
const node_process_1 = __importDefault(require("node:process"));
const WORKER_ID = node_process_1.default.env.VITEST_WORKER_ID || "0";
function run(cmd) {
	node_child_process_1.execSync(cmd, { stdio: "inherit" });
}
async function teardown(_ctx) {
	const state = global.__prismaTestState?.get(WORKER_ID);
	if (!state) {
		return;
	}
	const { schema, baseUrl, container } = state;
	try {
		const dropUrl = new URL(baseUrl);
		dropUrl.searchParams.delete("schema");
		run(
			`pnpm --filter @repo/database exec prisma db execute --url ${dropUrl.toString()} --script "DROP SCHEMA IF EXISTS "${schema}" CASCADE;"`,
		);
	} catch (err) {
		console.error("Failed to drop test schema", err);
	}
	if (container) {
		await container.stop();
	}
	global.__prismaTestState?.delete(WORKER_ID);
}
