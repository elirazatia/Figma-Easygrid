function cellBoundsFromConfigurations(
    rows,
    columns,
    gapX,
    gapY,
    cellConnections,
) {
    if (!rows || !columns)
        throw new Error()

    console.log(rows, columns, gapX, gapY, cellConnections)
    // Empty bounds
    let bounds = []

    // Create [x,y] cells
    let cells = []
    let index = 0
    for (let y = 0; y < rows.length; y++) {
        for (let x = 0; x < columns.length; x++) {
            cells.push({ index, x, y })
            index += 1
        }
    }

    // Utility functions for determinting sizes
    const rFunction = (gap) => (reducer, value) => { reducer = reducer + value + gap; return reducer } // TODO ITEM /// Remember to add GAPS
    const xFor = (index) => columns.slice(0, index).reduce(rFunction(gapX), 0)
    const yFor = (index) => rows.slice(0, index).reduce(rFunction(gapY), 0)

    // Split cell connectinos into their two distinct types
    let mergedCellConnections = cellConnections.filter(connection => connection.type === 'merge')
    let drawnCellConnections = cellConnections.filter(connection => connection.type === 'draw')    
    let allCellsWhereDrawn = drawnCellConnections.map(connection => connection.cells).flat()

    // Filters cells that are part of a larger - Merged cell
    let visibleCells = cells.filter(cell => {
        let isInitialCell = mergedCellConnections.filter(connection => connection.initCell[0] == cell.x && connection.initCell[1] == cell.y)
        if (isInitialCell.length > 0) return true

        let withinBounds = mergedCellConnections.filter(connection => 
            isWithinBounds(cell.x, connection.initCell[0] + connection.w, connection.initCell[0]) &&
            isWithinBounds(cell.y, connection.initCell[1] + connection.h, connection.initCell[1])
        )
        return withinBounds.length == 0 
    })

    // Create the primary cells - Only handle main bounds where not merged
    visibleCells
        .filter(cell => allCellsWhereDrawn.filter(i => cell.x === i[0] && cell.y === i[1]).length == 0)
        .forEach(cell => {
        // Create the primary shape
        let mergedCell = mergedCellConnections.filter(connection =>
            connection.initCell[0] === cell.x && connection.initCell[1] === cell.y)[0]

        let w = columns[cell.x]
        let h = rows[cell.y]
        if (mergedCell) {
            console.log(mergedCell)
            w = xFor(cell.x + mergedCell.w - 1) - xFor(cell.x) + columns[cell.x + mergedCell.w - 1]
            h = yFor(cell.y + mergedCell.h - 1) - yFor(cell.y) + rows[cell.y + mergedCell.h - 1]
        }

        bounds.push([
            {
                index: { x: cell.x, y: cell.y },
                x: xFor(cell.x), y: yFor(cell.y), w: w, h: h
            }
        ])
    })

    // Join into shapes where needed - For drawn cells
    drawnCellConnections.forEach(connection => {
        let connectionBounds = []

        connection.cells.forEach((subcell, index) => {
            let xIndex = subcell[0]
            let yIndex = subcell[1]

            // Generate the primary bound
            connectionBounds.push({
                index: { x: subcell.x, y: subcell.y },
                x: xFor(xIndex),
                y: yFor(yIndex),
                w: columns[xIndex],
                h: rows[yIndex],    
            })

            // Generate bounds for the subconnections
            const nextSubcell = (connection.cells[index + 1])
            if (!nextSubcell) return
    
            let movement = { x: nextSubcell[0] - xIndex, y: nextSubcell[1] - yIndex }
            let bounds = {}

            // Determine if the next cell is neg/pos x/y
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

            connectionBounds.push({
                index: { x: subcell.x, y: subcell.y },
                ...bounds
            })
        })

        bounds.push(connectionBounds)
    })

    return { 
        bounds,
        xFor,
        yFor
    }
}