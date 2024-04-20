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
            <svg event="delete" id="delete-button" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path opacity="0.6" d="M103.303 190.002H407.551C424.396 190.002 433.332 180.041 433.332 163.049V147.668C433.332 130.676 424.396 120.715 407.551 120.715H103.303C87.3359 120.715 77.5215 130.676 77.5215 147.668V163.049C77.5215 180.041 86.6035 190.002 103.303 190.002ZM177.717 394.201H333.137C363.312 394.201 375.471 377.795 380.158 348.059L400.812 211.389H110.041L130.842 348.059C135.383 377.941 147.541 394.201 177.717 394.201ZM213.312 353.771C206.135 353.771 200.129 347.766 200.129 340.588C200.129 336.926 201.74 333.996 204.23 331.506L237.043 298.4L204.23 265.295C201.74 262.805 200.129 259.875 200.129 256.213C200.129 249.035 206.135 243.322 213.312 243.322C216.828 243.322 219.465 244.641 222.248 247.131L255.354 280.383L288.898 246.984C291.682 244.494 294.318 243.029 297.834 243.029C305.012 243.029 310.871 248.889 310.871 256.213C310.871 259.729 309.553 262.365 306.916 265.148L273.811 298.4L306.77 331.359C309.26 333.996 310.871 336.779 310.871 340.588C310.871 347.619 304.865 353.771 297.834 353.771C294.025 353.771 291.096 352.16 288.605 349.816L255.354 316.564L222.395 349.816C219.904 352.16 216.828 353.771 213.312 353.771Z" fill="black"/>
            </svg>
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