import { redirect } from "next/navigation";

export default function RunIndexPage() {
	// Redirect to a default test run ID
	const defaultRunId = "test-run-default";
	redirect(`/run/${defaultRunId}`);
}
