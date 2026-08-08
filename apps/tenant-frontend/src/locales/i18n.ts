import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonId from './id/common.json';
import customerId from './id/customer.json';
import vendorId from './id/vendor.json';
import productId from './id/product.json';

const resources = {
  id: {
    common: commonId,
    customer: customerId,
    vendor: vendorId,
    product: productId,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'id',
    fallbackLng: 'id',
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes by default
    },
  });

export default i18n;
