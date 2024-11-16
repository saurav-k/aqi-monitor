import { Provider } from 'react-redux';
import store from '../src/store';
import AQIDetails from '../src/components/new-ui/AQIDetails';

const AQIDetailsPage = () => (
    <Provider store={store}>
        <AQIDetails />
    </Provider>
);

export default AQIDetailsPage;
