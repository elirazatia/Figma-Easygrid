// The figma layer
const figmaLayer = FigmaLayer('#layer')

// The grid
const grid = Grid('#grid-root')

// Config options
const columns = ConfigInput('#config-columns', '5')
const rows = ConfigInput('#config-rows', '5')
const gapColumn = ConfigInput('#config-column-gap', '5')
const gapRow = ConfigInput('#config-row-gap', '5')

// Config option updates
function rerenderGrid() {
    const columnString = columns.value
    const rowString = rows.value

    let gapX = parseInt(gapColumn.value) || 0
    let gapY = parseInt(gapRow.value) || 0
    let targetW = 0
    let targetH = 0

    // TODO: Bug - Gaps only render once - rather than for each element
    const columnElements = getDimentionsFromString(columnString, figmaLayer.width - gapX)
    const rowElements = getDimentionsFromString(rowString, figmaLayer.height - gapY)

    grid.renderGrid(
        rowElements,
        columnElements,
        gapX,
        gapY
    )
}

// Add listeners
[
    columns,
    rows,
    gapColumn,
    gapRow
].forEach(input => input.observers.add(rerenderGrid))

// Initial run
rerenderGrid()

// Listen for Figma layer changes
figmaLayer.observers.add(() => {
    console.log('changed figma layer')
    rerenderGrid()
})

// TODO: Remove - This is a sample post
window.onmessage({
    type: 'LAYER_SELECT',
    model: {
        name: 'Empty',
        type: 'frame',
        x: 100,
        y: 200, 
        w: 150,
        h: 250
    }
})