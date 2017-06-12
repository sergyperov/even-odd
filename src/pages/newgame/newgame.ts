import { Component } from '@angular/core';
import { NavController, ModalController, AlertController } from 'ionic-angular';
import { GameLogicService } from '../../app/gamelogic.service';
import { GamePage } from '../game/game'

@Component({
  selector: 'page-newgame',
  templateUrl: 'newgame.html'
})

export class NewGamePage {
	private newGameParams: any;				// параметры создаваемой игры
  constructor(public navCtrl: NavController, public modalCtrl: ModalController, private gameLogic: GameLogicService, private alertCtrl: AlertController) {
		this.newGameParams = {
			requiredPlayersCount: 2,
			playerName: ""
		}
	}

	/**
	 *  Попытаться начать игру
	 *  Для этого нужно, чтобы имя игрока было не пустым
	 */
	private startGame() {
		// если имя игрока пустое, показать предупреждение
		if ((this.newGameParams.playerName.length == 0) || (!this.newGameParams.playerName.replace(/\s/g, '').length)) {
			let alert = this.alertCtrl.create({
    		title: 'Ошибка',
    		subTitle: 'Пожалуйста, укажите имя',
    		buttons: ['ОК']
  		});
  		alert.present();
			return;
		}

		// добавить игру, а потом добавить самого игрока в эту игру, открыть страницу игры
		this.gameLogic.addGame(this.newGameParams.requiredPlayersCount).then((gameKey) => {
			let profileModal = this.modalCtrl.create(GamePage, {"gameKey": gameKey});
			this.gameLogic.connectToGame(gameKey, this.newGameParams.playerName)
			profileModal.present();
		});
	}

  /**
	 *  Уменьшить необходимое количество игроков
	 */
	private decrementPlayersCount() {
			this.newGameParams.requiredPlayersCount--;
	}

	/**
	 *  Увеличить необходимое количество игроков
	 */
	private incrementPlayersCount() {
			this.newGameParams.requiredPlayersCount++;
	}
}
