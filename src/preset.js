const DEFAULT_CSS_MODULES_LOADER_OPTIONS = {
  importLoaders: 1,
  modules: {
    localIdentName: "[path][name]__[local]--[hash:base64:5]",
    // css-loader v7 (Storybook 10+) enables named exports by default, which
    // breaks `import styles from "./x.module.css"`. Keep the classic default
    // import working, and keep class names untouched (css-loader would switch
    // to camelCase once named exports are disabled).
    namedExport: false,
    exportLocalsConvention: "asIs",
  },
};

const CSS_TEST = "/\\.css$/";
const CSS_MODULES_TEST = /\.module\.css$/;
const CSS_LOADER = /[/\\]css-loader/;

const isCssLoader = (item) =>
  typeof item === "object" && item !== null && typeof item.loader === "string" && CSS_LOADER.test(item.loader);

const warn = (message) => {
  // eslint-disable-next-line no-console
  console.warn(`storybook-css-modules: ${message}`);
};

const mergeLoaderOptions = (base, overrides) => ({
  ...base,
  ...overrides,
  modules: {
    ...(typeof base.modules === "object" && base.modules !== null ? base.modules : {}),
    ...(typeof overrides.modules === "object" && overrides.modules !== null ? overrides.modules : {}),
  },
});

export async function webpackFinal(config = {}, options = {}) {
  const { module = {} } = config;
  const { cssModulesLoaderOptions } = options;
  const hasUserOptions = typeof cssModulesLoaderOptions === "object" && cssModulesLoaderOptions !== null;

  const rules = module.rules || [];
  const cssLoaderRule = rules.find((rule) => rule && rule.test && rule.test.toString() === CSS_TEST);

  if (!cssLoaderRule || !Array.isArray(cssLoaderRule.use)) {
    warn(
      "no `/\\.css$/` webpack rule was found, so CSS Modules were not configured. " +
        "This addon only applies to webpack based Storybook frameworks; Vite based ones support CSS Modules natively."
    );
    return config;
  }

  const currentCssLoader = cssLoaderRule.use.find(isCssLoader);

  if (!currentCssLoader) {
    warn("the `/\\.css$/` webpack rule does not use css-loader, so CSS Modules were not configured.");
    return config;
  }

  const alreadyConfigured =
    typeof currentCssLoader.options === "object" &&
    currentCssLoader.options !== null &&
    currentCssLoader.options.modules !== undefined &&
    currentCssLoader.options.modules !== false;

  if (alreadyConfigured && !hasUserOptions) {
    warn(
      "CSS Modules are already configured by your Storybook framework (for instance @storybook/nextjs), " +
        "so this addon did nothing. You can safely uninstall it, or pass `cssModulesLoaderOptions` to override the configuration."
    );
    return config;
  }

  const loaderOptions = mergeLoaderOptions(
    DEFAULT_CSS_MODULES_LOADER_OPTIONS,
    hasUserOptions ? cssModulesLoaderOptions : {}
  );

  const newRules = rules.map((rule) =>
    rule === cssLoaderRule
      ? { ...rule, exclude: rule.exclude ? [].concat(rule.exclude, CSS_MODULES_TEST) : CSS_MODULES_TEST }
      : rule
  );

  newRules.push({
    ...cssLoaderRule,
    test: CSS_MODULES_TEST,
    use: cssLoaderRule.use.map((item) =>
      isCssLoader(item) ? { ...item, options: { ...item.options, ...loaderOptions } } : item
    ),
  });

  return {
    ...config,
    module: {
      ...module,
      rules: newRules,
    },
  };
}

export default { webpackFinal };
