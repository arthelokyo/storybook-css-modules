#!/usr/bin/env node
/**
 * Compatibility matrix for storybook-css-modules.
 *
 * Builds a minimal React + webpack5 Storybook for every supported major and
 * asserts that `import styles from "./Button.module.css"` produces readable,
 * configurable class names. Run it with `npm run test:compat`, optionally
 * filtering majors: `npm run test:compat -- 10 11`.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, writeFileSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const MATRIX = [
  {
    id: "6",
    title: "Storybook 6.5 (webpack5 builder)",
    esm: false,
    deps: {
      "@storybook/react": "^6.5.16",
      "@storybook/builder-webpack5": "^6.5.16",
      "@storybook/manager-webpack5": "^6.5.16",
      react: "^17.0.2",
      "react-dom": "^17.0.2",
    },
    build: ["build-storybook", "--quiet"],
    main: (addons) => ({
      stories: ["../stories/**/*.stories.jsx"],
      addons,
      framework: "@storybook/react",
      core: { builder: "webpack5" },
    }),
  },
  {
    id: "7",
    title: "Storybook 7",
    esm: false,
    deps: {
      storybook: "^7.6.24",
      "@storybook/react": "^7.6.24",
      "@storybook/react-webpack5": "^7.6.24",
      react: "^18.3.1",
      "react-dom": "^18.3.1",
    },
    build: ["storybook", "build", "--quiet"],
    main: (addons) => ({
      stories: ["../stories/**/*.stories.jsx"],
      addons,
      framework: { name: "@storybook/react-webpack5", options: {} },
    }),
  },
  {
    id: "8",
    title: "Storybook 8",
    esm: false,
    deps: {
      storybook: "^8.6.14",
      "@storybook/react": "^8.6.14",
      "@storybook/react-webpack5": "^8.6.14",
      "@storybook/addon-webpack5-compiler-swc": "^1.0.5",
      react: "^18.3.1",
      "react-dom": "^18.3.1",
    },
    build: ["storybook", "build", "--quiet"],
    main: (addons) => ({
      stories: ["../stories/**/*.stories.jsx"],
      addons: ["@storybook/addon-webpack5-compiler-swc", ...addons],
      framework: { name: "@storybook/react-webpack5", options: {} },
    }),
  },
  {
    id: "9",
    title: "Storybook 9",
    esm: false,
    deps: {
      storybook: "^9.1.20",
      "@storybook/react-webpack5": "^9.1.20",
      "@storybook/addon-webpack5-compiler-swc": "^3.0.0",
      react: "^18.3.1",
      "react-dom": "^18.3.1",
    },
    build: ["storybook", "build", "--quiet"],
    main: (addons) => ({
      stories: ["../stories/**/*.stories.jsx"],
      addons: ["@storybook/addon-webpack5-compiler-swc", ...addons],
      framework: { name: "@storybook/react-webpack5", options: {} },
    }),
  },
  {
    id: "10",
    title: "Storybook 10",
    esm: true,
    deps: {
      storybook: "^10.6.0",
      "@storybook/react-webpack5": "^10.6.0",
      "@storybook/addon-webpack5-compiler-swc": "^4.0.3",
      react: "^18.3.1",
      "react-dom": "^18.3.1",
    },
    build: ["storybook", "build", "--quiet"],
    main: (addons) => ({
      stories: ["../stories/**/*.stories.jsx"],
      addons: ["@storybook/addon-webpack5-compiler-swc", ...addons],
      framework: { name: "@storybook/react-webpack5", options: {} },
    }),
  },
  {
    id: "11",
    title: "Storybook 11 (prerelease)",
    esm: true,
    legacyPeerDeps: true,
    deps: {
      storybook: "next",
      "@storybook/react-webpack5": "next",
      "@storybook/addon-webpack5-compiler-swc": "^4.0.3",
      react: "^18.3.1",
      "react-dom": "^18.3.1",
    },
    build: ["storybook", "build", "--quiet"],
    main: (addons) => ({
      stories: ["../stories/**/*.stories.jsx"],
      addons: ["@storybook/addon-webpack5-compiler-swc", ...addons],
      framework: { name: "@storybook/react-webpack5", options: {} },
    }),
  },
];

const BUTTON_CSS = `.button {\n  color: #fff;\n  background-color: #1ea7fd;\n  padding: 11px 20px;\n}\n`;
const BUTTON_STORIES = `import React from "react";
import styles from "./Button.module.css";

const Button = ({ label }) => <button className={styles.button}>{label}</button>;

export default { title: "Example/Button", component: Button };

export const Primary = () => <Button label="Button" />;
`;

const run = (cmd, args, cwd) =>
  execFileSync(cmd, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });

const pack = () => {
  run("npm", ["run", "build"], root);
  const out = run("npm", ["pack", "--pack-destination", tmpdir()], root).trim().split("\n").pop();
  return join(tmpdir(), out);
};

const scaffold = (target, testCase, tarball, addons) => {
  mkdirSync(join(target, ".storybook"), { recursive: true });
  mkdirSync(join(target, "stories"), { recursive: true });

  writeFileSync(
    join(target, "package.json"),
    JSON.stringify(
      {
        name: `compat-sb${testCase.id}`,
        version: "1.0.0",
        private: true,
        ...(testCase.esm ? { type: "module" } : {}),
        devDependencies: { ...testCase.deps, "storybook-css-modules": `file:${tarball}` },
      },
      null,
      2
    )
  );

  const config = testCase.main(addons);
  writeFileSync(
    join(target, ".storybook/main.js"),
    testCase.esm
      ? `export default ${JSON.stringify(config, null, 2)};\n`
      : `module.exports = ${JSON.stringify(config, null, 2)};\n`
  );

  writeFileSync(join(target, "stories/Button.module.css"), BUTTON_CSS);
  writeFileSync(join(target, "stories/Button.stories.jsx"), BUTTON_STORIES);
};

const bundleText = (dir) =>
  readdirSync(dir)
    .filter((file) => file.endsWith(".js"))
    .map((file) => readFileSync(join(dir, file), "utf8"))
    .join("\n");

const check = (testCase, tarball, { addons, expect, label }) => {
  const target = mkdtempSync(join(tmpdir(), `sbcssmod-${testCase.id}-`));
  try {
    scaffold(target, testCase, tarball, addons);
    const installArgs = ["install", "--no-audit", "--no-fund"];
    if (testCase.legacyPeerDeps) installArgs.push("--legacy-peer-deps");
    run("npm", installArgs, target);
    run("npx", testCase.build, target);

    const text = bundleText(join(target, "storybook-static"));
    const found = expect.test(text);
    console.log(`  ${found ? "✔" : "✘"} ${label}`);
    return found;
  } catch (error) {
    console.log(`  ✘ ${label}\n     ${(error.stderr || error.stdout || error.message).toString().trim().split("\n").slice(-6).join("\n     ")}`);
    return false;
  } finally {
    rmSync(target, { recursive: true, force: true });
  }
};

const only = process.argv.slice(2);
const cases = only.length ? MATRIX.filter((c) => only.includes(c.id)) : MATRIX;

console.log("Packing storybook-css-modules…");
const tarball = pack();
console.log(`Using ${tarball}\n`);

let failures = 0;
for (const testCase of cases) {
  console.log(testCase.title);
  const ok =
    check(testCase, tarball, {
      addons: ["storybook-css-modules"],
      expect: /stories-Button-module__button--/,
      label: "default options produce readable class names",
    }) &
    check(testCase, tarball, {
      addons: [
        {
          name: "storybook-css-modules",
          options: { cssModulesLoaderOptions: { modules: { localIdentName: "custom-[local]" } } },
        },
      ],
      expect: /custom-button/,
      label: "cssModulesLoaderOptions override is applied",
    });
  if (!ok) failures += 1;
  console.log("");
}

rmSync(tarball, { force: true });

if (failures) {
  console.error(`${failures} Storybook version(s) failed.`);
  process.exit(1);
}
console.log("All checked Storybook versions work.");
