import { Chart, registerables } from 'chart.js';
import dynamic from 'next/dynamic';
// import zoomPlugin from 'chartjs-plugin-zoom';

// Dynamically import chartjs-plugin-zoom with SSR disabled
const ChartZoomPlugin = dynamic(() => import('chartjs-plugin-zoom'), {
    ssr: false,
  });
  
// Check if `window` is defined (i.e., the code is running in the browser)
if (typeof window !== 'undefined') {
    // Dynamically import `hammerjs` and `chartjs-plugin-zoom` on the client side
    import('hammerjs').then(() => {
      import('chartjs-plugin-zoom').then((zoomPlugin) => {
        Chart.register(...registerables, zoomPlugin.default); // Register plugins
      });
    });
  }

export default Chart;
