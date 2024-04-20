function Overlay(overlaySelector, contentLayout) {
    const overlay = document.querySelector(overlaySelector)
    const content = document.querySelector(contentLayout)
    if (!overlay || !content) throw new Error()

    // State listeners
    let onEvent = () => {}

    // Elements
    const list = content.querySelector('ul')
    const input = content.querySelector('input')

    // List handlers
    const listElementTypes = {
        'layout': (args) => `
            <img src="https://assetbucket-a492924.s3.eu-west-2.amazonaws.com/frame.svg" alt="">
            <span>${args.name}</span>
            <div class="fill"></div>
            <img event="delete" id="delete-button" src="assets/icons/delete-on-close.svg" alt="">
        `
    }

    // Helpers
    const present = () => {
        overlay.style.display = 'inline-block'
    }

    const dismiss = (props) => {
        overlay.style.display = 'none'
        onEvent(props || {})
        onEvent = () => {}

        // Hide both content types
        list.style.display = 'none'
        input.style.display = 'none'

        // Clear any values
        input.value = ''
        list.innerHTML = ''

        // Cancel button
        cancelButton.style.display = 'none'
    }

    // Listen for done button
    content.querySelector('.confirm-button').addEventListener('click', () => dismiss({
        input: input.value
    }))
    
    // Listen for cancel button
    const cancelButton = content.querySelector('.cancel-button')
    cancelButton.addEventListener('click', () => dismiss())

    // Dismiss on overlay click
    overlay.addEventListener('click', () => dismiss())
    content.addEventListener('click', (e) => e.stopImmediatePropagation())

    // Hide by default
    dismiss()
    
    return {
        present(
            title,
            message,
            onEventHandler
        ) {
            // Show the overlay
            present()
            onEvent = onEventHandler || (() => console.info('Unhandled event listener'))

            // Set headings
            content.querySelector('#overlay-title').innerText = title
            content.querySelector('#overlay-message').innerText = message

            return {
                listOptions: {
                    add(type, props, events) {
                        // Make sure the list is visible
                        list.style.display = 'block'

                        // Generate and append all list items
                        const LiElement = document.createElement('li')
                        const LiElementHTML = listElementTypes[type](props)

                        LiElement.innerHTML = LiElementHTML
                        list.appendChild(LiElement)

                        Object.keys(events).forEach(eventKey => {
                            const trigger = LiElement.querySelector(`[event="${eventKey}"]`)
                            trigger.addEventListener('click',() => events[eventKey](LiElement))
                        })
                    },
                },

                input(defaultValue, placeholder) {
                    // Make sure the input is visble
                    input.style.display = 'block'
                    cancelButton.style.display = 'block'

                    // Apply the attributes
                    input.value = defaultValue
                    input.placeholder = placeholder
                }
            }
        }
    }
}