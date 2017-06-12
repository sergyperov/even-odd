/**
	Сервис для работы с базами данных firebase и предоставлению пользователю игровых возможностей
*/

import {Injectable} from '@angular/core'
import firebase from 'firebase'

@Injectable()
export class GameLogicService {
	private db: any;
	private auth: any;

	private playerKey: string;
	private gamePlayerId: number;					// индекс игрока (начиная с 0)
	public playerScore: number;
	public playerName: string;

	public avaliableGames: any;					// массив со всеми доступными играми
	public currentGameInfo: any;				// информация о текущей игре
	public mustGiveProblem = false;			// пользователь должен дать задание (придумать число)
	public mustSolveProblem = false;		// пользователь должен решить задание (отгадать число)
	public playersLeaderTable: any;			// отсортированный в порядке уменьшения баллов массив с игроками
	public currentGameWinner = null;
	public serverSettings: any;

	constructor() {}

	init() {
		// параметри подключения к firebase
		const firebaseConnectParams = {
			apiKey: "AIzaSyCrvdzuspQrOfNTzlO1rVdTbK0ca85Wnp0",
    	authDomain: "even-odd-2ad5d.firebaseapp.com",
    	databaseURL: "https://even-odd-2ad5d.firebaseio.com",
    	projectId: "even-odd-2ad5d",
    	storageBucket: "even-odd-2ad5d.appspot.com",
    	messagingSenderId: "1097200451130"
		};

		firebase.initializeApp(firebaseConnectParams);
		this.db = firebase.database().ref('/');

		// подключаемся анонимно к БД firebase
		this.auth = firebase.auth();
		this.auth.signInAnonymously();

		this.checkForAvaliableGames();
		this.currentGameInfo = null;

		// установить серверные натройки
		this.db.child('settings').once('value', data => {
			this.serverSettings = data.val();
		});
	}

	/**
	 * Получить ссылку игры
	 * @param {string} gameKey - Ключ данной игры в БД
	 * @return - Возращает ссылку на игру
	 */
	private getGameRef(gameKey) {
		return this.db.child('games').child(gameKey);
	}

	/**
	 * Получить информацию об игре по ключу игры
	 * @param {string} gameKey - Ключ данной игры в БД
	 * @return - Возращает объект игры
	 */
	public getGameInfoByKey(gameKey) {
		for (var i = 0; i < this.avaliableGames.length; i++)
			if (this.avaliableGames[i].key == gameKey)
				return this.avaliableGames[i];
			return null;
	}

	/**
	 * Определить победителя (если возможно)
	 * ВАЖНО: этот метод изменяет значение свойства currentGameWinner
	 */
	private setGameWinner() {
		if (this.currentGameInfo.tasksFinished >= this.currentGameInfo.players.length * this.serverSettings.roundsCount)
			if (this.playersLeaderTable[0].playerScore > this.playersLeaderTable[1].playerScore)
				this.currentGameWinner = this.playersLeaderTable[0].playerName;
	}

	/**
	 * Добавить игру в БД
	 * @param {number} requiredPlayersCount - Необходимое число игроков
	 * @returns Возвращяет ключ данной игры в БД
	 */
	public addGame(requiredPlayersCount) {
	 	var newGameRef = this.db.child('games').push();
	 	newGameRef.set({
    	playersRequiredCount: requiredPlayersCount,
			tasksFinished: 0
	  });

		return new Promise((resolve, reject) => {
			resolve(newGameRef.key);
		});
	}

	/**
	 * Получить информацию о предыдущем игроке в кругу
	 * @returns Возвращает данные игрока
	 */
	public getPrevPlayerInfo() {
		if (this.gamePlayerId == 0)
			return this.currentGameInfo.players[this.currentGameInfo.players.length-1];
		return this.currentGameInfo.players[this.gamePlayerId-1];
	}

	/**
	 * Получить информацию о следующем игроке в кругу
	 * @returns Возвращает данные игрока
	 */
	public getNextPlayerInfo() {
		if (this.gamePlayerId == this.currentGameInfo.players.length-1)
			return this.currentGameInfo.players[0];
		return this.currentGameInfo.players[this.gamePlayerId+1];
	}

  /**
	 * Обновить (в т.ч. отсортировать) таблицу лидеров
	 * ВАЖНО: этот метод изменяет объект playersLeaderTable
	 */
	private updatePlayerLeaderTable() {
		this.playersLeaderTable = this.currentGameInfo.players;

		function compare(a,b) {
  		if (a.playerScore > b.playerScore)
    		return -1;
  		if (a.playerScore < b.playerScore)
    		return 1;
  		return 0;
		}

		if (this.playersLeaderTable)
			this.playersLeaderTable.sort(compare);
	}

	/**
	 *	Подключиться к игре
	 *	@param {string} gameKey - Ключ данной игры в БД
	 *  @param {string} playerName - Имя игрока
	 *  ВАЖНО: этот метод автоматически обновляет объект currentGameInfo, а также изменяет некоторые другие объекты
	 */
	public connectToGame(gameKey, playerName) {
		this.playerName = playerName;
		var gamePlayersBranch = this.getGameRef(gameKey).child('players');
		var newPlayerData = gamePlayersBranch.push();
		newPlayerData.set({
			'playerName': playerName,
			'playerScore': 0
		});

		this.playerKey = newPlayerData.key;

		this.getGameRef(gameKey).on('value', data => {
			this.currentGameInfo = data.val();
			this.currentGameInfo.key = gameKey;

			// преобразовывает данные об игроках в массив
			var playersArray = [];
			for (var obj in this.currentGameInfo.players)
				playersArray.push(this.currentGameInfo.players[obj]);
			this.currentGameInfo.players = playersArray;

			// преобразовывает данные о заданиях в массив
			var tasksArray = [];
			for (var obj in this.currentGameInfo.tasks)
				tasksArray.push(this.currentGameInfo.tasks[obj]);
			this.currentGameInfo.tasks = tasksArray;

			// при первом пробеге установить gamePlayerId
			if (this.gamePlayerId == null)
				this.gamePlayerId = this.currentGameInfo.players.length - 1;

			// если сейчас очередь игрока, дать ему на решение задание
			if ((this.currentGameInfo.tasks.length != 0) && (this.currentGameInfo.tasks.length%this.currentGameInfo.players.length == this.gamePlayerId))
				this.mustSolveProblem = true;

			// если все игроки на месте, а данный игрок нулевой (т.е. создавший игру), он должен дать первое задание
			if ((this.currentGameInfo.players.length == this.currentGameInfo.playersRequiredCount)&&(this.gamePlayerId==0)&&(this.currentGameInfo.tasks.length == 0))
				this.mustGiveProblem = true;

			this.playerScore = this.currentGameInfo.players[this.gamePlayerId].playerScore;

			// обновление объектов
			this.updatePlayerLeaderTable();
			this.setGameWinner();
		});
	}

	/**
	 * Отправить новое задание
	 * @param {number} number - Число, которое было загадано игроком
	 */
	public pushNewTask(number) {
		this.mustGiveProblem = false;
		var gameTasksBranch = this.getGameRef(this.currentGameInfo.key).child('tasks');
		var newTaskData = gameTasksBranch.push();
		newTaskData.set({
			'number': number
		});
	}

	/**
	 * Полный снос данных текущей игры (вызывать в конце игры)
	 */
	public reset() {
		this.currentGameInfo = null;
		this.playerName = null;
		this.gamePlayerId = null;
		this.mustGiveProblem = false;
		this.mustSolveProblem = false
		this.playerKey = null;
		this.playerScore = null;
		this.playersLeaderTable = null;
		this.currentGameWinner = null;
	}

	/**
	 * Отправить в БД результат решения задания
	 * Добавляет балл игроку (если он решил правильно), увеличивает количесвто решённых задач
	 * @param {boolean} isTaskSolved - Праильно ли была решена задача
	 */
	public solveNewTask(isTaskSolved) {
		var gamePlayerScoreRef = this.getGameRef(this.currentGameInfo.key).child('players').child(this.playerKey).child('playerScore');
		var gameTasksFinishedRef = this.getGameRef(this.currentGameInfo.key).child('tasksFinished');
		var updates = {};

		if (isTaskSolved)
			updates['/games/'+this.currentGameInfo.key+'/players/'+this.playerKey+'/playerScore'] = this.playerScore+1;
		updates['/games/'+this.currentGameInfo.key+'/tasksFinished'] = this.currentGameInfo.tasksFinished+1;
		this.db.update(updates);

		// теперь игрок должен дать задание следующему игроку
		this.mustSolveProblem = false;
		this.mustGiveProblem = true;
	}

	/**
	 * Проверить наличие доступных игр
	 * ВАЖНО: эта функция автоматически обновляет объект avaliableGames
	 * Функция получает объект с текущими играми из БД, а затем преобразовывает его в удобную структуру
	*/
	public checkForAvaliableGames() {
		this.db.child('games').on('value', data => {
			this.avaliableGames = [];

			// преобразуем объект в массив с играми
			for (var obj in data.val())
				if (data.val()[obj].hasOwnProperty('players')) {
					this.avaliableGames.push(data.val()[obj]);
					this.avaliableGames[this.avaliableGames.length-1].key = obj;
				}

			// в каждой игре преобразуем объект с игроками в массив с игроками
			for (var i = 0; i < this.avaliableGames.length; i++) {
				var playersArray = [];
				for (obj in this.avaliableGames[i].players)
					playersArray.push(this.avaliableGames[i].players[obj]);
				this.avaliableGames[i].players = playersArray;
			}
		});
	}
}
