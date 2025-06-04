export class ResponseHandler {
  static success(res, data, status = 200) {
    const responseData = data === null ? {} : data;
    
    return res.json(responseData, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    });
  }

  static error(res, error, status = 500) {
    console.error('Error:', error);
    
    return res.json({
      error: error.message || 'Internal Server Error',
      status: status
    }, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Content-Type': 'application/json'
    });
  }

  static corsResponse(res) {
    return res.send('', {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
  }
} 