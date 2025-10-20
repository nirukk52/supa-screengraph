import { RunStreamViewer } from "@run/components";
import type { Metadata } from "next";

interface RunPageProps {
	params: Promise<{
		runId: string;
	}>;
}

export async function generateMetadata({
	params,
}: RunPageProps): Promise<Metadata> {
	const { runId } = await params;
	return {
		title: `Run ${runId}`,
	};
}

export default async function RunPage({ params }: RunPageProps) {
	const { runId } = await params;

	return (
		<div className="container mx-auto p-6">
			<div className="mb-6">
				<h1 className="font-bold text-2xl md:text-3xl">Agent Run</h1>
				<p className="mt-2 text-foreground/60">
					Real-time event stream viewer
				</p>
			</div>

			<RunStreamViewer runId={runId} />
		</div>
	);
}
