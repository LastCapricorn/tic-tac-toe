const ticTacToe = ( () => {
  'use strict'

  // DOM access
  const gameField = document.querySelector('#game-board')
  const fieldButtons = gameField.querySelectorAll('#game-board button')
  const settingsPanel = document.querySelector('nav')
  const panelButton = document.querySelector('#toggler')
  const inputNumberOfPlayers = document.querySelector('#number-players')
  const inputNamePlayerOne = document.querySelector('#player1')
  const inputNamePlayerTwo = document.querySelector('#player2')
  const levelFieldset = document.querySelector('#difficulty')
  const moveFieldset = document.querySelector('#mode')
  const inputLevel = document.querySelector('#level')
  const inputMove = document.querySelectorAll('#mode input')
  const displayP1Name = document.querySelector('.scoring.p1 .name')
  const displayP1Score = document.querySelector('.scoring.p1 .score')
  const displayP2Name = document.querySelector('.scoring.p2 .name')
  const displayP2Score = document.querySelector('.scoring.p2 .score')
  const displayMessage = document.querySelector('#message')
  const modalButton = document.querySelector('.modal')

  // Factories
  const player = (id, name, token) => {
    const score = 0
    return { id, name, token, score }
  }

  const field = (number) => {
    let _state = ''
    function setState(state) {
      _state = state
    }
    function getState() {
      return _state
    }
    return { number, setState, getState }
  }

  // Modules
  const events = {
    events: {},

    on: function(eventName, fn) {
      this.events[eventName] = this.events[eventName] || []
      this.events[eventName].push(fn)
    },
    off: function(eventName, fn) {
      for (let i = 0; i < this.events[eventName].length; i++) {
        if(this.events[eventName][i] === fn) {
          this.events[eventName].splice(i, 1)
          break
        }
      }
    },
    trigger: function(eventName, data) {
      if (this.events[eventName]) {
        this.events[eventName].forEach( fn => fn(data))
      }
    }
  }

  const settings = (() => {
    const _player1 = player('player1', 'Incognito', 'X')
    const _player2 = player('player2', 'Anonymous', 'O')
    let _singlePlayer = false
    let _aiLevel = '0'
    let _aiMode = '1'
    const startPlayer = [_player1, _player2]
    const currentPlayer = [_player1, _player2]
    const currentToken = [_player1.token, _player2.token]

    const setSettings = function(obj) {
      _player1.name = obj.player1 || _player1.name
      _player2.name = obj.player2 || _player2.name
      _singlePlayer = Object.hasOwnProperty.call(obj, 'singlePlayer') ? obj.singlePlayer : _singlePlayer
      _aiLevel = obj.aiLevel || _aiLevel
      _aiMode = obj.aiMode || _aiMode
    }
    const getPlayerNames = function() {
      return { player1: _player1.name, player2: _player2.name }
    }
    const getPlayerScores = function() {
      return { player1: _player1.score, player2: _player2.score }
    }

    const getPlayerTokens = function() {
      return { player1: _player1.token, player2: _player2.token }
    }

    return { setSettings, getPlayerNames, getPlayerScores, getPlayerTokens, startPlayer, currentPlayer, currentToken }
  })()

  const gameBoard = []
  const createGameBoard = ((arr)=>{
    for (let i = 1; i <= 9; i++) {
      arr.push(field(i))
    }
  })(gameBoard)

  // Lets & Consts
  const messages = { nextPlayer: ", it's your turn!",
                     draw: "It's a draw!",
                     winner: ', you won this round!',
                     aiWins: "'DeepThought' has won this round"
                   }
  let moves = 9
  let hasWinner = false

  // Objects
  const winLines = [ {1: '', 2: '', 3: ''},
                     {4: '', 5: '', 6: ''},
                     {7: '', 8: '', 9: ''},
                     {1: '', 4: '', 7: ''},
                     {2: '', 5: '', 8: ''},
                     {3: '', 6: '', 9: ''},
                     {1: '', 5: '', 9: ''},
                     {3: '', 5: '', 7: ''}
  ]

  // Functions
  function toggleSettingsMenu() {
    settingsPanel.classList.toggle('open')
    const status = settingsPanel.classList.contains('open')
    const arrow = status ? '\u25b2' : '\u25bc'
    panelButton.textContent = arrow
    events.trigger('menuToggle', status)
  }

  function pauseGame(bool) {
    fieldButtons.forEach ( (button) => {
      if (bool) {
        button.setAttribute('disabled', '')
      } else {
        button.removeAttribute('disabled')
      }
    })
  }

  function togglePlayerMode() {
    const mode = { singlePlayer: !this.checked }
    if (this.checked) {
      inputNamePlayerTwo.removeAttribute('disabled')
      levelFieldset.setAttribute('disabled', '')
      moveFieldset.setAttribute('disabled', '')
      mode.player2 = 'Anonymous'
    } else {
      inputNamePlayerTwo.setAttribute('disabled', '')
      levelFieldset.removeAttribute('disabled')
      moveFieldset.removeAttribute('disabled')
      mode.player2 = 'DeepThought'
    }
    events.trigger('settingsChange', mode)
  }

  function setPlayer() {
    const pattern = /^[\w][- \w]*[\w]$/
    const isValidName = pattern.test(this.value)
    if (isValidName) {
      events.trigger('settingsChange',  { [this.id]: this.value } )
    } else {
      modal('Only letters, numbers, space, hyphen, underscore for your name please!', '0.9rem')
      this.value = ''
    }
  }

  function changeLevel() {
    events.trigger('settingsChange', { aiLevel: (this.checked ? '1' : '0') })
  }

  function changeMode() {
    events.trigger('settingsChange', { aiMode: (this.value) })
  }

  function renderScoring() {
    displayP1Name.textContent = settings.getPlayerNames().player1
    displayP1Score.textContent = settings.getPlayerScores().player1
    displayP2Name.textContent = settings.getPlayerNames().player2
    displayP2Score.textContent = settings.getPlayerScores().player2
  }

  function renderMessage(message, playerName) {
    displayMessage.textContent = playerName? playerName + message : message
  }

  function modal(string, fontsize, fn) {
    document.documentElement.style.setProperty('--fontsize', fontsize)
    modalButton.textContent = string
    modalButton.addEventListener('click', function inModal() {
      modalButton.textContent = ''
      modalButton.classList.remove('show')
      modalButton.removeEventListener('click', inModal)
      if (fn) fn()
    })
    modalButton.classList.add('show')
  }

  function endRound() {
    fieldButtons.forEach( (button) => {
      button.setAttribute('disabled', '')
      button.dataset.token = ''
    })
    modal('Next Round', '2.0rem', nextRound)
  }

  function nextRound() {
    resetGameBoard()
    fieldButtons.forEach( (button) => {
      button.removeAttribute('disabled')
    })
    settings.startPlayer.push(settings.startPlayer.shift())
    if (settings.currentPlayer[0] !== settings.startPlayer[0]) {
      settings.currentPlayer.push(settings.currentPlayer.shift())
    }
    if (settings.currentToken[0] !== 'X') {
      settings.currentToken.push(settings.currentToken.shift())
    }
    settings.currentPlayer[0].token = 'X'
    settings.currentPlayer[1].token = 'O'
    renderMessage(messages.nextPlayer, settings.startPlayer[0].name)
  }

  function resetGameBoard() {
    gameBoard.forEach( (field) => field.setState(''))
    winLines.forEach( (line) => {
      Object.keys(line).forEach( (key) => (line[key] = ''))
    })
    fieldButtons.forEach( (button) => {
      button.textContent = ''
      button.dataset.token = ''
    })
    moves = 9
    hasWinner = false
  }

  function resetStats() {
    if (settings.startPlayer[0].name !== settings.getPlayerNames().player1.name) {
      settings.startPlayer.push(settings.startPlayer.shift())
    }
    if (settings.currentPlayer[0] !== settings.startPlayer[0]) {
      settings.currentPlayer.push(settings.currentPlayer.shift())
    }
    if (settings.currentToken[0] !== 'X') {
      settings.currentToken.push(settings.currentToken.shift())
    }
    settings.currentPlayer[0].token = 'X'
    settings.currentPlayer[1].token = 'O'
    settings.currentPlayer[0].score = 0
    settings.currentPlayer[1].score = 0
  }

  function play(event) {
    const button = event.target
    if (button.type && !gameBoard[button.value - 1].getState()) {
      gameBoard[button.value - 1].setState(settings.currentToken[0])
      winLines.forEach( (line) => {
        if(Object.hasOwnProperty.call(line, button.value)) {
          line[button.value] = settings.currentToken[0]
        }
      })
      button.dataset.token = settings.currentToken[0]
      button.textContent = settings.currentToken[0]
      --moves
      hasWinner = checkForWin()
      if (moves === 0 || hasWinner) {
        if (!hasWinner) {
          renderMessage(messages.draw)
        } else {
          settings.currentPlayer[0].score++
          renderMessage(messages.winner, settings.currentPlayer[0].name)
        }
        renderScoring()
        endRound()
      } else {
        renderMessage(messages.nextPlayer, settings.currentPlayer[1].name)
        settings.currentPlayer.push(settings.currentPlayer.shift())
        settings.currentToken.push(settings.currentToken.shift())
      }
    }
  }

  function checkForWin() {
    for (let line, i = 0; i < winLines.length; i++) {
      line = Object.getOwnPropertyNames(winLines[i])
      hasWinner = line.every( prop => winLines[i][prop] === 'X') ||
                  line.every( prop => winLines[i][prop] === 'O')
      if (hasWinner) return { line: winLines[i] }
    }
  }

  // Event listening
  panelButton.addEventListener('click', toggleSettingsMenu)
  inputNumberOfPlayers.addEventListener('click', togglePlayerMode)
  inputNamePlayerOne.addEventListener('change', setPlayer)
  inputNamePlayerTwo.addEventListener('change', setPlayer)
  inputLevel.addEventListener('change', changeLevel)
  inputMove.forEach( (radio) => radio.addEventListener('change', changeMode))
  gameField.addEventListener('click', play)
  events.on('menuToggle', pauseGame)
  events.on('settingsChange', settings.setSettings)
  events.on('settingsChange', resetGameBoard)
  events.on('settingsChange', resetStats)
  events.on('settingsChange', renderScoring)

  renderScoring()
  renderMessage(messages.nextPlayer, settings.getPlayerNames().player1)
})()
