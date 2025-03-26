

const environment = process.env.NODE_ENV === 'production';

function errorHandler(error, req, res, next) {

  console.log('❌MESSAGE ==> ', error.message);
  console.log('STACK  =====> ', error.stack);

  if (typeof error.getStatusCode === 'function') {
    res.status(404).json({
      message: environment ? 'Internal server error' : error.message,
      stack: environment ? null : error.stack,
    });
  } else {
    res.status(500).json({
      message: environment ? 'Internal server error' : error.message,
      stack: environment ? null : error.stack,
    });
  }
}

module.exports = errorHandler;