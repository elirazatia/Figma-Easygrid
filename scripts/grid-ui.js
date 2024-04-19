// The figma layer
const figmaLayer = FigmaLayer('#layer')

// The grid
const grid = Grid('#grid-root')

// Config options
const columns = ConfigInput('#config-columns', '2')
const rows = ConfigInput('#config-rows', '2')
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

    grid.setGridConfiguration(
        rowElements,
        columnElements,
        gapX,
        gapY
    )
    grid.renderGrid()
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
document.querySelector('#reset-merge-button')
    .addEventListener('click', () => {
        grid.connections = []
        rerenderGrid()
    })

// Listen for saved value dropdown change
const savedElementsDropdown = StoredLayoutDropdown(
    '#select-saved select',
    '.layout-overlay',
    (newLayout) => {
        // When selecting a layout
        if (!newLayout)
            return
    
        columns.value = newLayout.layout.columns
        rows.value = newLayout.layout.rows
        gapColumn.value = newLayout.layout.gapX
        gapRow.value = newLayout.layout.gapY
        grid.connections = newLayout.layout.connections

        rerenderGrid()
    },
    (newLayoutList) => {
        // When updating the list of layouts - Post to figma,
        parent.postMessage({pluginMessage: {
            type: 'event.setLayouts',
            model: newLayoutList
        }}, '*')
    },
    () => {
        // Get the active layout
        return {
            columns: columns.value,
            rows: rows.value,
            gapX: gapColumn.value,
            gapY: gapRow.value,
        }
    } 
)

// Listen for Figma messages
onmessage = (message) => {
    switch(message.type) {
        case 'event.select':
            figmaLayer.layer = message.model
            break
        case 'event.layouts':
            savedElementsDropdown.storedLayouts = message.model
            break
        default:
            console.info(`Posted message of type [${message.type}]; But there are no handlers for this.`)
    }
}
    
// TODO: Remove - This is a sample post
// TODO: Needs to have a max width and scale correctly
window.onmessage({
    type: 'event.select',
    model: {
        name: 'Empty',
        type: 'frame',
        x: 100,
        y: 200, 
        w: 150,
        h: 250
    }
})