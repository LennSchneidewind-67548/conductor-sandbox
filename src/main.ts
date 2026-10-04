import { progress, total } from './water'

const GOAL_ML = 2000
let glasses = 0
const app = document.querySelector<HTMLDivElement>('#app')!

function render() {
  app.innerHTML = `
    <h1>Water</h1>
    <p>${total(glasses)} / ${GOAL_ML} ml (${Math.round(progress(glasses, GOAL_ML) * 100)}%)</p>
    <button id="add">+ glass</button>`
  app.querySelector('#add')!.addEventListener('click', () => { glasses++; render() })
}
render()
