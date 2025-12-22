import packageJson from "../../package.json";

const currentYear = new Date().getFullYear();

export const APP_CONFIG = {
  name: "CANary Desktop Cloud",
  version: packageJson.version,
  copyright: `© ${currentYear}, CANary Desktop Cloud.`,
  meta: {
    title: "CANary Desktop Cloud - Internal BFE Portal",
    description:
      "CANary Desktop Cloud is an internal portal for managing and sharing CAN bus logs and files within the BFE team.",
  },
};
