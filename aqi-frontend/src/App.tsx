import React from 'react';
import AQIChart from './components/AQIChart';

const App: React.FC = () => {
    return (
        <div className="App">
            <h1>AQI Monitoring Dashboard by using SDS011 sensor </h1>
            <AQIChart />
        </div>
    );
};

export default App;
