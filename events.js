const events = {
  events: {},

  on: function(eventName, fn) {
    this.events[eventName] = this.events[eventName] || []
    this.events[eventName].push(fn)
  },
  off: function(eventName, fn) {
    for (let i = 0; i < this.events[eventName].length; i++) {
      if(this.events[eventName][i] === fn) {
        this.events[eventName].splice(i, 1)
        break
      }
    }
  },
  emit: function(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach( fn => fn(data))
    }
  }
}
