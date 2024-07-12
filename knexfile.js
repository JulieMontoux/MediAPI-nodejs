module.exports = {
  development: {
    client: "sqlite3",
    connection: {
      filename: "./data/mediapi.db",
    },
    pool: {
      min: 2,
      max: 10,
      acquireTimeoutMillis: 30000,
      createTimeoutMillis: 30000,
      destroyTimeoutMillis: 30000,
    },
    useNullAsDefault: true,
  },
};
