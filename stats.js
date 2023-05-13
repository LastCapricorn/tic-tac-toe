const stats = ( function() {
  let people = 0

  // cache DOM
  const stats = document.querySelector('#stats')
  const statsOutput = stats.querySelector('span')

  // bind Events
  events.on('peopleChanged', setPeople)

  render()

  function render() {
    statsOutput.textContent = people
  }
  function setPeople(newPeople) {
    people = newPeople.length
    render()
  }
  function destroy() {
    stats.remove()
    events.off('peopleChanged', setPeople)
  }

  return { destroy }
})()
