import "./App.css";
import CalendarComponent from "./components/calendar";
let jsonData = require("./dji.json");

function App() {
	return (
		<div className="App">
			<CalendarComponent data = {jsonData}/>
		</div>
	);
}

export default App;
