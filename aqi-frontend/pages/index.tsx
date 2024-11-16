import { Provider } from 'react-redux';
import store from '../src/store';
import AQIChart from '../src/components/AQIChart';

const Home = () => (
    <Provider store={store}>
        <AQIChart />
    </Provider>
);

export default Home;
