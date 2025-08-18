const app = require('./index');
const { initializeListeners } = require('./src/services/eventListenerService');

const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);

  // Initialize blockchain event listeners
  initializeListeners();
});
