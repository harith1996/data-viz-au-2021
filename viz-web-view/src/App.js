import CalendarComponent from "./components/Calendar";
import Filters from './components/Filters'

let data = require('./json/generated_data_1987_2008.json');
let filterMetadata = require('./json/filters.json')
function App() {
	return (
		<div className="App">
			<Filters metadata = {filterMetadata} />
			<CalendarComponent data = {data}/>
		</div>
	);
	
	
}

export default App;
