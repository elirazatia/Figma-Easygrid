function ConfigInput(selector, defaultValue) {
    const el = document.querySelector(selector)
    if (!el) throw new Error()

    let observers = Observer()
    let value = defaultValue
    el.value = defaultValue

    const validate = (newValue) => {
        return true
    }

    el.addEventListener('change', () => {
        if (!validate(el.value)) {
            el.value = value
            return 
        }

        value = el.value
        observers.dispatch(value)
    })

    return {
        observers,

        get value() { return value },
        set value(newValue) {
            if (!validate(newValue)) return

            value = newValue
            el.value = newValue
            observers.dispatch(value)
        },
    }
}