export class ConfigService {
  private readonly envConfig: { [key: string]: any } = null;

  constructor() {
    this.envConfig = {
      port: process.env.USER_SERVICE_PORT,
    };
    this.envConfig.frontendUrl = process.env.FRONTEND_URL;
    this.envConfig.gatewayPort = process.env.API_GATEWAY_PORT;
  }

  get(key: string): any {
    return this.envConfig[key];
  }
}
