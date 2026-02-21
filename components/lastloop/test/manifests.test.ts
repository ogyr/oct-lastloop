#!/usr/bin/env bun
/**
 * Validates all manifest.json and agent .md files in the oct-lastloop repo.
 * Run with: bun test components/lastloop/test/manifests.test.ts
 */
import { describe, test, expect } from "bun:test";
import { existsSync, readFileSync, readdirSync, statSync } from "fs";
import { join, resolve } from "path";

const REPO_ROOT = resolve(import.meta.dir, "../../..");

// --- Registry ---

describe("registry.json", () => {
    const registryPath = join(REPO_ROOT, "registry.json");

    test("exists and is valid JSON", () => {
        expect(existsSync(registryPath)).toBe(true);
        const content = JSON.parse(readFileSync(registryPath, "utf-8"));
        expect(content).toBeDefined();
    });

    test("has required fields", () => {
        const reg = JSON.parse(readFileSync(registryPath, "utf-8"));
        expect(reg.version).toBe("1.0.0");
        expect(Array.isArray(reg.components)).toBe(true);
        expect(Array.isArray(reg.agents)).toBe(true);
    });

    test("all listed components have directories", () => {
        const reg = JSON.parse(readFileSync(registryPath, "utf-8"));
        for (const name of reg.components) {
            const dir = join(REPO_ROOT, "components", name);
            expect(existsSync(dir)).toBe(true);
        }
    });

    test("all listed agents have directories", () => {
        const reg = JSON.parse(readFileSync(registryPath, "utf-8"));
        for (const name of reg.agents) {
            const dir = join(REPO_ROOT, "agents", name);
            expect(existsSync(dir)).toBe(true);
        }
    });
});

// --- Component Manifests ---

describe("component manifests", () => {
    const componentsDir = join(REPO_ROOT, "components");
    const components = readdirSync(componentsDir).filter(d =>
        statSync(join(componentsDir, d)).isDirectory()
    );

    for (const name of components) {
        describe(`components/${name}/manifest.json`, () => {
            const manifestPath = join(componentsDir, name, "manifest.json");

            test("exists and is valid JSON", () => {
                expect(existsSync(manifestPath)).toBe(true);
                const content = JSON.parse(readFileSync(manifestPath, "utf-8"));
                expect(content).toBeDefined();
            });

            test("has required fields", () => {
                const m = JSON.parse(readFileSync(manifestPath, "utf-8"));
                expect(m.name).toBe(name);
                expect(m.componentType).toBeDefined();
                expect(m.displayName).toBeDefined();
                expect(m.description).toBeDefined();
                expect(m.version).toMatch(/^\d+\.\d+\.\d+$/);
                expect(["beta", "rc", "stable", "experimental"]).toContain(m.maturity);
            });

            test("provides field has correct structure", () => {
                const m = JSON.parse(readFileSync(manifestPath, "utf-8"));
                expect(m.provides).toBeDefined();
                const p = m.provides;
                expect(Array.isArray(p.tools)).toBe(true);
                expect(Array.isArray(p.commands)).toBe(true);
                expect(Array.isArray(p.agents)).toBe(true);
                expect(Array.isArray(p.skills)).toBe(true);
                expect(Array.isArray(p.plugins)).toBe(true);
            });

            test("all provided files exist", () => {
                const m = JSON.parse(readFileSync(manifestPath, "utf-8"));
                const p = m.provides;
                const allFiles = [
                    ...p.tools, ...p.commands, ...p.agents,
                    ...p.skills, ...p.plugins,
                ];
                for (const f of allFiles) {
                    const fullPath = join(componentsDir, name, f);
                    expect(existsSync(fullPath)).toBe(true);
                }
                if (p.runtime) {
                    const runtimeDir = join(componentsDir, name, p.runtime);
                    expect(existsSync(runtimeDir)).toBe(true);
                }
            });

            test("dependencies are valid agent/component names", () => {
                const m = JSON.parse(readFileSync(manifestPath, "utf-8"));
                if (m.dependencies && m.dependencies.length > 0) {
                    const reg = JSON.parse(readFileSync(join(REPO_ROOT, "registry.json"), "utf-8"));
                    const allNames = [...reg.components, ...reg.agents];
                    for (const dep of m.dependencies) {
                        expect(allNames).toContain(dep);
                    }
                }
            });
        });
    }
});

// --- Agent Manifests ---

describe("agent manifests", () => {
    const agentsDir = join(REPO_ROOT, "agents");
    if (!existsSync(agentsDir)) return;

    const agents = readdirSync(agentsDir).filter(d =>
        statSync(join(agentsDir, d)).isDirectory()
    );

    for (const name of agents) {
        describe(`agents/${name}`, () => {
            const manifestPath = join(agentsDir, name, "manifest.json");

            test("manifest.json exists and is valid", () => {
                expect(existsSync(manifestPath)).toBe(true);
                const m = JSON.parse(readFileSync(manifestPath, "utf-8"));
                expect(m.name).toBe(name);
                expect(m.componentType).toBe("agent");
                expect(m.version).toMatch(/^\d+\.\d+\.\d+$/);
            });

            test("agent .md file exists", () => {
                const m = JSON.parse(readFileSync(manifestPath, "utf-8"));
                const agentFiles = m.provides?.agents || [];
                expect(agentFiles.length).toBeGreaterThan(0);
                for (const f of agentFiles) {
                    const fullPath = join(agentsDir, name, f);
                    expect(existsSync(fullPath)).toBe(true);
                }
            });

            test("agent .md has valid frontmatter", () => {
                const m = JSON.parse(readFileSync(manifestPath, "utf-8"));
                const agentFile = m.provides?.agents?.[0];
                if (!agentFile) return;

                const content = readFileSync(join(agentsDir, name, agentFile), "utf-8");
                expect(content.startsWith("---")).toBe(true);
                expect(content.includes("description:")).toBe(true);
                expect(content.includes("mode:")).toBe(true);

                // Extract frontmatter
                const fmEnd = content.indexOf("---", 3);
                expect(fmEnd).toBeGreaterThan(3);
                const frontmatter = content.slice(3, fmEnd);
                expect(frontmatter.includes("description")).toBe(true);
            });

            test("docs/ROLE.md exists and is non-empty", () => {
                const rolePath = join(agentsDir, name, "docs", "ROLE.md");
                expect(existsSync(rolePath)).toBe(true);
                const content = readFileSync(rolePath, "utf-8");
                expect(content.length).toBeGreaterThan(100);
            });

            test("docs/KNOWLEDGE.md exists and is non-empty", () => {
                const kbPath = join(agentsDir, name, "docs", "KNOWLEDGE.md");
                expect(existsSync(kbPath)).toBe(true);
                const content = readFileSync(kbPath, "utf-8");
                expect(content.length).toBeGreaterThan(50);
            });
        });
    }
});
