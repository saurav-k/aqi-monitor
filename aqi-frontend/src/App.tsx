import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Hotjar from '@hotjar/browser';
import AQIChart from './components/AQIChart';
import OverallCard from './components/new-ui/OverallCard';
import AQIDetails from './components/new-ui/AQIDetails';

const App: React.FC = () => {
    useEffect(() => {
        const siteId = 5216984; // Replace with your actual Hotjar Site ID
        const hotjarVersion = 6; // Use the appropriate Hotjar snippet version

        Hotjar.init(siteId, hotjarVersion);
    }, []); // Ensures this runs only once when the component mounts

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
