import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  strapi.customFields.register({
    type: 'json',
    name: 'strapi-table',
    plugin: 'strapi-table',
  });
};

export default register;
