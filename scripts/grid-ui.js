// The figma layer
const figmaLayer = FigmaLayer('#layer')

// The grid
const grid = Grid('#grid-root')

// Config options
const columns = ConfigInput('#config-columns', '1 2 3 2 2')
const rows = ConfigInput('#config-rows', '5')
const gapColumn = ConfigInput('#config-column-gap', '5')
const gapRow = ConfigInput('#config-row-gap', '5')

// Config option updates
function rerenderGrid() {
    const columnString = columns.value
    const rowString = rows.value

    let numberOfXElements = getElementsFromString(columnString).length
    let numberOfYElements = getElementsFromString(rowString).length
    
    let gapX = parseInt(gapColumn.value) || 0
    let gapY = parseInt(gapRow.value) || 0
    let targetW = figmaLayer.width - (gapX * (numberOfXElements - 1))
    let targetH = figmaLayer.height - (gapY * (numberOfYElements - 1))

    const columnElements = getDimentionsFromString(columnString, targetW)
    const rowElements = getDimentionsFromString(rowString, targetH)

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
rerenderGrid() // Render the grid with the initial settings

// Listen for Figma layer changes
figmaLayer.observers.add(() => rerenderGrid())

// Listen for tool changes
const toolSelector = ConfigInput('#grid-tool', 'merge')
toolSelector.observers.add(
    (newTool) => grid.setMergeTool(newTool))
grid.setMergeTool('merge')

// Listen for remove-merge button
document.querySelector('#reset-merge-button').addEventListener('click', () =>
    grid.clearCombinations())

// Listen for help button
// TODO - ADD THIS

// Listen for saved value dropdown change
const savedElementsDropdown = StoredLayoutDropdown(
    '#select-saved select',
    '.layout-overlay',
    (newLayout) => {
        if (!newLayout)
            return
    
        columns.value = newLayout.layout.columns
        rows.value = newLayout.layout.rows
        gapColumn.value = newLayout.layout.gapX
        gapRow.value = newLayout.layout.gapY
        rerenderGrid()
    }, // When selecting a layout
    (newLayoutList) => {
        
    }, // When updating the list of layouts - Post to figma,
    () => {
        return {
            columns: columns.value,
            rows: rows.value,
            gapX: gapColumn.value,
            gapY: gapRow.value,
        }
    } // Get the active layout
)

// Listen for Figma messages

// TODO: Remove - This is a sample post
// TODO: Needs to have a max width and scale correctly
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