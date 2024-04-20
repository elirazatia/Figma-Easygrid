function StoredLayoutDropdown(selector, overlayComponent, onLayoutSelected, onLayoutsChanged, getActiveLayout) {
    const el = document.querySelector(selector)
    if (!el || !overlayComponent) throw new Error()

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

    // Listen for dropdown changes
    el.addEventListener('change', (e) => {
        const value = el.value
        el.value = '' // Reset the dropdown

        // If value is managed, open the overlay window
        if (value === 'manage') {
            // Generate the overlay
            const overlay = overlayComponent.present(
                'Manage Your Layouts',
                'These are saved across your account.'
            )

            // Add all the layout options
            layouts.forEach(layout => {
                overlay.listOptions.add('layout', layout, {
                    'delete': (theElement) => {
                        // Filter and save the new filter list
                        layouts = layouts.filter(layout => layout.name != layout.name)
                        onLayoutsChanged(layouts)
                        updateLayoutOption()

                        // Remove the element from the preview list
                        theElement.remove()
                    }
                })
            })
        } else if (value === 'save') {
            overlayComponent.present(
                'Save Layout',
                'Give your layout a memorable name.',
                (response) => {
                    // Validate the name
                    const name = response.input
                    if (!name) return

                    // Store into the layouts array and notify the handler to store into Figma local storage
                    const config = getActiveLayout()
                    layouts.push({ name: name, layout: config })
                    updateLayoutOption()
                    onLayoutsChanged(layouts)
                }
            ).input('', 'New Layout')
        } else {
            // Perform a onLayoutSelected change
            onLayoutSelected(
                [...layouts, ...defaultLayouts].filter(layout => layout.name === value)[0])
        }
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
   
    // Clear and make initial configuration
    el.innerHTML = ''
    const manageOptionsGroup = makeSelectionGroup('Options')
    const storedOptionsGroup = makeSelectionGroup('Saved Configurations')

    // Insert managment options
    manageOptionsGroup.appendChild(makeSelectionOption('', 'Saved Layouts'))
    manageOptionsGroup.appendChild(makeSelectionOption('manage', 'Manage'))
    manageOptionsGroup.appendChild(makeSelectionOption('save', 'Save Layout'))
    el.appendChild(manageOptionsGroup)
    el.appendChild(storedOptionsGroup)

    // Generate initial layouts
    function updateLayoutOption() {
        // Clear existing options
        storedOptionsGroup.innerHTML = ''

        // Loop over all layouts and render them
        let allLayouts = [...defaultLayouts, ...layouts]
        allLayouts.forEach(layout => {
            // Append child into the dropdown list
            storedOptionsGroup.appendChild(makeSelectionOption(layout.name, layout.name))
        })
    }

    // Perform initial layouts update
    updateLayoutOption()

    return {
        set storedLayouts(newLayouts) {
            if (!Array.isArray(newLayouts))
                return layouts = []

            layouts = newLayouts
            updateLayoutOption()
        }
    }
}