import express from 'express';

//import uploadRoute from './routes/uploadRoute';
import MessageResponse from '../interfaces/MessageResponse';

const router = express.Router();

router.post<{}, MessageResponse>('/', (req, res) => {
  console.log(req.body)
  res.json({
    message: 'routes: upload',
  });
});

//router.use('/upload', uploadRoute);

export default router;