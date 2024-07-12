module.exports = {
    development: {
      client: 'sqlite3',
      connection: {
        filename: './data/mediapi.db'
      },
      pool: {
        min: 2,
        max: 10,
        acquireTimeoutMillis: 30000, // 30 seconds
        createTimeoutMillis: 30000, // 30 seconds
        destroyTimeoutMillis: 30000, // 30 seconds
      },    
      useNullAsDefault: true
    }
  };
  