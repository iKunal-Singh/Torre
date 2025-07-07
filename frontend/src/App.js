import './App.css';
import ProfileStream from './ProfileStream';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>SSE Client</h1>
      </header>
      <main>
        <ProfileStream />
      </main>
    </div>
  );
}

export default App;
