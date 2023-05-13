const people = (function() {

  const people = ['Maya', 'Daisy', 'Ally']

    // cacheDom
    const container = document.querySelector('#container')
    const input = document.querySelector('input')
    const addButton = document.querySelector('#add-button')
      // const removeButtons = document.querySelectorAll('.remove-button')

    // bindEvents
    addButton.addEventListener('click', addPerson)
      // removeButtons.forEach( btn => btn.addEventListener('click', removePerson))

    _render()

    function _render() {
      container.querySelectorAll('#container div').forEach( child => container.removeChild(child))
      for (let i = 0; i < people.length; i++) {
        const elem = document.createElement('div')
        const innerElem = document.createElement('p')
        const innerElemButton = document.createElement('button')
        elem.setAttribute('class', 'name-box')
        innerElem.textContent = people[i]
        innerElemButton.textContent = 'X'
        innerElemButton.setAttribute('value', i)
        innerElemButton.addEventListener('click', removePerson)
        elem.appendChild(innerElem)
        elem.appendChild(innerElemButton)
        container.appendChild(elem)
      }
      // stats.setPeople(people.length)
      events.emit('peopleChanged', people)
    }

    function addPerson(value) {
      const name = (typeof value === 'string') ? value : input.value
      people.push(name)
      input.value = ''
      _render()
    }

    function removePerson(event) {
      const number = (typeof event === 'number') ? event : event.target.value
      people.splice(number, 1)
      _render()
    }

    return { addPerson, removePerson }
})()
