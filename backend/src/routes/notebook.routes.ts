import { Router } from 'express';
import { notebookController } from '../controllers/notebook.controller';

const router = Router();

router.get('/workspace', notebookController.getWorkspace);
router.post('/folders', notebookController.createFolder);
router.post('/notebooks', notebookController.createNotebook);
router.get('/notebooks/:id/pages', notebookController.getPages);
router.post('/notebooks/:id/pages', notebookController.savePage);

export default router;
