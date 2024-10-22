import { Injectable } from '@angular/core';
import { AppConfigService } from '../configs/app-config.service';

export enum LogLevel {
  'debug',
  'info',
  'log',
  'warn',
  'error'
}

export class LogConfigException extends Error {
  name = 'LogConfigException';

  constructor(message?: string) {
    super(message);
  }
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  private static _defaultLogLevel: LogLevel = LogLevel.log;

  private static _minLogLevel: LogLevel = LogLevel.log;
  public static get defaultLogLevel(): LogLevel {
    return LoggingService._defaultLogLevel;
  }
  public static get minLogLevel(): LogLevel {
    return LoggingService._minLogLevel;
  }

  /**
   * Function to log a string on the console, conditionally to configurations set in the
   * config file.
   * @param message the string to log;
   * @param level optional - the priority level of this log action, default level is "log";
   */
  static log(message: string, level?: LogLevel, object?: any): void {
    if (!message) {
      return;
    }

    // Coalescing optional parameter
    const selectedLevel = level ?? LoggingService.defaultLogLevel;
    const timestamp: string = '[ ' + new Date(Date.now()).toLocaleString() + ' ]';
    // message = timestamp + '\n' + message;

    // If logging on console is enabled...
    if (AppConfigService.settings.logging.console) {
      // And this log action has a level above the minLogLevel set on configs...
      if (selectedLevel >= LoggingService.minLogLevel) {
        // Log the message with the leading timestamp with the correct console level.
        switch (selectedLevel) {
          case LogLevel.debug:
            console.debug(timestamp, message, object);
            break;
          case LogLevel.info:
            console.info(timestamp, message, object);
            break;
          case LogLevel.log:
            console.log(timestamp, message, object);
            break;
          case LogLevel.warn:
             console.warn(timestamp, message, object);
             break;
          case LogLevel.error:
            console.error(timestamp, message, object);
            break;

          // Default case should be unreachable code, added for defensive programming...
          default:
            console.log(message);
            break;
        }
      }
    }
  }

  /**
   * Setup function of the logging service, called on the app start,
   * this function load the configuration of the lower level from then on we are interested to log.
   * this settings is set in the configs file.
   */
  static setup(): void {
    const configMinLogLevel = AppConfigService.settings.logging.minLevel as string;
    switch (configMinLogLevel.toLowerCase()) {
      case 'debug':
        LoggingService._minLogLevel = LogLevel.debug;
        break;
      case 'info':
        LoggingService._minLogLevel = LogLevel.info;
        break;
      case 'log':
        LoggingService._minLogLevel = LogLevel.log;
        break;
      case 'warn':
        LoggingService._minLogLevel = LogLevel.warn;
        break;
      case 'err':
        LoggingService._minLogLevel = LogLevel.error;
        break;

      default:
        throw new LogConfigException('Check min log level value on config json file, allowed value are: "debug","info","log","warn","err".\n'
          + 'Min log level will fallback to default "log" level');
        break;
    }
    console.log('Min log level set to: ' + configMinLogLevel);
  }
}
