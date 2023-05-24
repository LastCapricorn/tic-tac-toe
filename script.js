const ticTacToe = ( () => {
  'use strict'

  // DOM Access
  const boardFields = document.querySelector('#game-board')
  const fieldButtons = document.querySelectorAll('#game-board button')
  const settingsPanel = document.querySelector('nav')
  const panelButton = document.querySelector('#toggler')
  const heading = document.querySelector('svg')
  const inputNumberOfPlayers = document.querySelector('#number-players')
  const inputNamePlayerOne = document.querySelector('#player1')
  const inputNamePlayerTwo = document.querySelector('#player2')
  const levelFieldset = document.querySelector('#difficulty')
  const inputLevel = document.querySelector('#level')
  const displayP1Name = document.querySelector('.scoring.p1 .name')
  const displayP1Score = document.querySelector('.scoring.p1 .score')
  const displayP2Name = document.querySelector('.scoring.p2 .name')
  const displayP2Score = document.querySelector('.scoring.p2 .score')
  const displayMessage = document.querySelector('#message')
  const modalButton = document.querySelector('.modal')

  // Player Factory
  const player = (id, name) => {
    const score = 0
    return { id, name, score }
  }

  // Settings Module
  const settings = (() => {
    const _player1 = player('player1', 'Incognito')
    const _player2 = player('player2', 'Anonymous')
    const _ai = player('ai', 'DeepThought')
    let _startPlayer = [_player1, _player2]
    let _currentPlayer = [_player1, _player2]
    let _singlePlayer = false
    let _aiLevel = '1'

    const change = function(obj) {
      _player1.name = obj.player1 || _player1.name
      _player2.name = obj.player2 || _player2.name
      _singlePlayer = Object.hasOwnProperty.call(obj, 'singlePlayer') ? obj.singlePlayer : _singlePlayer
      _aiLevel = obj.aiLevel || _aiLevel
      if (_singlePlayer) {
        _startPlayer = [_player1, _ai]
        _currentPlayer = [_player1, _ai]
      } else {
        _startPlayer = [_player1, _player2]
        _currentPlayer = [_player1, _player2]
      }
      changedSettings = true
    }
    const getNames = () => ({ player1: _player1.name, player2: _player2.name, ai: _ai.name })
    const getScores = () => ({ player1: _player1.score, player2: _player2.score, ai: _ai.score })
    const getSinglePlayer = () => _singlePlayer
    const getStartPlayer = () => _startPlayer
    const getCurrentPlayer = () => _currentPlayer
    const getLevel = () => _aiLevel

    return { change,
             getNames,
             getScores,
             getSinglePlayer,
             getStartPlayer,
             getCurrentPlayer,
             getLevel }
  })()

  // 'NameSpace Globals'
  const gameBoard = ['', '', '', '', '', '', '', '', '']
  const buttons = [...fieldButtons]
  const currentToken = ['X', 'O']
  const swapToken = ['--xToken', '--oToken']
  const messages = { nextPlayer: ", it's your turn!",
                     draw: "It's a draw!",
                     winner: ', you won this round!',
                     aiWins: "'DeepThought' has won this round",
                     errorName: 'Only letters, numbers, space, hyphen, underscore for your name please!'
                   }
  let startPlayer = settings.getStartPlayer()
  let currentPlayer = settings.getCurrentPlayer()
  let moveResult = -1
  let isMaximizer = false
  let changedSettings = false

  renderScoring()
  renderMessage(messages.nextPlayer, startPlayer[0].name)

  // Functions Game Play
  function play(event) {
    const button = event.target
    if (!button.value || gameBoard[button.value] !== '') return
    gameBoard[button.value] = currentToken[0]
    button.dataset.token = currentToken[0]
    button.textContent = currentToken[0]
    moveResult = evalTurn()
    let turnMessage = [messages.nextPlayer, currentPlayer[1].name]
    if (moveResult !== -1) {
      turnMessage = roundResult()
      renderScoring()
      endRound()
    }
    renderMessage(...turnMessage)
    currentPlayer.push(currentPlayer.shift())
    currentToken.push(currentToken.shift())
    swapToken.push(swapToken.shift())
    document.documentElement.style.setProperty('--token', `var(${swapToken[0]})`)
    if (currentPlayer[0].id === 'ai') {
      if (settings.getLevel() === '0') {
        buttons[aiRandom()].click()
      } else {
        buttons[aiTurn()].click()
      }
    }
  }

  function roundResult() {
    let result
    if (moveResult === 1) {
      result = [messages.draw]
    } else {
      currentPlayer[0].score++
      result = currentPlayer[0].id === 'ai' ? [messages.aiWins] : [messages.winner, currentPlayer[0].name]
    }
    return result
  }

  function endRound() {
    fieldButtons.forEach( (button) => {
      button.setAttribute('disabled', '')
      button.dataset.token = ''
    })
    isMaximizer = !isMaximizer
    modal('Next Round', '2.0rem', nextRound)
  }

  function nextRound() {
    resetGameBoard()
    fieldButtons.forEach( (button) => {
      button.removeAttribute('disabled')
    })
    startPlayer.push(startPlayer.shift())
    if (currentPlayer[0] !== startPlayer[0]) {
      currentPlayer.push(currentPlayer.shift())
    }
    renderMessage(messages.nextPlayer, startPlayer[0].name)
    if (settings.getSinglePlayer()) aiStart()
  }

  function aiStart() {
    if (startPlayer[0].id !== 'ai') return
    isMaximizer = true
    if (settings.getLevel() === '0') {
      buttons[aiRandom()].click()
    } else {
      buttons[aiTurn()].click()
    }
  }

  // Check The Board For Winner/Tie - Also Used By Minimax
  const evalTurn = (() => {
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
    return () => {
      for (let i = 0; i < winLines.length; i++) {
        if (winLines[i].every( key => gameBoard[key] === 'X')) return 2
        if (winLines[i].every( key => gameBoard[key] === 'O')) return 0
      }
      if (gameBoard.every( (field) => field !== '')) return 1
      return -1
    }
  })()

  // The Minimax-Algorithm, provides the next best AI move
  function aiTurn() {
    const token = isMaximizer ? 'X' : 'O'
    let bestTurn = isMaximizer ? -Infinity : Infinity
    let position = 0
    for (let i = 0; i < 9; i++) {
      if (gameBoard[i] === '') {
        gameBoard[i] = token
        const newBest = minimax()
        if ((isMaximizer && newBest > bestTurn) || (!isMaximizer && newBest < bestTurn)) {
          bestTurn = newBest
          position = i
        }
        gameBoard[i] = ''
      }
    }
    return position
  }

  function minimax() {
    const result = evalTurn()
    if (result !== -1) return result
    isMaximizer = !isMaximizer
    let bestMove = isMaximizer ? -Infinity : Infinity
    for (let i = 0; i < 9; i++) {
      if (gameBoard[i] === '') {
        gameBoard[i] = isMaximizer ? 'X' : 'O'
        const newBest = minimax()
        bestMove = isMaximizer ? Math.max(newBest, bestMove) : Math.min(newBest, bestMove)
        gameBoard[i] = ''
      }
    }
    isMaximizer = !isMaximizer
    return bestMove
  }

  // if you want to beat the AI...
  function aiRandom() {
    let rndMove
    do {
      rndMove = Math.floor(Math.random() * 9)
    } while (gameBoard[rndMove] !== '');
    return rndMove
  }

  // Functions Reset & Restart
  function newGame() {
    startPlayer = settings.getStartPlayer()
    currentPlayer = settings.getCurrentPlayer()
    resetGameBoard()
    resetStats()
    renderScoring()
    renderMessage(messages.nextPlayer, startPlayer[0].name)
  }

  function resetGameBoard() {
    for (let i = 0; i < buttons.length; i++) {
      buttons[i].textContent = ''
      buttons[i].dataset.token = ''
      gameBoard[i] = ''
    }
    if(currentToken[0] !== 'X') {
      currentToken.push(currentToken.shift())
    }
    if(swapToken[0] !== '--xToken') {
      swapToken.push(swapToken.shift())
      document.documentElement.style.setProperty('--token', `var(${swapToken[0]})`)
    }
    moveResult = -1
  }

  function resetStats() {
    if (startPlayer[0].id !== 'player1') {
      startPlayer.push(startPlayer.shift())
    }
    if (currentPlayer[0].id !== 'player1') {
      currentPlayer.push(currentPlayer.shift())
    }
    currentPlayer[0].score = 0
    currentPlayer[1].score = 0
    isMaximizer = false
  }

  // Functions UI Display
  function renderScoring() {
    displayP1Name.textContent = settings.getNames().player1
    displayP1Score.textContent = settings.getScores().player1
    displayP2Name.textContent = settings.getSinglePlayer() ? settings.getNames().ai : settings.getNames().player2
    displayP2Score.textContent = settings.getSinglePlayer() ? settings.getScores().ai : settings.getScores().player2
  }

  function renderMessage(message, playerName) {
    displayMessage.textContent = playerName ? playerName + message : message
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

  // Functions Game Settings
  function toggleSettingsMenu() {
    settingsPanel.classList.toggle('open')
    const status = settingsPanel.classList.contains('open')
    const arrow = status ? '\u25b2' : '\u25bc'
    panelButton.textContent = arrow
    fieldButtons.forEach ( (button) => {
      if (status) {
        button.setAttribute('disabled', '')
      } else {
        button.removeAttribute('disabled')
      }
    })
    if((!status) && changedSettings) {
      changedSettings = false
      newGame()
    }
  }

  function togglePlayerMode() {
    const onePlayer = { singlePlayer: !this.checked }
    if (this.checked) {
      inputNamePlayerTwo.removeAttribute('disabled')
      levelFieldset.setAttribute('disabled', '')
    } else {
      inputNamePlayerTwo.setAttribute('disabled', '')
      levelFieldset.removeAttribute('disabled')
    }
    settings.change(onePlayer)
  }

  function setPlayerName() {
    const pattern = /^[\w][- \w]*[\w]$/
    const isValidName = pattern.test(this.value)
    if (!(this.value === '') && !isValidName) {
      modal(...[messages.errorName, '0.9rem'])
      this.value = ''
    } else {
      settings.change({ [this.id]: this.value })
    }
  }

  function changeLevel() {
    settings.change({ aiLevel: (this.checked ? '1' : '0') })
  }

  // Event Listening
  panelButton.addEventListener('click', toggleSettingsMenu)
  heading.addEventListener('click', toggleSettingsMenu)
  inputNumberOfPlayers.addEventListener('click', togglePlayerMode)
  inputNamePlayerOne.addEventListener('change', setPlayerName)
  inputNamePlayerTwo.addEventListener('change', setPlayerName)
  inputLevel.addEventListener('change', changeLevel)
  boardFields.addEventListener('click', play)

})()
