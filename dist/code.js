// Utility functions
const clone = (val) => JSON.parse(JSON.stringify(val))
const postMessage = (type, message) => {
    console.log(type, message)
    figma.ui.postMessage({
        type: type,
        model: message
    })
}

// Show the UI
figma.showUI(__html__, {
    width: 400,
    height: 700  
})

// Get stored layouts
figma.clientStorage.getAsync('plugin.layouts').then(data => {
    if (!Array.isArray(data)) return

    let validData = data.filter(item => 
        item.name !== null &&
        item.layout !== null &&
        item.layout.rows !== null &&
        item.layout.columns !== null &&
        item.layout.gapX !== null && 
        item.layout.gapY !== null)

    // Dispatch
    postMessage('event.layouts', validData)
})

// Listen for messages
figma.ui.onmessage = (message) => {
    console.log(message)
    switch(message.type) {
        case 'event.setLayouts':
            figma.clientStorage.setAsync('plugin.layouts', message.model)
            break
        case 'event.applyToLayer':
            const newShape = (item) => {
                const rect = figma.createRectangle()
                rect.x = item.x
                rect.y = item.y
                rect.resize(item.w, item.h)
                rect.fills = [{ type: 'SOLID', color: { r: 1, g: 0, b: 0 } }]
                return rect
            }

            message.model.forEach(item => {
                if (item.length === 1) {
                    // Simple shape
                    newShape(item[0])
                } else {
                    // Polygon
                    let boolean = figma.createBooleanOperation()
                    boolean.booleanOperation = 'UNION'
                    item.forEach(element => {
                        boolean.appendChild(newShape(element))
                    })
                }
            })
            break
    }
}

// Dispatch layer changes
let rootLayer = null

const getReplacementLayers = () => {
    const selection = figma.currentPage.selection
    if (selection.length <= 1) return []
    return selection.filter(e => (e.id != rootLayer.id))
}

const postLayerChange = () => {
    if (!rootLayer) return postMessage('event.select', null)
    postMessage('event.select', {
        name:rootLayer.name,
        type: rootLayer.constructor.name,
        w: rootLayer.width,
        h: rootLayer.height,
        x: rootLayer.x,
        y: rootLayer.y,
    })
}

let previousSelection = null
let previousAppliedSelection = null
const evaluateLayerChange = () => {
    const selection = figma.currentPage.selection

    if (selection.length === 0) rootLayer = null
    else if (selection.length > 0 && rootLayer == null) rootLayer = selection[0]
    else if (selection.length > 0 && rootLayer != null) {
        let exists = selection.filter(e => e.id === rootLayer.id)[0]
        if (!exists) rootLayer = selection[0]
    }

    if ((previousAppliedSelection && selection.length === previousAppliedSelection.length) &&
        !(previousSelection.length === 1 && selection.length >= 2)) {
        let doesMatch = true
        let currentIDs = {}
        selection.forEach(selected => (currentIDs[selected.id] = true))
        previousAppliedSelection.selection.forEach(selected => {
            if (!currentIDs[selected.id]) doesMatch = false
        })

        if (doesMatch) rootLayer = previousAppliedSelection.rootLayer
    }

    // if previousSelection length is not zero && currentSelection is greater then
    if (selection.length >= 2) 
        previousAppliedSelection = { selection, rootLayer, length:selection.length }

    previousSelection = selection
    postLayerChange()
}

// Listen for Figma
figma.on("selectionchange", () => evaluateLayerChange())
evaluateLayerChange()