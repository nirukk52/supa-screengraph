#!/usr/bin/env ts-node

import { execSync } from "node:child_process";

function sh(cmd: string): string {
  return execSync(cmd, { stdio: ["pipe", "pipe", "ignore"] }).toString().trim();
}

function main() {
  const base = process.env.GITHUB_BASE_REF || sh("git merge-base HEAD origin/main || echo $(git rev-parse --short HEAD^)");
  const filesRaw = sh(`git diff --name-only ${base}...HEAD`);
  const files = filesRaw.split("\n").filter(Boolean);
  const testFiles = new Set<string>();

  for (const f of files) {
    if (f.endsWith(".spec.ts") || f.endsWith(".spec.tsx")) {
      testFiles.add(f);
      continue;
    }
    // Simple heuristic: map src/foo/bar.ts -> tests/**/*bar*.spec.ts
    const name = f.split("/").pop() || "";
    const baseName = name.replace(/\.(ts|tsx)$/, "");
    if (!baseName) {
      continue;
    }
    // Collect co-located tests
    testFiles.add(`**/${baseName}.spec.ts`);
    testFiles.add(`**/${baseName}.spec.tsx`);
  }

  if (testFiles.size === 0) {
    console.log("NO_AFFECTED");
    return;
  }
  console.log(Array.from(testFiles).join("\n"));
}

main();


