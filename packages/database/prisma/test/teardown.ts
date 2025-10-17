import { execSync } from "node:child_process";
import process from "node:process";

const WORKER_ID = process.env.VITEST_WORKER_ID || "0";

function run(cmd: string) {
	execSync(cmd, { stdio: "inherit" });
}

export default async function teardown(_ctx: unknown) {
	const state = global.__prismaTestState?.get(WORKER_ID);
	if (!state) {
		return;
	}

	const { schema, baseUrl, container } = state;

	try {
		const dropUrl = new URL(baseUrl);
		dropUrl.searchParams.delete("schema");
		run(
			`pnpm --filter @repo/database exec prisma db execute --url '${dropUrl.toString()}' --script 'DROP SCHEMA IF EXISTS "${schema}" CASCADE;'`,
		);
	} catch (err) {
		console.error("Failed to drop test schema", err);
	}

	if (container) {
		await container.stop();
	}

	global.__prismaTestState?.delete(WORKER_ID);
}
