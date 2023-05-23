const ticTacToe = ( () => {
  'use strict'

  // DOM access
  const boardFields = document.querySelector('#game-board')
  const fieldButtons = boardFields.querySelectorAll('#game-board button')
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

  // Modules
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

    const getSinglePlayer = function() {
      return _singlePlayer
    }
    return { setSettings, getPlayerNames, getPlayerScores, getPlayerTokens, getSinglePlayer, startPlayer, currentPlayer, currentToken }
  })()

  // Lets & Consts
  const gameBoard = ['', '', '', '', '', '', '', '', '']
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
  const swapToken = ['--xToken', '--oToken']
  const buttons = [...fieldButtons]
  let roundResult = -1
  let isMaxster = false
  let position = 0
  let paused = false

  // Objects
  const messages = { nextPlayer: ", it's your turn!",
                     draw: "It's a draw!",
                     winner: ', you won this round!',
                     aiWins: "'DeepThought' has won this round"
                   }

  // Functions
  function toggleSettingsMenu() {
    settingsPanel.classList.toggle('open')
    const status = settingsPanel.classList.contains('open')
    const arrow = status ? '\u25b2' : '\u25bc'
    panelButton.textContent = arrow
    pauseGame(status)
    if (!paused && settings.getSinglePlayer()) startRound()
  }

  function pauseGame(bool) {
    paused = bool
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
    settingsChange(mode)
  }

  function setPlayer() {
    const pattern = /^[\w][- \w]*[\w]$/
    const isValidName = pattern.test(this.value)
    if (isValidName) {
      settingsChange( { [this.id]: this.value } )
    } else {
      modal('Only letters, numbers, space, hyphen, underscore for your name please!', '0.9rem')
      this.value = ''
    }
  }

  function changeLevel() {
    settingsChange( { aiLevel: (this.checked ? '1' : '0') } )
  }

  function changeMode() {
    settingsChange( { aiMode: (this.value) } )
  }

  function settingsChange(data) {
    settings.setSettings(data)
    resetGameBoard()
    resetStats()
    renderScoring()
    renderMessage(messages.nextPlayer, settings.startPlayer[0].name)
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

  function resetGameBoard() {
    for (const field in gameBoard) gameBoard[field] = ''
    fieldButtons.forEach( (button) => {
      button.textContent = ''
      button.dataset.token = ''
    })
    roundResult = -1
  }

  function resetStats() {
    if (settings.startPlayer[0].id !== 'player1') {
      settings.startPlayer.push(settings.startPlayer.shift())
    }
    if (settings.currentPlayer[0] !== settings.startPlayer[0]) {
      settings.currentPlayer.push(settings.currentPlayer.shift())
    }
    if (settings.currentToken[0] !== 'X') {
      settings.currentToken.push(settings.currentToken.shift())
    }
    settings.currentPlayer[0].score = 0
    settings.currentPlayer[1].score = 0
  }

  function startRound() {
    if (settings.startPlayer[0].name !== 'DeepThought') return
    isMaxster = settings.startPlayer[0].name === 'DeepThought'
    buttons[aiTurn()].click()
  }

  function nextRound() {
    resetGameBoard()
    if(swapToken[0] !== '--xToken') {
      swapToken.push(swapToken.shift())
      document.documentElement.style.setProperty('--token', `var(${swapToken[0]})`)
    }
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
    if (settings.getSinglePlayer()) startRound()
  }

  function endRound() {
    fieldButtons.forEach( (button) => {
      button.setAttribute('disabled', '')
      button.dataset.token = ''
    })
    isMaxster = !isMaxster
    modal('Next Round', '2.0rem', nextRound)
  }

  function play(event) {
    const button = event.target
    if (button.value && gameBoard[button.value] === '') {
      gameBoard[button.value] = settings.currentToken[0]
      button.dataset.token = settings.currentToken[0]
      button.textContent = settings.currentToken[0]
      roundResult = evalTurn()
      if (roundResult !== -1) {
        if (roundResult === 1) {
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
      swapToken.push(swapToken.shift())
      document.documentElement.style.setProperty('--token', `var(${swapToken[0]})`)
    }
    if (settings.currentPlayer[0].name === 'DeepThought') buttons[aiTurn()].click()
  }

  function evalTurn() {
    for (let i = 0; i < winLines.length; i++) {
      if (winLines[i].every( key => gameBoard[key] === 'X')) return 2
      if (winLines[i].every( key => gameBoard[key] === 'O')) return 0
    }
    if (gameBoard.every( (field) => field !== '')) return 1
    return -1
  }

  function aiTurn() {
    const token = isMaxster ? 'X' : 'O'
    let bestTurn = isMaxster ? -Infinity : Infinity
    for (let i = 0; i < 9; i++) {
      if (gameBoard[i] === '') {
        gameBoard[i] = token
        const newBest = minimax()
        if ((isMaxster && (newBest > bestTurn)) || ((!isMaxster) && (newBest < bestTurn))) {
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
    isMaxster = !isMaxster
    let bestMove = isMaxster ? -Infinity : Infinity
    for (let i = 0; i < 9; i++) {
      if (gameBoard[i] === '') {
        gameBoard[i] = isMaxster ? 'X' : 'O'
        const newBest = minimax()
        bestMove = isMaxster ? Math.max(newBest, bestMove) : Math.min(newBest, bestMove)
        gameBoard[i] = ''
      }
    }
    isMaxster = !isMaxster
    return bestMove
  }

  // Event listening
  panelButton.addEventListener('click', toggleSettingsMenu)
  inputNumberOfPlayers.addEventListener('click', togglePlayerMode)
  inputNamePlayerOne.addEventListener('change', setPlayer)
  inputNamePlayerTwo.addEventListener('change', setPlayer)
  inputLevel.addEventListener('change', changeLevel)
  inputMove.forEach( (radio) => radio.addEventListener('change', changeMode))
  boardFields.addEventListener('click', play)

  renderScoring()
  renderMessage(messages.nextPlayer, settings.getPlayerNames().player1)

})()
