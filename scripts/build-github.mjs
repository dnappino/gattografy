import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const distDir = path.join(root, "dist");
const mobileDistDir = path.join(root, "mobile-dist");
const mobileTarget = path.join(distDir, "mobile");

execSync("vite build --base=/gattografy/", { stdio: "inherit", cwd: root });
execSync("vite build --config mobile/vite.config.mjs", { stdio: "inherit", cwd: root });

fs.rmSync(mobileTarget, { recursive: true, force: true });
fs.mkdirSync(mobileTarget, { recursive: true });
fs.cpSync(mobileDistDir, mobileTarget, { recursive: true });

