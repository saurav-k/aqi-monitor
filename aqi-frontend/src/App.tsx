import React, { useEffect, useState } from 'react';

import AQIChart from './components/AQIChart';
import AQIChartMobile from './components/AQIChartMobile';
const App: React.FC = () => {

    // const [countdown, setCountdown] = useState<number>(30); // 30 seconds countdown

    // useEffect(() => {
    //     if (countdown === 0) {
    //         window.location.reload(); // Refresh the page when countdown hits 0
    //         setCountdown(30); // Reset countdown to 30 seconds
    //     }

    //     const timer = setTimeout(() => {
    //         setCountdown(prevCountdown => prevCountdown - 1);
    //     }, 1000); // Decrement every second

    //     return () => clearTimeout(timer); // Clear timeout on unmount
    // }, [countdown]); // Dependency on countdown to update every second

    return (
        // <div>
        //     <h1>Air Quality Index</h1>
            <AQIChart />
            // <AQIChartMobile />
            // {
                /* <div style={{ marginTop: '20px', fontSize: '16px' }}>
                Refreshing in: {countdown} seconds
            </div>
        </div> */
    // }

    );
};

export default App;
