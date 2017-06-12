import { Component } from '@angular/core';
import { IonicPage, NavController, AlertController, NavParams } from 'ionic-angular';
import { GameLogicService } from '../../app/gamelogic.service'

@Component({
  selector: 'page-game',
  templateUrl: 'game.html',
})
export class GamePage {
	private newTaskParams: any;						// параметры нового задания
	private taskGuessed = null;						// статус решения задачи (true - отгадал, false - не отгадал, null - результата нет)
	private taskGuessedResult: string;		// информация о загаданном числе
  constructor(public navCtrl: NavController, public navParams: NavParams, private gameLogic: GameLogicService, private alertCtrl: AlertController) {
		var params = this.navParams.get('gameKey');
		this.newTaskParams = {'number': ''}
  }

 	/*
	 *  Отправить задачу в БД
	 *  Это возможно, если загаданное число натуральное, не превышает 100000
	 */
	private giveTask() {
		// если загаданное число не соответвует требованиям, показать предупреждение
		if (!Number.isInteger(Number(this.newTaskParams.number)) || (0 >= Number(this.newTaskParams.number))) {
			let alert = this.alertCtrl.create({
		    title: 'Ошибка',
		    subTitle: 'Введите натуральное число от 1 до 100000',
		    buttons: ['ОК']
		  });
		  alert.present();
			return;
		}
		this.gameLogic.pushNewTask(this.newTaskParams.number);
		this.newTaskParams.number = "";
	}

	/**
	 * Узнать резулультат задачи
	 * @param {boolean} numberMod - Догадка игрока, 0 - чётное число, 1 - нечътное число
	 */
	private solveTask(numberMod) {
		var currentNumber = this.gameLogic.currentGameInfo.tasks[this.gameLogic.currentGameInfo.tasks.length-1].number
		var correctMod = currentNumber%2;
		if (correctMod == numberMod)
			this.taskGuessed = true;
		else
			this.taskGuessed = false;

		this.taskGuessedResult = 'Загаданное число ' + currentNumber + ' - ';
		if (correctMod == 0) this.taskGuessedResult += 'чётное!';
		if (correctMod == 1) this.taskGuessedResult += 'нечётное!';
	}

	/**
	 * Сообщить серверу о решении задачи
	 * @param {boolean} isTaskSolved - Решил ли игрок задачу
	 */
	private submit(isTaskSolved) {
		this.taskGuessed = null;
		this.gameLogic.solveNewTask(isTaskSolved);
	}

	/**
	 * Выйти из данной игры, сбросить данные игры
	 */
	private exit() {
		this.navCtrl.pop();
		this.gameLogic.reset();
	}
}
