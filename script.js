const ticTacToe = ( () => {
  'use strict'

  // cache DOM
  const inputNumberOfPlayers = document.querySelector('#number-players')
  const inputNamePlayerOne = document.querySelector('#player1')
  const inputNamePlayerTwo = document.querySelector('#player2')
  const fieldButtons = document.querySelectorAll('#game-board button')
  const difficultyLevel = document.querySelector('#difficulty-level')
  const firstMoveMode = document.querySelector('#move-mode')
  const inputLevel = document.querySelectorAll('input[name="level"]')
  const inputMove = document.querySelectorAll('input[name="first-move"]')
  const settingsPanel = document.querySelector('nav')
  const panelToggler = document.querySelector('#toggler')

  // bind Events

  inputNumberOfPlayers.addEventListener('click', togglePlayerMode)
  inputNamePlayerOne.addEventListener('change', setPlayer)
  inputNamePlayerTwo.addEventListener('change', setPlayer)
  fieldButtons.forEach( (button) => button.addEventListener('click', setToken))
  inputLevel.forEach( (radio) => radio.addEventListener('change', changeLevel))
  inputMove.forEach( (radio) => radio.addEventListener('change', changeMoveMode))
  panelToggler.addEventListener('click', toggleSettings)
  // factories
  const player = (name) => {
    function playToken(x, y) {
      console.log(`${this.name} sets ${this.token} on field ${x}/${y}.`)
    }
    return { name, playToken }
  }

  const field = (number) => {
    const _id = 'b-' + number
    let _state = ''
    function setState(state) {
      _state = state
    }
    function getState() {
      return _state
    }
    function getId() {
      return _id
    }
    return { number, setState, getState, getId }
  }

  // sub modules
  const game = (() => {
    let _singlePlayer = true
    let _gameLevel = 0
    let _moveMode = 1
    let moves = 9
    let playerIsFirst = true
    let token = 'X'
    let isWon = false
    let _playerOne = {}
    let _playerTwo = {}

    const setSinglePlayer = function(bool) {
      _singlePlayer = bool
    }

    const setGameLevel = function(level) {
      _gameLevel = level
    }

    const setMoveMode = function(mode) {
      _moveMode = mode
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
        button.removeAttribute('disabled')
      })
    }

    const end = function() {
      fieldButtons.forEach( (button) => {
        button.setAttribute('disabled', '')
        button.dataset.token = ''
      })
      gameBoard.forEach( (field) => field.setState(''))
      winLines.forEach( (line) => {
        Object.keys(line).forEach( (key) => (line[key] = ''))
      })
      moves = 9
      isWon = false

    }

    const play = function() {
        moves--
        game.token = game.token === 'X' ? 'O' : 'X'
        isWon = checkForWin()
        if (moves === 0 || isWon) {
          if (!isWon) {
            console.log("It's a draw!")
          } else {
            console.log(isWon.player)
          }
          game.end()
        }
    }

    return { setSinglePlayer,
             setGameLevel,
             setMoveMode,
             setPlayerObject,
             getPlayer,
             start,
             end,
             play,
             token }
  })()

  const gameBoard = []
  const createGameBoard = ((arr)=>{
    for (let i = 1; i <= 9; i++) {
      arr.push(field(i))
    }
  })(gameBoard)

  // functions
  function toggleSettings() {
    settingsPanel.classList.toggle('open')
    panelToggler.textContent =
      settingsPanel.classList.contains('open') ? '\u25b2' : '\u25bc'
  }

  function togglePlayerMode() {
    game.setSinglePlayer(!this.checked)
    if (this.checked) {
      inputNamePlayerTwo.removeAttribute('disabled')
      difficultyLevel.setAttribute('disabled', '')
      firstMoveMode.setAttribute('disabled', '')
    } else {
      inputNamePlayerTwo.setAttribute('disabled', '')
      difficultyLevel.removeAttribute('disabled')
      firstMoveMode.removeAttribute('disabled')
    }
  }

  function changeLevel() {
    game.setGameLevel(this.checked ? 1 : 0)
  }

  function changeMoveMode() {
    game.setMoveMode(this.value)
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

  function setToken() {
    gameBoard[this.value - 1].setState(game.token)
    winLines.forEach( (line) => {
      if(Object.hasOwnProperty.call(line, this.value)) {
        line[this.value] = game.token
      }
    })
    this.dataset.token = game.token
    this.textContent = game.token
    game.play()
  }

  const winLines = [ {1: '', 2: '', 3: ''},
                     {4: '', 5: '', 6: ''},
                     {7: '', 8: '', 9: ''},
                     {1: '', 4: '', 7: ''},
                     {2: '', 5: '', 8: ''},
                     {3: '', 6: '', 9: ''},
                     {1: '', 5: '', 9: ''},
                     {3: '', 5: '', 7: ''}
  ]

  const checkForWin = function() {
    for (let line, i = 0; i < winLines.length; i++) {
      line = Object.getOwnPropertyNames(winLines[i])
      if (line.every( prop => winLines[i][prop] === 'X') ||
          line.every( prop => winLines[i][prop] === 'O')) {
        return { line: winLines[i], player: Object.values(winLines[i])[0] }
      }
    }
  }

  return { game }
})()
