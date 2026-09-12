import { Button } from "./Button.jsx";

export default {
  title: "Example/Button",
  component: Button,
  argTypes: {
    primary: { control: "boolean" },
    size: { control: "select", options: ["small", "medium", "large"] },
    backgroundColor: { control: "color" },
    onClick: { action: "onClick" },
  },
  args: {
    label: "Button",
    size: "medium",
  },
};

export const Primary = { args: { primary: true } };

export const Secondary = {};

export const Large = { args: { size: "large" } };

export const Small = { args: { size: "small" } };
