const cells = document.querySelectorAll('.block')!
const restartButton = document.querySelector('.restart>button')!

const combinations = [
  // Columns
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6]
]

let step : number = 0
let botsStep : boolean = false

let lastStep : number = 9

start()

cells.forEach( (e) => {
  e.addEventListener('click', async(event) => {
    let element = event.target as HTMLElement

    if (element!.textContent !== '' || step >= 9 || botsStep) return

    ;++step
    botsStep = !botsStep
    element!.textContent = (step % 2) ? 'X' : 'O'
    if (step >= 5) await checkCells()
    moveAI()
  })
})

restartButton.addEventListener('click', restart)

async function checkCells() : Promise<void> {
  let values : number[] = await checkCellsValues()
  
  for (let i = 0; i < combinations.length; i++) {
    if (cells[combinations[i][0]].textContent === cells[combinations[i][1]].textContent 
     && cells[combinations[i][0]].textContent === cells[combinations[i][2]].textContent
     && cells[combinations[i][0]].textContent !== '') {
      if ((values[combinations[i][0]] === 1 && botsStep ) || (values[combinations[i][0]] === 2 && !botsStep)) {
        alert('You won!')
      } else {
        alert('Your opponent won!')
      }
      step = 9
      break
    }
  }
}

function start() : void {
  botsStep = Boolean( Math.floor(Math.random() * 2) ) // if true, X - bot, O - player, else reverse

  if (botsStep) moveAI()
}

function checkCellsValues() : number[] {
  let tmp : number[] = []
  cells.forEach(e=>tmp.push(e.textContent==='X'?1:e.textContent==='O'?2:0)) // filter values
  return tmp
}

function filterCellsValues(values : any, player : number) : number[] {
  return values.map( (val : number, index : number) => {
    if (val === player) return index 
  }).filter( (val : number) => val !== undefined)
}

function restart() : void {
  step = 0
  lastStep = 9
  cells.forEach(e=>e.textContent='') // clear all cells

  start()
}

async function moveAI() : Promise<void> {
  if (step >= 9 || !botsStep) return

  let a : number = 9
  let done : boolean = false
  let maybe : number[] = [0, 2, 6, 8]
  let values : number[] = await checkCellsValues()
  let tmpId : number = 9

  ;switch (step) {
    case 0:
      ++step
      botsStep = !botsStep
      cells[4].textContent = (step % 2) ? 'X' : 'O'
    break

    case 1:
      if (cells[4].textContent === '') {
        a = 4
      } else {
        let b : number = Math.floor(Math.random() * 4)
        let maybe : number[] = [0, 2, 6, 8]
        lastStep = b
        a = maybe[b]
      }

      ++step
      botsStep = !botsStep
      cells[a].textContent = (step % 2) ? 'X' : 'O'
    break

    case 2:
      while (!done) {
        let b : number = Math.floor(Math.random() * 4)
        a = maybe[b]
        if (b === 0) b = 3
        else if (b === 1) b = 2
        else if (b === 2) b = 1
        else if (b === 3) b = 0
        if (cells[a].textContent === '' && cells[maybe[b]].textContent === '') done = true
      }

      ++step
      botsStep = !botsStep
      cells[a].textContent = (step % 2) ? 'X' : 'O'
    break

    case 3:
      // Check, has our player chance to win. If yes, prevent it.
      let tmpArray : number[] = filterCellsValues(values, 1)
      let tmpIntgr : number = 0
      a = 9

      combinations.forEach( (e, index) => {
        tmpIntgr = 0

        tmpArray.forEach(el => {
          if ( e.includes(el) ) ++tmpIntgr
        })

        if ( tmpIntgr === 2 ) {
          tmpId = ( combinations[index].filter( el => !tmpArray.includes(el) ) )[0] ?? 9
          if (tmpId && cells[tmpId].textContent === '') a = tmpId
        }
      })
      
      if (cells[a] && cells[a].textContent === '') { // if is clear front block of last step
        ;++step
        botsStep = !botsStep
        cells[a].textContent = (step % 2) ? 'X' : 'O'
        return
      }

      // Check, has our bot chance to win. If yes, do it.
      tmpArray = filterCellsValues(values, +(step % 2) + 1)

      combinations.forEach( (e, index) => {
        tmpIntgr = 0

        tmpArray.forEach(el => {
          if ( e.includes(el) ) ++tmpIntgr
        })

        if ( tmpIntgr === 2 ) {
          tmpId = ( combinations[index].filter( el => !tmpArray.includes(el) ) )[0] ?? 9
          if (tmpId && cells[tmpId].textContent === '') a = tmpId
        }
      })
      
      if (cells[a] && cells[a].textContent === '') { // if is clear front block of last step
        ;++step
        botsStep = !botsStep
        cells[a].textContent = (step % 2) ? 'X' : 'O'
        return
      }

      if (a === 9 || cells[a].textContent !== '') { // if not found win combinations of enemy
        if (lastStep === 0) lastStep = 3
        else if (lastStep === 1) lastStep = 2
        else if (lastStep === 2) lastStep = 1
        else if (lastStep === 3) lastStep = 0

        if (cells[maybe[lastStep]] && cells[maybe[lastStep]].textContent === '') { // if is clear front block of last step
          ;++step
          botsStep = !botsStep
          cells[maybe[lastStep]].textContent = (step % 2) ? 'X' : 'O'
          return 
        }
      } 

      while (!done) { // else generate random step
        let r : number = Math.floor(Math.random() * 2)

        switch (lastStep) {
          case 0:
          case 3:
            r = r === 0 ? 1 : 2
          break

          case 1:
          case 2:
            r = r === 1 ? 0 : 3
          break
        }

        let element = cells[maybe[r]]!
        if (element.textContent !== '') continue

        ;++step
        botsStep = !botsStep
        done = true
        element.textContent = (step % 2) ? 'X' : 'O'
      }
    break

    default:
      // Check, has our bot chance to win. If yes, do it.
      let tmpArr : number[] = filterCellsValues(values, +(step % 2) + 1)
      let tmpInt : number = 0

      combinations.forEach( (e, index) => {
        tmpInt = 0

        tmpArr.forEach(el => {
          if ( e.includes(el) ) ++tmpInt
        })

        if ( tmpInt === 2 ) {
          tmpId = ( combinations[index].filter( el => !tmpArr.includes(el) ) )[0] ?? 9
          if (tmpId && cells[tmpId].textContent === '') a = tmpId
        }
      })
      
      if (cells[a] && cells[a].textContent === '') { // if is clear front block of last step
        ;++step
        botsStep = !botsStep
        cells[a].textContent = (step % 2) ? 'X' : 'O'
        return checkCells()
      }

      // Check, has our player chance to win. If yes, prevent it.
      tmpArr = filterCellsValues(values, +!(step % 2) + 1)
      a = 9

      combinations.forEach( (e, index) => {
        tmpInt = 0

        tmpArr.forEach(el => {
          if ( e.includes(el) ) ++tmpInt
        })

        if ( tmpInt === 2 ) {
          tmpId = ( combinations[index].filter( el => !tmpArr.includes(el) ) )[0] ?? 9
          if (tmpId && cells[tmpId].textContent === '') a = tmpId
        }
      })
      
      if (cells[a] && cells[a].textContent === '') { // if is clear front block of last step
        ;++step
        botsStep = !botsStep
        cells[a].textContent = (step % 2) ? 'X' : 'O'
        return checkCells()
      }

      while (!done) {
        let r : number = Math.floor(Math.random() * 9)

        let element = cells[r]!
        if (element.textContent !== '') continue

        ;++step
        botsStep = !botsStep
        done = true
        element.textContent = (step % 2) ? 'X' : 'O'
        if (step >= 5) checkCells()
      }
    break
  }
}