function StoredLayoutDropdown(selector, editOverlaySelector, onLayoutSelected, onLayoutsChanged) {
    const el = document.querySelector(selector)

    const overlayEl = document.querySelector(editOverlaySelector)
    const overlayElList = overlayEl.querySelector('ul')
    const overlayElDoneButton = overlayEl.querySelector('.confirm-button')
    console.log(overlayElDoneButton)
    if (!el || !overlayEl) throw new Error()

    // The options
    let layouts = []
    let defaultLayouts = [
        {
            name: '5 x 5 Grid',
            layout: {
                rows: '5',
                columns: '5',
                gapX: '0',
                gapY: '0',
                connections: []
            }
        },
        {
            name: 'iPad - Sidebar',
            layout: {
                rows: '1',
                columns: '220pt 1',
                gapX: '0',
                gapY: '0',
                connections: []
            }
        },
        {
            name: 'iPhone 15 Safe Area',
            layout: {
                rows: '59pt 1 34pt',
                columns: '1',
                gapX: '0',
                gapY: '0',
                connections: []
            }
        },
        {
            name: 'Golden Ratio',
            layout: {
                rows: '8',
                columns: '13',
                gapX: '0',
                gapY: '0',
                connections: [
                    { type: 'merge', initCell: [0,0], w: 8 , h: 8 },
                    { type: 'merge', initCell: [8,0], w: 5 , h: 5 }
                ]
            }
        },
    ]

    // Overlay functions
    function openOverlay() {
        overlayEl.style.display = 'inline-block'
    }
    function closeOverlay() {
        overlayEl.style.display = 'none'
    }

    // Listen for dropdown changes
    el.addEventListener('change', (e) => {
        const value = el.value
        el.value = '' // Reset the dropdown

        // If value is managed, open the overlay window
        if (value === 'manage') return openOverlay()

        // Perform a onLayoutSelected change
        onLayoutSelected(
            [...layouts, ...defaultLayouts].filter(layout => layout.name === value)[0])
    })

    // Utility functions
    function makeSelectionGroup(label) {
        const optionGroup = document.createElement('optgroup')
        optionGroup.label = label
        return optionGroup
    }
    function makeSelectionOption(key, label) {
        const option = document.createElement('option')
        option.value = key
        option.innerText = label
        return option
    }
    function makeSelectionOverlayItem(label) {
        const option = document.createElement('li')
        option.innerHTML = `<li>
            <img src="https://assetbucket-a492924.s3.eu-west-2.amazonaws.com/frame.svg" alt="">
            <span>${label}</span>
            <div class="fill"></div>
            <img id="delete-button" src="assets/icons/delete-on-close.svg" alt="">
        </li>`

        return option
    }

    // Clear and make initial configuration
    el.innerHTML = ''
    overlayElList.innerHTML = ''
    const manageOptionsGroup = makeSelectionGroup('Options')
    const storedOptionsGroup = makeSelectionGroup('Saved Configurations')

    // Insert managment options
    manageOptionsGroup.appendChild(makeSelectionOption('', 'Saved Layouts'))
    manageOptionsGroup.appendChild(makeSelectionOption('manage', 'Manage'))
    el.appendChild(manageOptionsGroup)
    el.appendChild(storedOptionsGroup)

    // Generate initial layouts
    function updateLayoutOption() {
        [...defaultLayouts, ...layouts].forEach(layout => {
            // Append child into the dropdown list
            storedOptionsGroup.appendChild(makeSelectionOption(layout.name, layout.name))
        })

        layouts.forEach(layout => {
            // Append child into the overlay layer
            const overlayOption = makeSelectionOverlayItem(layout.name)
            overlayOption.querySelector('#delete-button').addEventListener('click', () => {
                alert('Delete')
            })
            overlayElList.appendChild(overlayOption)
        })
    }

    // Add event listener to dismiss overlay
    overlayElDoneButton.addEventListener('click', () => 
        closeOverlay())

    // Perform initial layouts update
    updateLayoutOption()

    return {
        set storedLayouts(newLayouts) {
            if (!Array.isArray(newLayouts))
                return layouts = []

            layouts = newLayouts
        }
    }
}