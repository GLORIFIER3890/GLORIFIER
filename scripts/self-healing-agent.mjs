#!/usr/bin/env node
/**
 * Diagnostic-only self-healing entry point.
 * It may inspect and validate the workspace, but must never discard changes,
 * invoke an autonomous code writer, create commits, push refs, or deploy.
 * Remediation must be proposed on a dedicated branch and reviewed.
 */
import { execFileSync } from 'node:child_process';

const run = (cmd, args = []) => {
  try {
    return { ok: true, output: execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }) };
  } catch (error) {
    return { ok: false, output: String(error.stdout || "") + "\n" + String(error.stderr || error.message || error) };
  }
};

const repo = process.env.GITHUB_REPOSITORY || 'GLORIFIER7/GLORIFIER';
const status = run('git', ['status', '--short']);
const lint = run('npm', ['run', 'lint']);
const build = lint.ok ? run('npm', ['run', 'build']) : { ok: false, output: 'Build skipped because lint failed.' };

const report = {
  repository: repo,
  mode: "diagnostic-only",
  cleanWorkspace: status.ok && status.output.trim().length === 0,
  workspaceStatus: status.output,
  lint: { ok: lint.ok, output: lint.output.slice(-6000) },
  build: { ok: build.ok, output: build.output.slice(-6000) },
  remediation: { executed: false, commitCreated: false, pushAttempted: false, deploymentAttempted: false, nextStep: "Create a minimal change on a dedicated branch and submit a pull request for review." },
};

console.log("GLORIFIER_SELF_HEAL_DIAGNOSTIC_ONLY");
console.log(JSON.stringify(report, null, 2));

if (!lint.ok || !build.ok) {
  console.error("GLORIFIER_DIAGNOSTIC_FAILED: no automated repair was attempted.");
  process.exit(1);
}
console.log("GLORIFIER_DIAGNOSTIC_OK: workspace checks passed; no changes were made.");
