/**
 * Supertest-like wrapper for Hono app testing
 *
 * Provides a cleaner API for HTTP testing without needing to manually
 * construct Request objects or manage response parsing.
 */

import type { Hono } from "hono";

export interface TestResponse {
	status: number;
	ok: boolean;
	headers: Headers;
	body: any;
	text: string;
}

export class TestRequest {
	private url: string;
	private method: string;
	private headers: Record<string, string> = {};
	private bodyData?: any;
	private app: Hono;

	constructor(app: Hono, method: string, path: string) {
		this.app = app;
		this.method = method;
		// Ensure path starts with /api since that's the basePath
		this.url = `http://localhost${path.startsWith("/api") ? path : `/api${path}`}`;
	}

	set(key: string, value: string): this {
		this.headers[key] = value;
		return this;
	}

	send(data: any): this {
		this.bodyData = data;
		if (!this.headers["content-type"]) {
			this.headers["content-type"] = "application/json";
		}
		return this;
	}

	async expect(
		statusOrAssertion:
			| number
			| ((res: TestResponse) => void | Promise<void>),
	): Promise<TestResponse> {
		const res = await this.execute();

		if (typeof statusOrAssertion === "number") {
			if (res.status !== statusOrAssertion) {
				throw new Error(
					`Expected status ${statusOrAssertion}, got ${res.status}. Body: ${res.text}`,
				);
			}
		} else {
			await statusOrAssertion(res);
		}

		return res;
	}

	private async execute(): Promise<TestResponse> {
		const init: RequestInit = {
			method: this.method,
			headers: this.headers,
		};

		if (this.bodyData) {
			init.body =
				typeof this.bodyData === "string"
					? this.bodyData
					: JSON.stringify(this.bodyData);
		}

		const request = new Request(this.url, init);
		const response = await this.app.fetch(request as any);

		const text = await response.text();
		let body: any;

		try {
			body = JSON.parse(text);
		} catch {
			body = text;
		}

		return {
			status: response.status,
			ok: response.ok,
			headers: response.headers,
			body,
			text,
		};
	}
}

export class TestApp {
	constructor(private app: Hono) {}

	get(path: string): TestRequest {
		return new TestRequest(this.app, "GET", path);
	}

	post(path: string): TestRequest {
		return new TestRequest(this.app, "POST", path);
	}

	put(path: string): TestRequest {
		return new TestRequest(this.app, "PUT", path);
	}

	delete(path: string): TestRequest {
		return new TestRequest(this.app, "DELETE", path);
	}

	patch(path: string): TestRequest {
		return new TestRequest(this.app, "PATCH", path);
	}
}

/**
 * Create a test app wrapper for supertest-like API testing
 *
 * @example
 * ```ts
 * import { createTestApp } from './helpers/supertest-app';
 * import { app } from '../index';
 *
 * const testApp = createTestApp(app);
 *
 * const res = await testApp
 *   .post('/agents/runs')
 *   .send({ runId: 'test-123' })
 *   .expect(200);
 *
 * expect(res.body.status).toBe('accepted');
 * ```
 */
export function createTestApp(app: Hono): TestApp {
	return new TestApp(app);
}
