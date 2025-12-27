import sql from "mssql";

let poolPromise = null;

function boolEnv(name, defVal = false) {
  const v = process.env[name];
  if (v === undefined) return defVal;
  return ["1", "true", "yes", "y", "on"].includes(String(v).trim().toLowerCase());
}

export async function getPool() {
  if (!poolPromise) {
    const config = {
      server: process.env.DB_SERVER,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      options: {
        encrypt: boolEnv("DB_ENCRYPT", false),
        trustServerCertificate: boolEnv("DB_TRUST_SERVER_CERT", true),
      },
      pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
      },
    };

    poolPromise = sql.connect(config);
  }
  return poolPromise;
}

export { sql };
