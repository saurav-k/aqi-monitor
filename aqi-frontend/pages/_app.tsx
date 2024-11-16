import { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import store from '../src/store';
import 'antd/dist/reset.css'; // Import Ant Design styles
import { ConfigProvider } from 'antd';

const MyApp = ({ Component, pageProps }: AppProps) => (
  <ConfigProvider>
    <Provider store={store}>
      <Component {...pageProps} />
    </Provider>
  </ConfigProvider>
);

export default MyApp;
