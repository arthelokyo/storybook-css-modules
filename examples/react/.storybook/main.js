/** @type {import('@storybook/react-webpack5').StorybookConfig} */
const config = {
  stories: ["../stories/**/*.stories.@(js|jsx|ts|tsx)"],
  addons: [
    "@storybook/addon-webpack5-compiler-swc",
    "@storybook/addon-docs",

    // Basic addon initialization
    "storybook-css-modules",

    // Initialization with options
    // {
    //   name: "storybook-css-modules",
    //   options: {
    //     cssModulesLoaderOptions: {
    //       importLoaders: 1,
    //       modules: {
    //         localIdentName: "[hash:base64:5]",
    //       },
    //     },
    //   },
    // },
  ],
  framework: {
    name: "@storybook/react-webpack5",
    options: {},
  },
};

export default config;
