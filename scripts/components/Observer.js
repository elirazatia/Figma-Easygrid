function Observer() {
    let observers = []
    return {
        add(observer) { observers.push(observer) },
        dispatch(value) { observers.forEach(o => o(value )) }
    }
}