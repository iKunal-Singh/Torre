import './App.css';
// import ProfileStream from './ProfileStream'; // No longer used directly here
import DreamTeamPage from './pages/DreamTeamPage';

function App() {
  return (
    <div className="App">
      {/* The App-header can be removed or kept depending on overall layout desired */}
      {/* For now, I'll keep it simple and let DreamTeamPage control its own header if needed */}
      {/* <header className="App-header">
        <h1>Main Application</h1>
      </header> */}
      <main>
        {/* <ProfileStream />  // Replaced by DreamTeamPage */}
        <DreamTeamPage />
      </main>
    </div>
  );
}

export default App;
