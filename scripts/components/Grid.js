function Grid(selector) {
    const el = document.querySelector(selector)
    if (!el) throw new Error()

    // Generate the table
    const table = document.createElement('div')
    table.classList.add('table')
    el.appendChild(table)

    // Generate the visual for swiping / merging cells - \\\ NOT WORKING YET ///
    const swipeGesture = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    el.appendChild(swipeGesture)
    swipeGesture.style.position = 'absolute'
    swipeGesture.style.pointerEvents = 'none'

    // Store the cells
    let cells = []
    let rows = []
    let columns = []
    let gapX = 0
    let gapY = 0
    let cellCollector = {}

    // Methods
    function clearChildren() { Array.from(table.children).forEach(c => c.remove()) }

    function renderCell(x, y, w, h) {
        const td = document.createElement('div')
        td.classList.add('cell')
        td.style.width = `${w}px`
        td.style.height = `${h}px`
        td.style.left = `${x}px`
        td.style.top = `${y}px`
        return td
    }

    function setCells(
        rowCount,
        columnCount) {

        let newCells = []
        for (let y = 0; y < rowCount; y++) {
            for (let x = 0; x < columnCount; x++) {
                newCells.push(
                    [[x, y]] // Array of arrays; Each array contains an array of indexes that this cell covers
                )
            }
        }

        // Store the cells
        cells = newCells
    }

    function renderGrid(
        overrideRows = null,
        overrideColumns = null,
        overrideGapX = null,
        overrideGapY = null) {

        // Clear children
        clearChildren()

        // Update the rows and column stored values
        rows = overrideRows || rows
        columns = overrideColumns || columns
        gapX = overrideGapX || gapX
        gapY = overrideGapY || gapY

        // Ensure that setCells has been correctly called; If not - Automatically call it
        let cellsColumnCount = Math.max(...cells.map(cell => cell[0][0])) + 1 // +1 as index starts at 0; and length starts at 1
        let cellsRowCount = Math.max(...cells.map(cell => cell[0][1])) + 1 // See comment above
        if (cellsColumnCount != columns.length || cellsRowCount != rows.length) {
            setCells(
                rows.length,
                columns.length
            )
        }

        // Loop over each row
        const rFunction = (gap) => (reducer, value) => { reducer = reducer + value + gap; return reducer } // TODO ITEM /// Remember to add GAPS
        const xFor = (index) => columns.slice(0, index).reduce(rFunction(gapX), 0)
        const yFor = (index) => rows.slice(0, index).reduce(rFunction(gapY), 0)
        
        cells.forEach((cell, index) => {
            // Create main bounds
            cell.forEach(subcell => {
                let xIndex = subcell[0]
                let yIndex = subcell[1]

                const td = renderCell(
                    xFor(xIndex),
                    yFor(yIndex),
                    columns[xIndex],
                    rows[yIndex],
                )
                td.cell = {
                    index: index,
                    x: xIndex,
                    y: yIndex
                }

                table.appendChild(td)
            })

            // Create boxes to fill gaps
            cell.forEach((subcell, subcellIndex) => {
                let xIndex = subcell[0]
                let yIndex = subcell[1]

                const nextSubcell = (cells[index][subcellIndex + 1])
                if (!nextSubcell) return

                let movement = {
                    x: nextSubcell[0] - xIndex,
                    y: nextSubcell[1] - yIndex
                }

                let bounds = {}
                if (movement.x) {
                    let x = (movement.x > 0)
                        ? xFor(xIndex) + columns[xIndex]
                        : xFor(xIndex) - gapX
                    bounds = {
                        h: rows[yIndex], w: gapX,
                        x: x, y: yFor(yIndex),
                    }
                } else {
                    let y = (movement.y > 0)
                        ? yFor(yIndex) + rows[yIndex]
                        : yFor(yIndex) - gapY
                    bounds = {
                        h: gapY, w: columns[xIndex],
                        x: xFor(xIndex), y: y,
                    }
                }

                const td = renderCell(bounds.x, bounds.y, bounds.w, bounds.h)
                table.appendChild(td)
            })
        })

        table.style.width = `${xFor(Math.inf)}px`
        table.style.height = `${yFor(Math.inf)}px`
    }

    // Hover effects
    table.addEventListener('mousemove', (e) => {

    })

    // Cells Merge
    let mergeCellSession = null
    let startCellIndex
    table.addEventListener('mousedown', (e) => {
        if (e.target?.cell == null) return console.info('Did not click on cell // REMOVE THIS WARNING')
        mergeCellSession = []

        startCellIndex = e.target.cell.index
        mergeCellSession.push(e.target.cell)
    })

    table.addEventListener('mousemove', (e) => {
        if (!mergeCellSession) return
        if (e.target?.cell == null) return console.info('Did not move to cell // REMOVE THIS WARNING')

        const alreadySelected = mergeCellSession.filter(cell => 
            cell.x === e.target.cell.x && 
            cell.y === e.target.cell.y).length === 1
        
        if (!alreadySelected) mergeCellSession.push(e.target.cell)
    })

    table.addEventListener('mouseup', (e) => {
        console.log(mergeCellSession, startCellIndex)
        cells[startCellIndex] = mergeCellSession.map(session => [session.x, session.y])
        mergeCellSession = null

        renderGrid()
    })

    return {
        renderGrid
    }
}