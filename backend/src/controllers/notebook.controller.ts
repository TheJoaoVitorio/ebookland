import { Request, Response } from 'express';
import { notebookService } from '../services/notebook.service';

export class NotebookController {
  async getWorkspace(req: Request, res: Response) {
    try {
      const data = await notebookService.getWorkspaceData();
      res.status(200).json(data);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createFolder(req: Request, res: Response) {
    try {
      const { name, color } = req.body;
      const folder = await notebookService.createFolder(name, color);
      res.status(201).json(folder);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createNotebook(req: Request, res: Response) {
    try {
      const { title, coverColor, folderId } = req.body;
      const notebook = await notebookService.createNotebook(title, coverColor, folderId);
      res.status(201).json(notebook);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getPages(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const pages = await notebookService.getPages(id);
      res.status(200).json(pages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async savePage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { pageNumber, content } = req.body;
      const page = await notebookService.savePage(id, pageNumber, content);
      res.status(200).json(page);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export const notebookController = new NotebookController();
