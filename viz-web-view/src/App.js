import "./App.css";
import calendarComponent from "./components/calendar";
let jsonData = require("./dji.json");

function App() {
	return (
		<div className="App">
			<calendarComponent data = {jsonData}/>
		</div>
	);
}

export default App;
