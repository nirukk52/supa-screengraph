import { execSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import path from "node:path";
import process from "node:process";
import {
	PostgreSqlContainer,
	type StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";

const ROOT = path.resolve(__dirname, "../../../..");
const DB_PACKAGE = path.resolve(ROOT, "packages/database");
const WORKER_ID = process.env.VITEST_WORKER_ID || "0";
const EXTERNAL_DB_URL =
	process.env.TEST_DATABASE_URL || process.env.DATABASE_URL_BASE;

function run(cmd: string, cwd = ROOT) {
	execSync(cmd, { stdio: "inherit", cwd });
}

async function startTestContainer(): Promise<StartedPostgreSqlContainer> {
	const container = await new PostgreSqlContainer("postgres:16")
		.withDatabase("test")
		.withUsername("test")
		.withPassword("test")
		.start();
	return container;
}

export default async function setup(_ctx: unknown) {
	let baseUrl = EXTERNAL_DB_URL;
	let container: StartedPostgreSqlContainer | undefined;

	if (!baseUrl) {
		container = await startTestContainer();
		baseUrl = container.getConnectionUri();
	}

	if (!baseUrl) {
		throw new Error(
			"TEST_DATABASE_URL or DATABASE_URL_BASE must be set when Testcontainers is unavailable",
		);
	}

	const schema = `test_${Date.now()}_${WORKER_ID}_${randomUUID().replace(/-/g, "")}`;
	const url = new URL(baseUrl);
	url.searchParams.set("schema", schema);

	process.env.DATABASE_URL = url.toString();

	run(
		"pnpm --filter @repo/database exec prisma db push --skip-generate --schema=./prisma/schema.prisma",
		DB_PACKAGE,
	);

	if (!global.__prismaTestState) {
		global.__prismaTestState = new Map();
	}

	global.__prismaTestState.set(WORKER_ID, {
		container,
		schema,
		baseUrl,
	});
}
