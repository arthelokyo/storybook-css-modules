# Storybook CSS Modules preset &middot; [![npm package](https://img.shields.io/npm/v/storybook-css-modules?color=green&label=npm&style=flat-square)](https://www.npmjs.com/package/storybook-css-modules) [![npm downloads](https://img.shields.io/npm/dw/storybook-css-modules.svg?style=flat-square)](https://storybook.js.org/addons/storybook-css-modules)

Storybook preset addon to add _CSS Modules_ capabilities to **webpack based** Storybook frameworks.

<br />

## Do I need this addon?

| Setup | Needed? | Why |
| --- | --- | --- |
| `@storybook/react-webpack5`, `@storybook/server-webpack5`, `@storybook/ember`, `@storybook/angular` | **Yes** | Storybook's webpack builder processes `.css` files without any CSS Modules configuration. |
| Any Vite framework (`@storybook/react-vite`, `@storybook/vue3-vite`, `@storybook/nextjs-vite`, …) | No | Vite supports CSS Modules natively. The addon does nothing there and can be uninstalled. |
| `@storybook/nextjs` | No | It reuses your Next.js CSS pipeline, which already handles CSS Modules. The addon detects this and stays out of the way. |

<br />

## Compatibility

| Addon version | Storybook | Notes |
| --- | --- | --- |
| `2.x` | 6.5 → 11 | Ships both ESM and CommonJS builds. |
| `1.x` | 6.4 → 9 | CommonJS only. Class names break on Storybook 10+ because of css-loader 7. |

Every supported major is verified on each release by `npm run test:compat`, which builds a real Storybook for Storybook 6.5, 7, 8, 9, 10 and 11 and asserts the generated class names.

<br />

## Installation

```sh
npm install -D storybook-css-modules
```

Next, register the addon in `.storybook/main.js`:

```js
// .storybook/main.js (Storybook 10 and 11)

export default {
  stories: [
    // ...
  ],
  addons: [
    // Other Storybook addons

    "storybook-css-modules", // 👈 The addon registered here
  ],
};
```

On Storybook 9 and earlier, use CommonJS instead:

```js
// .storybook/main.js (Storybook 6.5 to 9)

module.exports = {
  addons: ["storybook-css-modules"],
};
```

<br />

## Configuration

By default this preset configures _CSS Modules_ with these options:

```json
{
  "importLoaders": 1,
  "modules": {
    "localIdentName": "[path][name]__[local]--[hash:base64:5]",
    "namedExport": false,
    "exportLocalsConvention": "asIs"
  }
}
```

`namedExport: false` and `exportLocalsConvention: "asIs"` keep `import styles from "./Button.module.css"` working and class names untouched. They matter on Storybook 10 and 11, which ship css-loader 7, where named exports are the default.

If you need different options, override them in `.storybook/main.js` with _cssModulesLoaderOptions_. Your `modules` object is merged on top of the defaults, so you only need to specify what you want to change:

```js
// .storybook/main.js

import { getLocalIdentName } from "css-loader-shorter-classnames";

const getLocalIdent = getLocalIdentName();

export default {
  addons: [
    {
      name: "storybook-css-modules",
      options: {
        cssModulesLoaderOptions: {
          importLoaders: 1,
          modules: {
            getLocalIdent,
          },
        },
      },
    },
  ],
};
```

<br />

## Usage

This Storybook addon automatically imports all _*.module.css_ files as CSS Modules using the specified options.

```js
// Button.stories.jsx

import Button from "./Button.jsx";
import styles from "./Button.module.css";

export default {
  title: "Button",
  component: Button,
};

// Story using CSS Modules
export const WithCSSModules = {
  args: {
    className: styles.Button, // 👈
  },
};
```

```css
/* Button.module.css */

.Button {
  background: #000;
  color: #fff;
  border: 1px solid #000;
  height: 36px;
  padding: 5px 10px;
}
```

<br />

## Examples

- [React](https://github.com/arthelokyo/storybook-css-modules/tree/main/examples/react)

The Preact and Vue 3 examples were removed in `2.0.0`: since Storybook 9 those frameworks are only available with the Vite builder, where CSS Modules work natively.

<br />

## Migrating from 1.x

`2.0.0` is a maintenance release. There are no configuration changes and class names are unchanged on Storybook 6.5 to 9.

- The addon is now published as ESM and CommonJS, so it loads on Storybook 10 and 11.
- `import styles from "./x.module.css"` works again on Storybook 10 and 11 (css-loader 7 defaults to named exports).
- `cssModulesLoaderOptions.modules` is now deep merged with the defaults instead of replacing them.
- The addon no longer touches the webpack config when the framework already configures CSS Modules, such as `@storybook/nextjs`.
- The dead Vue 3 code path was removed. Vue 3 has no webpack builder since Storybook 9.

<br />

## Contributing

Storybook CSS Modules preset is an open-source project. We are committed to a fully transparent development process and appreciate highly any contributions. Whether you are helping us fix bugs, proposing new features, improving our documentation or spreading the word - we would love to have you as part of the community.

Please refer to our [Contribution Guidelines](https://github.com/arthelokyo/storybook-css-modules/blob/main/CONTRIBUTING.md).

## License

Storybook CSS Modules preset is licensed under the MIT license — see the [LICENSE](https://github.com/arthelokyo/storybook-css-modules/blob/main/LICENSE) file for details.

## Acknowledgements

Initially created by [Arthelokyo](https://github.com/arthelokyo) and maintained by a community of [contributors](https://github.com/arthelokyo/storybook-css-modules/graphs/contributors).
