import dotenv from 'dotenv';

dotenv.config({});

class Config {
  public NODE_ENV: string;
  public NEXTAUTH_SECRET: string;
  public NEXTAUTH_URL: string;
  public EDGE_STORE_ACCESS_KEY: string;
  public EDGE_STORE_SECRET_KEY: string;
  public GOOGLE_CLIENT_ID: string;
  public GOOGLE_CLIENT_SECRET: string;
  public OPENAI_API_KEY: string;
  public DATABASE_URL: string;
  public BREVO_API_KEY: string;
  public SENDER_EMAIL: string;
  public SENDER_NAME: string;
  public IS_PRODUCTION: boolean;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || '';
    this.NEXTAUTH_URL = process.env.NEXTAUTH_URL || '';
    this.EDGE_STORE_ACCESS_KEY = process.env.EDGE_STORE_ACCESS_KEY || '';
    this.EDGE_STORE_SECRET_KEY = process.env.EDGE_STORE_SECRET_KEY || '';
    this.GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
    this.GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
    this.OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
    this.DATABASE_URL = process.env.DATABASE_URL || '';
    this.BREVO_API_KEY = process.env.BREVO_API_KEY || '';
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
    this.SENDER_NAME = process.env.SENDER_NAME || '';
    this.IS_PRODUCTION = this.NODE_ENV === 'production';

    this.validateConfig();
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined || value === 0) {
        throw new Error(`Configuration ${key} is undefined.`);
      }
    }
  }
}

const config: Config = new Config();

export default config;