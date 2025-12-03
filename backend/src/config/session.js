import session from 'express-session';
import MySQLStore from 'express-mysql-session';
import { config } from './env.js';

const MySQLSessionStore = MySQLStore(session);

const sessionStore = new MySQLSessionStore({
  host: config.db.host,
  port: config.db.port || 3306,
  user: config.db.user,
  password: config.db.password,
  database: config.db.name,
  clearExpired: true,
  checkExpirationInterval: 900000,
  expiration: 86400000,
  createDatabaseTable: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
});

export const sessionConfig = {
  key: 'mitikas_session',
  secret: config.session.secret,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000, // 24 horas
    httpOnly: true,
    secure: false, // Cambiar a true en producción con HTTPS
    sameSite: 'lax'
  }
};