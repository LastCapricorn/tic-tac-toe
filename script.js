const ticTacToe = ( () => {
  'use strict'

  // cache DOM
  const inputNumberOfPlayers = document.querySelector('#number-players')
  const inputNamePlayerOne = document.querySelector('#player1')
  const inputNamePlayerTwo = document.querySelector('#player2')
  const fieldButtons = document.querySelectorAll('button[id^="b"]')
  const difficultyLevel = document.querySelector('#difficulty-level')
  const gameMode = document.querySelector('#game-mode')
  const inputLevel = document.querySelectorAll('input[name="level"]')
  const inputMove = document.querySelectorAll('input[name="first-move"]')

  // bind Events
  inputNumberOfPlayers.addEventListener('click', togglePlayerMode)
  inputNamePlayerOne.addEventListener('change', setPlayer)
  inputNamePlayerTwo.addEventListener('change', setPlayer)
  fieldButtons.forEach( (button) => button.addEventListener('click', setToken))
  inputLevel.forEach( (radio) => radio.addEventListener('change', changeLevel))
  inputMove.forEach( (radio) => radio.addEventListener('change', changeMove))

  // sub modules
  const game = (() => {
    let _singlePlayer = true
    let _gameLevel = 0
    let _gameMode = 1
    let _playerOne = {}
    let _playerTwo = {}

    const setSinglePlayer = function(bool) {
      _singlePlayer = bool
    }

    const setGameLevel = function(level) {
      _gameLevel = level
    }

    const setGameMode = function(mode) {
      _gameMode = mode
    }

    const setPlayerObject = function(obj, id) {
      id === 'player1' ? _playerOne = obj : _playerTwo = obj
    }

    const getPlayer = function() {
      return [_playerOne, _playerTwo]
    }

    const start = function() {
      fieldButtons.forEach( (button) => {
        button.textContent = ''
        button.removeAttribute('disabled')})
    }

    const end = function() {
      fieldButtons.forEach( (button) => button.setAttribute('disabled', ''))
    }

    return { setSinglePlayer, setGameLevel, setGameMode, setPlayerObject, getPlayer, start, end }
  })()

  // factories
  const player = (name) => {
    function playToken(x, y) {
      console.log(`${this.name} sets ${this.token} on field ${x}/${y}.`)
    }
    return { name, playToken }
  }

  const field = (number) => {
    const _id = 'b-' + number
    const _x = boardFields[number].x
    const _y = boardFields[number].y
    let _state = '-'
    function setState(state) {
      _state = state
      events.emit('stateChanged', _state)
    }
    function getState() {
      return this._state
    }
    return { number, setState, getState }
  }

  // functions
  function togglePlayerMode() {
    game.setSinglePlayer(!this.checked)
    if (this.checked) {
      inputNamePlayerTwo.removeAttribute('disabled')
    } else {
      inputNamePlayerTwo.setAttribute('disabled', '')
    }
  }

  function changeLevel() {
    game.setGameLevel(this.value)
  }

  function changeMove(ev) {
    game.setGameMode(this.value)
  }

  function setPlayer() {
    const pattern = /^[\w][- \w]*[\w]$/
    const isValidName = pattern.test(this.value)
    if (isValidName) {
      game.setPlayerObject(player(this.value), this.id)
    } else {
      alert('Only letters, numbers, space, hyphen, underscore for your name please')
    }
  }

  function setToken(ev) {
    console.log(ev)
    console.log(this)
  }

  const gameBoard = ( () => {
    return [['-', '-', '-'], ['-', '-', '-'], ['-', '-', '-']]
  })()

  const boardFields = [
    { x: 0, y: 0 },
    { x: 0, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 0 },
    { x: 1, y: 1 },
    { x: 1, y: 2 },
    { x: 2, y: 0 },
    { x: 2, y: 1 },
    { x: 2, y: 2 } ]

  const winLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ]

  const checkForWin = function(gameboard) {
    for (let i = 0; i < winLines.length; i++) {
      if (winLines[i].every( field => gameboard[boardFields[field].x][boardFields[field].y] === 'X') ||
          winLines[i].every( field => gameboard[boardFields[field].x][boardFields[field].y] === 'O')) {
        return { line: winLines[i], player: gameboard[boardFields[i].x][boardFields[i].y] }
      }
    }
  }

  return { game, gameBoard, player, checkForWin, boardFields, winLines }
})()

// const gameboard = ticTacToe.gameBoard
// console.log(gameboard)
// const player1 = ticTacToe.player('Oli', 'X')
// const player2 = ticTacToe.player('Compi', 'O')
// let e
// console.log({player1, player2})
// player1.playToken(0,2)
// gameboard[0][2] = 'X'
// e = ticTacToe.checkForWin(gameboard)
// console.log('Ergebnis: ', e)

// player2.playToken(1,1)
// gameboard[1][1] = 'O'
// e = ticTacToe.checkForWin(gameboard)
// console.log('Ergebnis: ', e)

// player1.playToken(2,0)
// gameboard[2][0] = 'X'
// e = ticTacToe.checkForWin(gameboard)
// console.log('Ergebnis: ', e)

// player2.playToken(0,0)
// gameboard[0][0] = 'O'
// e = ticTacToe.checkForWin(gameboard)
// console.log('Ergebnis: ', e)

// player1.playToken(2,2)
// gameboard[2][2] = 'X'
// e = ticTacToe.checkForWin(gameboard)
// console.log('Ergebnis: ', e)

// player2.playToken(2,1)
// gameboard[2][1] = 'O'
// e = ticTacToe.checkForWin(gameboard)
// console.log('Ergebnis: ', e)

// player1.playToken(1,2)
// gameboard[1][2] = 'X'
// e = ticTacToe.checkForWin(gameboard)
// console.log('Ergebnis: ', e)

// console.log(gameboard)
