function configurationFromInputs(
    columns,
    rows,
    gapX,
    gapY,
    width,
    height,
    maxDimention
) {
    let numberOfXElements = getElementsFromString(columns).length
    let numberOfYElements = getElementsFromString(rows).length

    // Get the gap value
    gapX = parseInt(gapX) || 0
    gapY = parseInt(gapY) || 0

    // Target value
    let targetW = width - (gapX * (numberOfXElements - 1))
    let targetH = height - (gapY * (numberOfYElements - 1))

    // Get the actual size based on scaling - Don't overflow the container in preview
    // TODO: Continue from here...

    // Convert the string into pixel sizes
    const columnElements = getDimentionsFromString(columns, targetW)
    const rowElements = getDimentionsFromString(rows, targetH)

    return {
        columns: columnElements,
        rows: rowElements,
        gapX: gapX,
        gapY: gapY
    }
}