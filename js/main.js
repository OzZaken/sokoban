'use strict'
var gBoard
var gPlayer = { firstMove: null, isStuck: null, isStepOnClock: null }
var gGame = {
    currLvlTargets: null,
    startTime: null,
    maxLvl: 60,
    stepsLeft: 100,
    StepsCount: 0,
    states: [],
    intervals: {
        gameTime: null,
        clock: null,
        gold: null,
        glue: null
    },
}

function initGame(lvl = gGame.currLvl) {
    // Game
    gGame.isOn = true
    gGame.currLvl = lvl
    gGame.stepsLeft = 100
    document.querySelectorAll('modal-state').hidden = true
    // Player
    gPlayer.isStuck = false
    // Board
    gBoard = createBoard(gMaps[lvl])
    renderBoard(gBoard)
    renderScore()
    document.querySelector('th span.timer').innerText = '0:00'

    //  Intervals
    clearIntervals()
    gGame.intervals['glue'] = setInterval(addElement, 7000, GLUE, GLUE_IMG)
    gGame.intervals.clock = setInterval(addElement, 5000, CLOCK, CLOCK_IMG)
    gGame.intervals.gold = setInterval(addElement, 15000, GOLD, GOLD_IMG)
}

function clearIntervals() {
    clearInterval(Object.values(gGame.intervals))
    for (const Interval in gGame.intervals) {
        gGame.intervals[Interval] = null
    }
}

function createBoard(boardMap) {
    let board = []
    for (let i = 0; i < boardMap.length; i++) {
        board[i] = []
        for (let j = 0; j < boardMap[0].length; j++) {
            switch (boardMap[i][j]) {
                case 0:
                    board[i][j] = { gameElement: 'EMPTY', pos: { i, j }, isEmpty: false, isTarget: false }
                    break
                case 1:
                    board[i][j] = { gameElement: 'WALL', pos: { i, j }, isEmpty: false, isTarget: false }
                    break
                case 2:
                    board[i][j] = { gameElement: 'FLOOR', pos: { i, j }, isEmpty: true, isTarget: false }
                    break
                case 3:
                    board[i][j] = { gameElement: 'TARGET', pos: { i, j }, isEmpty: true, isTarget: true }
                    gGame.currLvlTargets++
                    break
                case 4:
                    board[i][j] = { gameElement: 'CARGO', pos: { i, j }, isEmpty: false, isTarget: false }
                    break
                case 5:
                    board[i][j] = { gameElement: 'CARGO_ON_TARGET', pos: { i, j }, isEmpty: false, isTarget: true }
                    gGame.currLvlTargets++
                    break
                case 6:
                    board[i][j] = { gameElement: 'KEEPER', pos: { i, j }, isEmpty: false, isTarget: false }
                    gPlayer.currPos = { i, j }
                    break
                case 7:
                    board[i][j] = { gameElement: 'KEEPER_ON_TARGET', pos: { i, j }, isEmpty: false, isTarget: true }
                    gGame.currLvlTargets++
                    gPlayer.currPos = { i, j }
                    break
            }
        }
    }
    return board
}

function renderBoard(board) {
    let strHTML = ''
    for (let i = 0; i < board.length; i++) {
        strHTML += '<tr>\n'
        for (let j = 0; j < board[0].length; j++) {
            strHTML += `\t<td class="cell cell-${i}-${j}" onclick="moveTo(${i},${j})" >\n`
            switch (board[i][j].gameElement) {
                case 'EMPTY':
                    strHTML += EMPTY_IMG
                    break
                case 'WALL':
                    strHTML += WALL_IMG
                    break
                case 'FLOOR':
                    strHTML += FLOOR_IMG
                    break
                case 'TARGET':
                    strHTML += TARGET_IMG
                    break
                case 'CARGO':
                    strHTML += CARGO_IMG
                    break
                case 'CARGO_ON_TARGET':
                    strHTML += CARGO_ON_TARGET_IMG
                    break
                case 'KEEPER':
                    strHTML += KEEPER_IMG
                    break
                case 'KEEPER_ON_TARGET':
                    strHTML += KEEPER_ON_TARGET_IMG
                    break
            }
            strHTML += '\t</td>\n'
        }
        strHTML += '<tr>\n'
    }
    var elLvl = document.querySelector('.game-lvl')
    var elBoard = document.querySelector('.board')
    elLvl.innerHTML = gGame.currLvl + 1
    elBoard.innerHTML = strHTML
}

function renderScore() {
    document.querySelector('.progress-bar-inner').style.width = gGame.stepsLeft + '%'
    document.querySelector('th span.score').innerHTML = ` ${gGame.stepsLeft}`
}



function checkGameOver() {
    // Lose    
    if (gGame.stepsLeft <= 0) {
        document.querySelector('.progress-bar-inner').innerText = '☠'
        setTimeout(openModal, 1000, 'LOSE')
    }
    // Win 
    let targetsCover = 0
    for (let i = 0; i < gBoard.length; i++) {
        for (let j = 0; j < gBoard[0].length; j++) {
            if (gBoard[i][j].gameElement === CARGO_ON_TARGET) targetsCover++
        }
        if (targetsCover === gGame.currLvlTargets) openModal('WIN')
    }
}
function openModal(state) {
    gGame.isOn = false
    clearIntervals()
    if (state === 'WIN') document.querySelector('winner-section').hidden = false
    else document.querySelector('loser-section').hidden = false
}
function onNextLvl() {
    gGame.currLvl + 1
    initGame(gGame.currLvl)
}

// Movement
function handleKey(event) {
    var i = gPlayer.currPos.i
    var j = gPlayer.currPos.j

    switch (event.key) {
        case 'ArrowLeft':
            moveTo(i, j - 1)
            break
        case 'ArrowRight':
            moveTo(i, j + 1)
            break
        case 'ArrowUp':
            moveTo(i - 1, j)
            break
        case 'ArrowDown':
            moveTo(i + 1, j)
            break
        case 'r':
            gGame.startTime = Date.now()
            clearIntervals()
            initGame(gGame.currLvl)
            break
        case 'u':
            gBoard = gGame.states[state.length - 1]
            renderBoard(gBoard)
            break

    }
}

function moveTo(i, j) {
    // Get relevant Cells
    let prevCell = getCell(gPlayer.currPos)
    let targetCell = gBoard[i][j]
    let pushingCell = getCell({
        i: i + targetCell.pos.i - prevCell.pos.i,
        j: j + targetCell.pos.j - prevCell.pos.j
    })

    // return conditions
    if (!checkValidatedMove(
        Math.abs(i - prevCell.pos.i),
        Math.abs(j - prevCell.pos.j)) ||
        !gGame.isOn ||
        gPlayer.isStuck ||
        targetCell.gameElement === WALL ||
        !targetCell.isEmpty && !pushingCell ||
        !targetCell.isEmpty && !pushingCell.isEmpty
    ) return

    // Start timer
    if (!gPlayer.firstMove) {
        gPlayer.firstMove = true
        startTimer()
    }

    // Cases for features
    if (targetCell.isFeature) {
        switch (targetCell.gameElement) {
            case GLUE:
                gPlayer.isStuck = true
                renderCell({ i, j }, KEEPER_RED_IMG)
                let glueScoreInterval = setInterval(() => {
                    gGame.stepsLeft--
                    renderScore()
                }, 1000)

                setTimeout(() => {
                    clearInterval(glueScoreInterval)
                    glueScoreInterval = null
                    renderCell({ i, j }, KEEPER_IMG)
                    gPlayer.isStuck = false
                }, 5000)
                break
            case CLOCK:
                renderCell({ i, j }, KEEPER_GREEN_IMG)
                break
            case GOLD:
                gGame.stepsLeft = 100
                renderCell({ i, j }, KEEPER_IMG)
                renderScore
                break
            default:
                break
        }
    }

    // PrevCell
    if (!prevCell.isTarget) {
        prevCell.gameElement = FLOOR
        renderCell(prevCell.pos, FLOOR_IMG)
    } else {
        prevCell.gameElement = TARGET
        renderCell(prevCell.pos, TARGET_IMG)
    }

    // Target cell
    if (!targetCell.isFeature) {
        if (!targetCell.isTarget) renderCell({ i, j }, KEEPER_IMG)
        else renderCell({ i, j }, KEEPER_ON_TARGET_IMG)
    }
    if (!targetCell.isTarget) targetCell.gameElement = KEEPER
    else targetCell.gameElement = KEEPER_ON_TARGET

    // Push Cargo Active
    if (!targetCell.isEmpty && pushingCell.isEmpty) {
        targetCell.isFeature = false
        pushingCell.isEmpty = false
        pushingCell.isFeature = false
        if (!pushingCell.isTarget) { // ↓ CARGO
            pushingCell.gameElement = CARGO
            renderCell(pushingCell.pos, CARGO_IMG)
        } else { // ↓ CARGO_ON_TARGET
            pushingCell.gameElement = CARGO_ON_TARGET
            renderCell(pushingCell.pos, CARGO_ON_TARGET_IMG)
        }
    }

    // Update model 
    prevCell.isEmpty = true
    prevCell.isFeature = false
    targetCell.isEmpty = false
    gPlayer.currPos = targetCell.pos
    gGame.states.push(gBoard)
    if (gGame.stepsLeft > 0) {
        renderCell({ i, j }, KEEPER_IMG)
        gGame.stepsLeft--
    } else gGame.stepsLeft--
    renderScore()
    checkGameOver()
}

function checkValidatedMove(iAbsDiff, jAbsDiff) {
    if ((iAbsDiff + jAbsDiff === 1) ||
        (jAbsDiff + iAbsDiff === 1) ||
        (iAbsDiff === gBoard.length - 1) ||
        (jAbsDiff === gBoard[0].length - 1)) return true
    return false
}

// Date & Time
function startTimer() {
    gGame.startTime = Date.now()
    gGame.intervals.gameTime = setInterval(updateTime, 111)
}

function resetTimer() {
    clearInterval(gGame.intervals.gameTime)
    renderScore()
    gGame.startTime = null

}

function updateTime() {
    document.querySelector('th span.timer').innerText = getDate(Date.now() - gGame.startTime)
}

function getDate(date) {
    const newDate = new Date(date)
    const minutes = newDate.getMinutes()
    const seconds = newDate.getSeconds()
    const miliSeconds = newDate.getMilliseconds()

    const minutesDisplay = (minutes + '').padStart(2, '0')
    const secondsDisplay = (seconds + '').padStart(2, '0')
    const miliSecondsDisplay = (miliSeconds + '').padStart(3, '0')

    if (minutes <= 0) return `${secondsDisplay}:${miliSecondsDisplay}`
    return `${minutesDisplay}:${secondsDisplay}:${miliSecondsDisplay}`
}

// Element
function addElement(value, valueImg) {
    var randCell = getEmptyCell()
    if (!randCell.isEmpty && !randCell.isTarget) return
    if (randCell.gameElement === EMPTY) return
    if (!randCell) return
    gBoard[randCell.pos.i][randCell.pos.j].isFeature = true
    randCell.gameElement = value
    renderCell(randCell.pos, valueImg)
    setTimeout(() => {
        removeElement(randCell, value)
    }, 4000)
}

function removeElement(cell, gameElement) {
    if (cell.gameElement !== gameElement) return
    if (cell.isFeature) {
        if (cell.isTarget) {
            cell.gameElement = TARGET
            renderCell(cell.pos, TARGET_IMG)
        } else {
            cell.gameElement = FLOOR
            renderCell(cell.pos, FLOOR_IMG)
        }
    }
    gBoard[cell.pos.i][cell.pos.j].isFeature = false
}