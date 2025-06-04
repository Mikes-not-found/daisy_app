import 'dotenv/config';
import Router from './routes/router.js';

export default async ({ req, res, log, error }) => {
  
  if (req.path.startsWith('/api/')) { 
    return await Router.handleRequest(req, res);
  }

  // Handle unsupported paths
  return res.json({ error: 'Endpoint not found' });
};
