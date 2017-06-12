import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { GameLogicService } from '../../app/gamelogic.service';
import { AlertController, ModalController } from 'ionic-angular';
import { GamePage } from '../game/game'

@Component({
  selector: 'page-findgame',
  templateUrl: 'findgame.html'
})
export class FindGamePage {
  constructor(public navCtrl: NavController, public modalCtrl: ModalController, private gameLogic: GameLogicService, public alertCtrl: AlertController) {
  }

	/**
	 * Подключиться к игре
	 * Для этого нужно, чтобы имя игрока не было пустым, а также не совпадало с именами других игроков в этой игре
	 */
	private connect (gameKeyToConnect) {
		var gameInfo = this.gameLogic.getGameInfoByKey(gameKeyToConnect);

		// если в игре нет свободных мест, показать предупреждение
		if (gameInfo.playersRequiredCount == gameInfo.players.length) {
			let alert = this.alertCtrl.create({
				title: 'Ошибка',
				subTitle: 'В данной игре нет свободных мест',
				buttons: ['ОК']
			});
			alert.present();
			return;
		}

		// запрос на имя пользователя
		let prompt = this.alertCtrl.create({
      title: 'Присоединиться к игре',
      message: "Введите ваш ник",
      inputs: [
        {
          name: 'playerName',
          placeholder: 'Ник'
        },
      ],
      buttons: [
        {
          text: 'Отмена'
        },
        {
          text: 'Играть',
          handler: data => {
						// если имя игрока пустое, показать предупреждение
						if ((data.playerName.length == 0) || (!data.playerName.replace(/\s/g, '').length)) {
							let alert = this.alertCtrl.create({
				    		title: 'Ошибка',
				    		subTitle: 'Пожалуйста, укажите имя',
				    		buttons: [{
				          text: 'ОК',
				          handler: data => {
										this.connect (gameKeyToConnect);
				          }
				        }]
				  		});
				  		alert.present();
							return;
						}

						// если имя игрока совпадет с именем какого-либо другого игрока в данной игре, показать предупреждение
						var gamePlayers = gameInfo.players;
						for (var i = 0; i < gamePlayers.length; i++)
							if (gamePlayers[i].playerName == data.playerName) {
								let alert = this.alertCtrl.create({
					    		title: 'Ошибка',
					    		subTitle: 'В данной игре это имя уже занято',
					    		buttons: [{
					          text: 'ОК',
					          handler: data => {
											this.connect (gameKeyToConnect);
					          }
					        }]
					  		});
					  		alert.present();
								return;
							}

						// подключиться к игре
						this.gameLogic.connectToGame(gameKeyToConnect, data.playerName);
            let profileModal = this.modalCtrl.create(GamePage, {"gameKey": gameKeyToConnect});
						profileModal.present();
          }
        }
      ]
    });
    prompt.present();
	}
}
