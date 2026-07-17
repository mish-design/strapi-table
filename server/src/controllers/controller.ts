import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  index(ctx) {
    ctx.body = strapi
      .plugin('custom-table')
      // the name of the service file & the method.
      .service('service')
      .getWelcomeMessage();
  },
  async uploadMedia(ctx) {
    try {
      const { file } = ctx.request.files || {};

      if (!file) {
        return ctx.badRequest('Файл не был передан');
      }

      const uploadService = strapi.plugin('upload').service('upload');
      const uploadedFiles = await uploadService.upload({
        data: {},
        files: file,
      });

      const fileData = Array.isArray(uploadedFiles) ? uploadedFiles[0] : uploadedFiles;

      ctx.body = {
        fileId: fileData.id,
        url: fileData.url,
        name: fileData.name,
      };
    } catch (err: any) {
      ctx.status = 500;
      ctx.body = { error: 'Ошибка при загрузке медиафайла', details: err.message };
    }
  },
});

export default controller;
