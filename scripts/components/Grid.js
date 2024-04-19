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
    let cellConnections = []

    let rows = []
    let columns = []
    let gapX = 0
    let gapY = 0

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
        let index = 0
        for (let y = 0; y < rowCount; y++) {
            for (let x = 0; x < columnCount; x++) {
                newCells.push({ index, x, y })
                index += 1
            }
        }

        // Store the cells
        cells = newCells

        // Reset all connections
        cellConnections = [
            {
                type: 'merge',
                initCell: [0,0],
                w: 2,
                h: 2,
            },
            {
                type: 'draw',
                cells: [
                    [3,3],
                    [3,4]
                ]
            }
        ] // TODO: Remove test input
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
        let cellsColumnCount = Math.max(...cells.map(cell => cell.x)) + 1 // +1 as index starts at 0; and length starts at 1
        let cellsRowCount = Math.max(...cells.map(cell => cell.y)) + 1 // See comment above
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
        
        // Split cell connectinos into their two distinct types
        let mergedCellConnections = cellConnections.filter(connection => connection.type === 'merge')
        let drawnCellConnections = cellConnections.filter(connection => connection.type === 'draw')

        // Filters cells that are part of a larger - Merged cell
        let visibleCells = cells.filter(cell => {
            let isInitialCell = mergedCellConnections.filter(connection => connection.initCell[0] == cell.x && connection.initCell[1] == cell.y)
            if (isInitialCell.length > 0) return true

            let withinBounds = mergedCellConnections.filter(connection => 
                isWithinBounds(cell.x, connection.initCell[0] + connection.w, connection.initCell[0]) &&
                isWithinBounds(cell.y, connection.initCell[1] + connection.h, connection.initCell[1]))
            return withinBounds.length == 0 
        })

        // Create the primary cells
        visibleCells.forEach(cell => {
            // Create the primary shape
            let mergedCell = mergedCellConnections.filter(connection =>
                connection.initCell[0] === cell.x && connection.initCell[1] === cell.y)[0]

            let w = columns[cell.x]
            let h = rows[cell.y]
            if (mergedCell) {
                w = xFor(cell.x + mergedCell.w - 1) - xFor(cell.x) + columns[cell.x]
                h = yFor(cell.y + mergedCell.h - 1) - xFor(cell.y) + rows[cell.y]
            }

            const td = renderCell(
                xFor(cell.x),
                yFor(cell.y),
                w,
                h,
            )

            // Assign to value and insert into the table
            td.cell = cell
            table.appendChild(td)
        })

        // Join into shapes where needed - For drawn cells
        drawnCellConnections.forEach(connection => connection.cells.forEach((subcell, index) => {
            let xIndex = subcell[0]
            let yIndex = subcell[1]

            const nextSubcell = (connection.cells[index + 1])
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
        }))

        table.style.width = `${xFor(Math.inf)}px`
        table.style.height = `${yFor(Math.inf)}px`
    }

    // Hover effects
    table.addEventListener('mousemove', (e) => {

    })

    // Cells Merge - TODO: These var names are awful.
    let mergeCellSession = null
    // let startCellIndex
    table.addEventListener('mousedown', (e) => {
        if (e.target?.cell == null) return console.info('Did not click on cell // REMOVE THIS WARNING')

        mergeCellSession = []
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
        // Push the connections
        cellConnections.push({ type: 'draw', cells: mergeCellSession })

        // Clear the session and re-render
        mergeCellSession = null
        renderGrid()
    })

    return {
        renderGrid
    }
}