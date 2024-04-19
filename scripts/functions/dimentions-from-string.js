function getDimentionsFromString(string, targetSize) {
    // The split
    const split = string.split(' ')
    let elements = []

    // Loop over the elements
    split.forEach(element => {
        let _ = element.split('*')
        let counter = _[1] ?? 1
        let value = _[0]
        if (split.length == 1) { // If there is only one element 
            counter = value
        }

        for (let i = 0; i < counter; i++) { elements.push(value) }
    })

    // Find total fraction count
    let totalFractions = elements
        .filter(val => !val.includes('pt'))
        .map(val => parseInt(val))
        .filter(val => !isNaN(val))
        .reduce((reducer, val) => { reducer += parseInt(val); return reducer }, 0)

    // Dimention 'reserved' by pt values
    let totalReservedDimention = elements
        .filter(val => val.includes('pt'))
        .map(val => parseInt(val.replace('pt', '')))
        .filter(val => !isNaN(val))
        .reduce((reducer, val) => { reducer += parseInt(val); return reducer }, 0)

    // Map into point values, based on the targetSize
    return elements.map(val => {
        let isPoint = val.includes('pt')
        if (isPoint) val = val.replace('pt', '')
        let number = parseInt(val)

        if (!isPoint) return ((targetSize - totalReservedDimention) / totalFractions) * number 
        else return number
    })
}