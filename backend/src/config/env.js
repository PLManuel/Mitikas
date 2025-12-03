import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,

  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'mitikas',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306
  },

  session: {
    secret: process.env.SESSION_SECRET || 'default_secret_change_in_production'
  }
};
