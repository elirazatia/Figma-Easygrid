// The figma layer
const figmaLayer = FigmaLayer('#layer')

// The grid
const grid = Grid('#grid-root')

// The overlay controller
const overlay = Overlay(
    '.layout-overlay',
    '.layout-content'
)

// Config options
const columns = ConfigInput('#config-columns', '2')
const rows = ConfigInput('#config-rows', '2')
const gapColumn = ConfigInput('#config-column-gap', '5')
const gapRow = ConfigInput('#config-row-gap', '5')

// Config option updates
function rerenderGrid() {
    const configuration = configurationFromInputs(
        columns.value,
        rows.value,
        gapColumn.value,
        gapRow.value,
        figmaLayer.width,
        figmaLayer.height,
        300
    )

    // Apply configuration and render the grid
    grid.setGridConfiguration(
        configuration.rows,
        configuration.columns,
        configuration.gapX,
        configuration.gapY
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
    overlay,
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
            connections: grid.connections
        }
    } 
)

// Listen for Figma messages
onmessage = (message) => {
    switch(message.data.pluginMessage.type) {
        case 'event.select':
            figmaLayer.layer = message.data.pluginMessage.model || {
                name: 'None Specified',
                type: 'None',
                x: 0,
                y: 0,
                w: 100,
                h: 100
            }
            break
        case 'event.layouts':
            savedElementsDropdown.storedLayouts = message.data.pluginMessage.model || []
            break
        default:
            console.info(`Posted message of type [${message.type}]; But there are no handlers for this.`)
    }
}

// Post to Figma on button
document.querySelector('#apply-to-element').addEventListener('click', () => {
    const configuration = configurationFromInputs(
        columns.value,
        rows.value,
        gapColumn.value,
        gapRow.value,
        figmaLayer.width,
        figmaLayer.height,
    )

    const bounds = cellBoundsFromConfigurations(
        configuration.rows,
        configuration.columns,
        configuration.gapX,
        configuration.gapY,
        grid.connections
    )

    parent.postMessage({ pluginMessage: {
        type: 'event.applyToLayer',
        model: bounds.bounds
    }}, '*')

    console.log('Dispatch bounds to Figma event', bounds)
})

// Inital selection
window.onmessage({
    data: { pluginMessage: {
        type: 'event.select',
        model: null
    }}
})