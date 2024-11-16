import { Provider } from 'react-redux';
import store from '../src/store';
import OverallCard from '../src/components/new-ui/OverallCard';

const NewAQIChartPage = () => (
    <Provider store={store}>
        <OverallCard />
    </Provider>
);

export default NewAQIChartPage;
