import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { InstagramService } from './instagram.service';
import { BotUpdate } from './bot.update';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TelegrafModule.forRootAsync({
      useFactory: (configService: ConfigService) => {
        const token = configService.get<string>('BotToken');
        if (!token) {
          throw new Error('BotToken is not defined in .env');
        }
        return { token };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AppController],
  providers: [AppService, InstagramService, BotUpdate],
})
export class AppModule { }
