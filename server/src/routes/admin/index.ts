export default () => ({
  type: 'admin',
  routes: [
    {
      method: 'POST',
      path: '/upload',
      handler: 'controller.uploadMedia',
      config: {
        policies: [],
      },
    },
  ],
});
