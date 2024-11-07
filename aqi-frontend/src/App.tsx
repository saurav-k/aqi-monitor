import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AQIChart from './components/AQIChart';
import OverallCard from './components/new-ui/OverallCard';
import AQIDetails from './components/new-ui/AQIDetails';



const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<AQIChart />} />
                <Route path="/aqi-details" element={<AQIDetails />} />
                <Route path="/new-aqi-chart" element={<OverallCard />} />
            </Routes>
        </Router>
    );
};

export default App;


// const App: React.FC = () => {

//     return (
//         <AQIChart />
//     );
// };

// export default App;
