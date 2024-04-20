// The Layers
let rootLayer = null

// Utility functions
const clone = (val) => JSON.parse(JSON.stringify(val))
const postMessage = (type, message) => {
    console.log(type, message)
    figma.ui.postMessage({
        type: type,
        model: message
    })
}
const getNearestFrameNode = () => {
    if (rootLayer == null) return figma.currentPage

    let layer = rootLayer
    while (!['FrameNode', 'PageNode'].includes(layer.constructor.name)) { layer = layer.parent }
    return layer
}

// Show the UI
figma.showUI(__html__, { width: 400, height: 700 })

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
            // Store into clientStorage
            figma.clientStorage.setAsync('plugin.layouts', message.model)
            break
        case 'event.applyToLayer':
            // Configuration
            const willDeleteLayer = message.model.replace
            const fillColor = message.model.fill || ''
            
            // Create the layers
            const positionShape = (node, item) => {
                node.x = item.x
                node.y = item.y
                node.resize(item.w, item.h)
            }
            const newShape = () => {
                const rect = figma.createRectangle()
                rect.fills = [{ type: 'SOLID', color: figma.util.rgb(fillColor) }]
                return rect
            }

            // Created layers
            let newLayers = []

            // Replacement layers
            let toReplace = figma.currentPage.selection.filter(node => node.id !== rootLayer.id)
            let willReplaceUsingSelection = (toReplace.length > 0)
            let replaceIndex = 0

            // Loop over the bounds
            message.model.bounds.forEach(item => {
                if (item.length === 1) {
                    // Simple shape
                    let newNode = (willReplaceUsingSelection)
                        ? toReplace[replaceIndex].clone()
                        : newShape()

                    positionShape(newNode, item[0])
                    newLayers.push(newNode)

                    // Reset replacement counter
                    replaceIndex += 1
                    if (replaceIndex >= toReplace.length)
                        replaceIndex = 0
                } else {
                    // Join into union as they are complex shapes
                    let boolean = figma.createBooleanOperation()
                    boolean.fills = [{ type: 'SOLID', color: figma.util.rgb(fillColor) }]
                    boolean.booleanOperation = 'UNION'
                    item.forEach(element => {
                        const newNode = newShape(element)
                        positionShape(newNode, element)
                        boolean.appendChild(newNode)
                    })
                    newLayers.push(boolean)
                }
            })

            // Delete if boolean is set to true
            if (willDeleteLayer)
                rootLayer.remove()

            // Group together to the nearest parent
            const group = figma.group(
                newLayers,
                getNearestFrameNode()
            )
            group.x = 0
            group.y = 0
            figma.viewport.scrollAndZoomIntoView([group])

            break
    }
}

// Dispatch layer changes
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