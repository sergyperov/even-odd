import { Component } from '@angular/core';

import { FindGamePage } from '../findgame/findgame';
import { NewGamePage } from '../newgame/newgame';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {

  tab1Root = NewGamePage;
  tab2Root = FindGamePage;

  constructor() {

  }
}
