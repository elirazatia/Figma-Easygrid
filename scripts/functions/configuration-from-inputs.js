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
    let scaling = 1 // Get the actual size based on scaling - Don't overflow the container in preview
    if (width > maxDimention || height > maxDimention) {
        scaling = (width > height)
            ? maxDimention / width
            : maxDimention / height
    }

    // Convert the string into pixel sizes
    let targetW = width - (gapX * (numberOfXElements - 1))
    let targetH = height - (gapY * (numberOfYElements - 1))

    const columnElements = getDimentionsFromString(columns, targetW)
        .map(dimention => dimention * scaling)
    const rowElements = getDimentionsFromString(rows, targetH)
        .map(dimention => dimention * scaling)

    return {
        columns: columnElements,
        rows: rowElements,
        gapX: gapX * scaling,
        gapY: gapY * scaling
    }
}