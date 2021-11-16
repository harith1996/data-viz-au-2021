import CalendarComponent from "./components/calendar";

let data = require('./generated_data_1987_2008.json');

function App() {
	return (
		<div className="App">
			<CalendarComponent data = {data}/>
		</div>
	);
	
	
}

export default App;
