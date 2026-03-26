module.exports = {
  apps: [
    {
      exec_mode: "cluster",
      instances: 1,
      name: "Edms",
      port: "3443",
      script: "./.output/server/index.mjs",
      watch: true,
    },
  ],
};
