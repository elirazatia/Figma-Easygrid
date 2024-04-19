function FigmaLayer(selectorPrefix) {
    // Empty layer
    let layer = {}
    let observers = Observer()

    // Which icon should be shown, depending on the type of layer
    function determineIconForType(type) { return 'frame' }
    
    // Update all relevant descriptor elements - Not grid dimentions etc...
    function updateUiDescriptors() {
        Object.keys(layer).forEach(key => {
            const value = layer[key]
            const element = document.querySelector(`${selectorPrefix}-${key}`)
            if (!element) return
    
            if (key === 'type') {
                // Custom handler
                // Determine icon type
                element.innerText = determineIconForType(value)
                return
            }
    
            element.value = value
            element.innerText = value
        })
    }

    return {
        observers,
        set layer(newLayer) {
            layer = newLayer
            updateUiDescriptors()
            observers.dispatch(layer)
        },
        get layer() { return layer },

        get width() { return layer?.w || 0 },
        get height() { return layer?.h || 0 }
    }
}