'use strict'

function getRandomInt(min, max) {
    min = Math.ceil(min)
    max = Math.floor(max)
    return Math.floor(Math.random() * (max - min)) + min
}

function getCell(pos) {
    if (!pos) return
    if (pos.i < 0 || pos.j < 0) return
    if (pos.i > gBoard[0].length || pos.j > gBoard[0].length) return
    return gBoard[pos.i][pos.j]
}
function getEmptyCell() {
    let emptyCells = []
    for (var i = 1; i < gBoard.length - 1; i++) {
        for (var j = 1; j < gBoard[0].length - 1; j++) {
            if (gBoard[i][j].isEmpty) emptyCells.push({ i, j })
        }
    }
    const emptyCellPos = emptyCells[getRandomInt(0, emptyCells.length)]
    return gBoard[emptyCellPos.i][emptyCellPos.j]
}

function renderCell(pos, value) {
    var elCell = document.querySelector(`.cell-${pos.i}-${pos.j}`)
    elCell.innerHTML = value
}