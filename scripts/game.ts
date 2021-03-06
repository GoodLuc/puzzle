const board: HTMLElement | null = document.getElementById('board')

// Set tiles starting positions
const tilesStartingPositions: Array<number> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

// Set empty tile position (gap)
let emptyPos: number = 16

// Score Board: Timer
let time: Array<number> = [-10, 0]; const timer: HTMLElement | null = document.getElementById('timer') as HTMLElement
let timerClock = setInterval(function () {
  time[0]++
  if (time[0] > 0) {
    if (time[0] === 60) { time[1]++; time[0] = 0 }
    timer.innerHTML = time[1].toString().padStart(2, '0') + ":" + time[0].toString().padStart(2, '0')
  }
}, 1000)

// Score Board: Moves counter
let moves: number = 0
const movesCounter: HTMLElement | null = document.getElementById('moves') as HTMLElement
const message: HTMLElement | null = document.getElementById('message') as HTMLElement


if (board) {
  for (let counter: number = 1; counter <= 15; counter++) {
    // Create tiles
    let node = document.createElement('figure');
    // Set starting positions ("spos", tile backgrounds) and actual position markers ("apos", for moving). 
    node.setAttribute('data-spos', tilesStartingPositions[counter - 1].toString());
    node.setAttribute('data-apos', tilesStartingPositions[counter - 1].toString());
    board.appendChild(node);

    // Attach click listeners
    node.addEventListener('click', function (e) {
      if (e.target instanceof Element) {
        // Update Score Board Moves counter
        moves++; movesCounter.innerHTML = moves.toString()

        // Get actual position, for moving
        let apos: number = parseInt(e.target.getAttribute('data-apos') || '')

        // If there's an adjacent empty tile, move to it (+4, -4 and +1, -1 means there is room to move)
        if ((apos + 4 === emptyPos) || (apos - 1 === emptyPos) || (apos + 1 === emptyPos) || (apos - 4 === emptyPos)) {
          // Move current tile to empty gap position (emtpyPos) by setting "apos" data attribute
          e.target.setAttribute('data-apos', emptyPos.toString());
          // Specify new empty position after moving
          emptyPos = apos
          // Check if puzzle is solved
          if (emptyPos === 16) {
            let gamePassed: Boolean = true
            for (let i = 0; i < 15; i++) {
              // If 'apos' (current position) matches 'spos' (start position) in everycase, it means you won
              if (board.children[i].getAttribute('data-spos') !== board.children[i].getAttribute('data-apos')) {
                gamePassed = false
              }
            }
            // Let's party
            if (gamePassed) {
              setTimeout(function () {
                board.setAttribute('class', 'won')
                clearInterval(timerClock)
                document.getElementById('confetti-canvas')?.setAttribute('class', 'go')
                document.getElementById('score')?.setAttribute('class', 'won')
                message.innerHTML = "You Won!"
              }, 250);
            }
          }
        }
      }
    })
  }

  // Shuffle tiles at start
  function determineTileMotion(emptyPos: number, lastMove: number) {
    let choices: Array<number>
    // Determine posible move choices for each tile in a simple array
    switch (emptyPos) {
      case 1: choices = [+4, +1]; break;
      case 2: case 3: choices = [+4, +1, -1]; break;
      case 4: choices = [+4, -1]; break;
      case 5: case 9: choices = [+4, -4, +1]; break;
      case 8: case 12: choices = [+4, -4, -1]; break;
      case 13: choices = [-4, +1]; break;
      case 14: case 15: choices = [-4, +1, -1]; break;
      case 16: choices = [-4, -1]; break;
      default: choices = [+4, -4, +1, -1]; break;
    }
    // Filter the last movement in the shuffle motion to prevent any single tile from moving back and forth repeatedly
    choices = choices.filter(choice => choice != lastMove)
    // Select a movement direction at random from the posible choices
    let random: number = Math.floor(Math.random() * choices.length)
    return choices[random]
  }

  let lastMove: number = -1;
  let counter: number = 0;
  function moveRandomTile() {
    // Move tiles 100 times
    board?.setAttribute('class','shuffling')
    if (counter < 99) {
      // setTimeout to allow animation
      setTimeout(function () {
        let tileMotion: number = determineTileMotion(emptyPos, -lastMove)
        // Determine which tile to move by adding the tile motion to the gap position (emptyPos)
        let tileToMove = emptyPos + tileMotion
        let tile: HTMLElement = board?.querySelector('[data-apos="' + tileToMove + '"]') as HTMLElement
        // Move tile to gap
        tile.setAttribute('data-apos', emptyPos.toString());
        // Specify new gap position after moving
        emptyPos = tileToMove
        // Remember last tile motion to prevent repeating it in next iteration
        lastMove = tileMotion
        // Iterate
        counter++
        moveRandomTile()
      }, 100)
    } else {
      board?.classList.remove('shuffling')
    }
  }
  moveRandomTile()

}