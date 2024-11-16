import { Chart, registerables } from 'chart.js';
import dynamic from 'next/dynamic';

// Register Chart.js plugins
Chart.register(...registerables);

// Conditionally import and register `chartjs-plugin-zoom`
if (typeof window !== 'undefined') {
  import('hammerjs'); // Ensure hammerjs is loaded
  import('chartjs-plugin-zoom').then((zoomPlugin) => {
    Chart.register(zoomPlugin.default); // Use `zoomPlugin.default` to register
  });
}

export default Chart;
