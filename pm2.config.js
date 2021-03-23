module.exports = {
  apps: [
    {
      name: "gateway",
      script: "./gateway/dist/main.js",
    },
    {
      name: "user",
      script: "./user/dist/main.js",
    },
  ],
};
