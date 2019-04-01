class Logger {
  private static _instance: Logger;

  public static getInstance(): Logger {
    if (typeof Logger._instance === "undefined") {
      Logger._instance = new Logger();
    }
    return Logger._instance;
  }

  private date: Date;

  private constructor() {}

  info(msg: string) {
    this.date = new Date();
    console.log(`[INFO][${this.date.getHours()}:${this.date.getMinutes()}:${this.date.getSeconds()}] ${msg}`);
  }
}

export default Logger.getInstance();