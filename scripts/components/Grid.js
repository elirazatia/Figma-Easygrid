function Grid(selector) {
    const el = document.querySelector(selector)
    if (!el) throw new Error()

    // Generate the table
    const table = document.createElement('div')
    table.classList.add('table')
    el.appendChild(table)

    // Generate the visual for swiping / merging cells - \\\ NOT WORKING YET ///
    const canvas = document.createElement('canvas')
    const swipeGesture = canvas.getContext('2d')
    el.appendChild(canvas)
    canvas.style.position = 'absolute'
    canvas.style.pointerEvents = 'none'

    // Store the cells
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

    function setGridConfiguration(
        newRows,
        newColumns,
        newGapX,
        newGapY
    ) {
        rows = newRows
        columns = newColumns
        gapX = newGapX
        gapY = newGapY
    }

    function renderGrid() {
        // Clear children
        clearChildren()

        // Generate the bounds for the cells
        const bounds = cellBoundsFromConfigurations(
            rows,
            columns,
            gapX,
            gapY,
            cellConnections
        )


        // Insert all the bounds
        bounds.bounds.forEach((boundContainer, boundIndex) => boundContainer.forEach(subchild => {
            const td = renderCell(
                subchild.x,
                subchild.y,
                subchild.w,
                subchild.h,
            )

            // Assign to value and insert into the table
            td.cell = subchild.index
            td.setAttribute('bound-index', boundIndex)
            table.appendChild(td)
        }))

        // Get the size of the table
        table.style.width = `${bounds.xFor(Math.inf)}px`
        table.style.height = `${bounds.yFor(Math.inf)}px`

        canvas.style.width = `${bounds.xFor(Math.inf)}px`
        canvas.style.height = `${bounds.yFor(Math.inf)}px`
        canvas.setAttribute('width', bounds.xFor(Math.inf))
        canvas.setAttribute('height', bounds.yFor(Math.inf))
    }


    let mergeCellTool = 'merge' // draw - merge
    let mergeCellSession = null

    let __hoverEffectEl = []
    const setHoverEffectEl = (newEls) => {
        __hoverEffectEl.forEach(el => el.classList.remove('__hover'))
        __hoverEffectEl = newEls
        __hoverEffectEl.forEach(el => el.classList.add('__hover'))
    }

    const mouseEventCoordinateToTable = (mouseEvent) => {
        let theElement = mouseEvent.target
        let x = mouseEvent.layerX
        let y = mouseEvent.layerY

        return [
            x + parseFloat(theElement.style.left.replace('px', '')),
            y + parseFloat(theElement.style.top.replace('px', ''))
        ]
    }

    const toolEvents = {
        draw: {
            init(initCell, mouseEvent) {
                swipeGesture.strokeStyle = "red";
                swipeGesture.moveTo(...mouseEventCoordinateToTable(mouseEvent))

                return [initCell.x, initCell.y]
            },
            move(cell, mouseEvent) {
                swipeGesture.lineTo(...mouseEventCoordinateToTable(mouseEvent))
                swipeGesture.stroke()

                const isAlreadySelected = mergeCellSession.filter(existingCell => 
                    existingCell.x === cell.x && 
                    existingCell.y === cell.y).length === 1
                if (!isAlreadySelected) mergeCellSession.push(cell)
            },
            release(mouseEvent) { return { type: 'draw', cells: mergeCellSession.map(cell => [cell.x, cell.y]) } }
        },
        merge: {
            init(initCell, mouseEvent) { return {
                initMousePosition: mouseEventCoordinateToTable(mouseEvent),
                initCell: [initCell.x, initCell.y],
                offsetX: 1,
                offsetY: 1
            } },
            move(cell, mouseEvent) {
                const mousePosition = mouseEventCoordinateToTable(mouseEvent)
                swipeGesture.reset()
                swipeGesture.strokeStyle = "red";
                swipeGesture.setLineDash([5,2])
                swipeGesture.strokeRect(
                    mousePosition[0],
                    mousePosition[1],
                    mergeCellSession.initMousePosition[0] - mousePosition[0],
                    mergeCellSession.initMousePosition[1] - mousePosition[1]);

                mergeCellSession.offsetX = cell.x - mergeCellSession.initCell[0]
                mergeCellSession.offsetY = cell.y - mergeCellSession.initCell[1]
            },
            release(mouseEvent) {
                if (mergeCellSession.offsetX === 0 && mergeCellSession.offsetY === 0)
                    return

                let initCell = mergeCellSession.initCell
                if (mergeCellSession.offsetX < 0) { initCell[0] += mergeCellSession.offsetX }
                if (mergeCellSession.offsetY < 0) { initCell[1] += mergeCellSession.offsetY }

                const w = Math.abs(mergeCellSession.offsetX) + 1
                const h = Math.abs(mergeCellSession.offsetY) + 1

                return {
                    type: 'merge',
                    initCell: initCell,
                    w: w, h: h
                }
            }
        }
    }

    table.addEventListener('mousedown', (e) => {
        // Return if not clicked down on a grid cell
        if (e.target?.cell == null) return

        // Generate initial merge session
        mergeCellSession = toolEvents[mergeCellTool].init(e.target.cell, e)
        setHoverEffectEl([])
    })

    table.addEventListener('mouseleave', (e) => {
        // Remove hover effect
        setHoverEffectEl([])
        
        // Clear effects
        swipeGesture.reset()
        mergeCellSession = null
    })

    table.addEventListener('mousemove', (e) => {
        if (!mergeCellSession) {
            // Only show hover effect if user is not dragging
            // Hover effect
            const hoverIndex = e.target?.getAttribute('bound-index')
            setHoverEffectEl((hoverIndex !== null)
                ? table.querySelectorAll(`[bound-index='${hoverIndex}']`)
                : [])

            // Return if user is not pressing down
            return
        }
        if (e.target?.cell == null) return

        // Perform tool function
        toolEvents[mergeCellTool].move(e.target.cell, e)
    })

    table.addEventListener('mouseup', (e) => {
        // Push the connections
        const newConnectionModel = toolEvents[mergeCellTool].release(e)
        cellConnections.push(newConnectionModel)
        cellConnections = cellConnections.filter(i => (i)) // Filter out the new model if it returns new - i.e. Invalid

        // Clear the session and re-render
        mergeCellSession = null
        renderGrid()
    })

    return {
        renderGrid,
        setMergeTool(newTool) {
            if (!['draw', 'merge'].includes(newTool)) return console.info('Invalid tool selected in Grid()')
            mergeCellTool = newTool
        },

        setGridConfiguration,
        get connections() { return cellConnections },
        set connections(newValue) {
            cellConnections = newValue
        },
    }
}