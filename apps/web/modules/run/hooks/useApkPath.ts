import { useEffect, useState } from "react";

export function useApkPath(runId: string) {
	const [apkPath, setApkPath] = useState<string | null>(null);

	useEffect(() => {
		if (typeof window === "undefined") {
			return;
		}

		setApkPath(window.localStorage.getItem(`run_${runId}_apkPath`));
	}, [runId]);

	return apkPath;
}
