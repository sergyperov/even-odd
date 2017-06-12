import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';

import { FindGamePage } from '../pages/findgame/findgame';
import { NewGamePage } from '../pages/newgame/newgame';
import { GamePage } from '../pages/game/game';
import { TabsPage } from '../pages/tabs/tabs';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { GameLogicService } from './gamelogic.service';

@NgModule({
  declarations: [
    MyApp,
    FindGamePage,
    NewGamePage,
		GamePage,
    TabsPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    FindGamePage,
    NewGamePage,
		GamePage,
    TabsPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
		GameLogicService,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
