import { prisma } from '../db';

export class NotebookService {
  async getWorkspaceData() {
    const folders = await prisma.folder.findMany({ include: { notebooks: true } });
    const standaloneNotebooks = await prisma.notebook.findMany({ where: { folderId: null } });
    return { folders, standaloneNotebooks };
  }

  async createFolder(name: string, color: string) {
    return prisma.folder.create({ data: { name, color } });
  }

  async createNotebook(title: string, coverColor: string, folderId?: string) {
    return prisma.notebook.create({ data: { title, coverColor, folderId } });
  }

  async getPages(notebookId: string) {
    return prisma.notebookPage.findMany({ 
      where: { notebookId }, 
      orderBy: { pageNumber: 'asc' } 
    });
  }

  async savePage(notebookId: string, pageNumber: number, content: string) {
    return prisma.notebookPage.upsert({
      where: {
        notebookId_pageNumber: { notebookId, pageNumber }
      },
      update: { content },
      create: { notebookId, pageNumber, content }
    });
  }
}

export const notebookService = new NotebookService();
