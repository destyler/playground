import { render } from 'solid-js/web'
import Counter from './Counter'

function App() {
  return (
    <div class="container">
      <h1>Solid App</h1>
      <Counter />
    </div>
  )
}

render(() => <App />, document.getElementById('app')!)
