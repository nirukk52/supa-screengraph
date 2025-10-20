import { expect, test } from "@playwright/test";

test.describe("App Config → Run Stream Flow", () => {
	test("should launch run and auto-connect to stream from app-config tab", async ({
		page,
	}) => {
		// Navigate to login page
		await page.goto("/auth/login");

		// Wait for page to load
		await expect(
			page.getByRole("heading", { name: /login/i }),
		).toBeVisible();

		// Click on "App Config" tab
		await page.getByRole("tab", { name: "App Config" }).click();

		// Verify APK path input is visible
		const apkInput = page.getByLabel("APK Path");
		await expect(apkInput).toBeVisible();

		// Enter APK path
		const testApkPath = "/path/to/test-app.apk";
		await apkInput.fill(testApkPath);

		// Intercept the POST /api/agents/runs/start request
		const launchPromise = page.waitForResponse(
			(response) =>
				response.url().includes("/api/agents/runs/start") &&
				response.request().method() === "POST",
		);

		// Click Connect button
		await page.getByRole("button", { name: "Connect" }).click();

		// Verify the launch request was made with correct payload
		const launchResponse = await launchPromise;
		expect(launchResponse.status()).toBe(200);

		const launchBody = await launchResponse.json();
		expect(launchBody).toHaveProperty("runId");
		expect(launchBody).toHaveProperty("streamPath");
		expect(launchBody.streamPath).toContain("/api/agents/runs/");
		expect(launchBody.streamPath).toContain("/stream");

		// Verify navigation to /run/{runId}
		await expect(page).toHaveURL(/\/run\/run_\d+_[a-z0-9]+/);

		// Extract runId from URL
		const url = page.url();
		const runId = url.split("/run/")[1];
		expect(runId).toMatch(/^run_\d+_[a-z0-9]+$/);

		// Verify Run Overview section is visible
		await expect(
			page.getByRole("heading", { name: "Run Overview" }),
		).toBeVisible();

		// Verify runId badge is displayed
		await expect(page.getByText(runId)).toBeVisible();

		// Verify APK path is displayed
		await expect(page.getByText("APK Path")).toBeVisible();
		await expect(page.getByText(testApkPath)).toBeVisible();

		// Verify status shows connecting or streaming
		await expect(page.getByText(/connecting|streaming/i)).toBeVisible({
			timeout: 5000,
		});

		// Verify control buttons are present
		await expect(
			page.getByRole("button", { name: /start run/i }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /connect only/i }),
		).toBeVisible();
		await expect(
			page.getByRole("button", { name: /disconnect/i }),
		).toBeVisible();

		// Verify events panel is visible
		await expect(page.getByText("Event Stream")).toBeVisible();

		// If stream is working, we should see events or "No events yet" message
		const hasEvents = await page
			.getByText(/event \d+/i)
			.isVisible()
			.catch(() => false);
		const hasNoEventsMsg = await page
			.getByText(/no events/i)
			.isVisible()
			.catch(() => false);

		expect(hasEvents || hasNoEventsMsg).toBe(true);
	});

	test("should validate APK path is required", async ({ page }) => {
		await page.goto("/auth/login");

		// Click on "App Config" tab
		await page.getByRole("tab", { name: "App Config" }).click();

		// Try to submit without entering APK path
		await page.getByRole("button", { name: "Connect" }).click();

		// Should show validation error (form won't submit)
		// The form should still be on the login page
		await expect(page).toHaveURL(/\/auth\/login/);

		// Verify we're still on login page (not navigated)
		await expect(
			page.getByRole("heading", { name: /login/i }),
		).toBeVisible();
	});

	test("should allow switching between auth modes", async ({ page }) => {
		await page.goto("/auth/login");

		// Start with password mode (or magic-link depending on config)
		const passwordTab = page.getByRole("tab", {
			name: /password|magic link/i,
		});
		if (await passwordTab.isVisible()) {
			await passwordTab.click();

			// Should show email input
			await expect(page.getByLabel(/email/i)).toBeVisible();
		}

		// Switch to App Config
		await page.getByRole("tab", { name: "App Config" }).click();

		// Should show APK path input and hide email
		await expect(page.getByLabel("APK Path")).toBeVisible();
		const emailInput = page.getByLabel(/email/i);
		if (await emailInput.isVisible().catch(() => false)) {
			expect(await emailInput.isVisible()).toBe(false);
		}

		// Switch back
		const firstTab = page.getByRole("tab", {
			name: /password|magic link/i,
		});
		if (await firstTab.isVisible()) {
			await firstTab.click();
			await expect(page.getByLabel(/email/i)).toBeVisible();
		}
	});
});
