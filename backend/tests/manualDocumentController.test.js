import { beforeEach, describe, expect, it, vi } from 'vitest';
import fs from 'node:fs/promises';
import ManualDocument from '../models/ManualDocument.js';
import Branch from '../models/Branch.js';
import ROLES from '../constants/roles.js';
import {
  createManualDocument,
  getManualDocumentImage,
  deleteManualDocument,
} from '../controllers/manualDocumentController.js';

vi.mock('node:fs/promises', () => ({
  default: {
    unlink: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../models/ManualDocument.js', () => ({
  default: {
    create: vi.fn(),
    findOne: vi.fn(),
    findOneAndDelete: vi.fn(),
  },
}));

vi.mock('../models/Branch.js', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

describe('Manual document controller', () => {
  const ownBranchId = '507f1f77bcf86cd799439011';
  const documentId = '507f1f77bcf86cd799439012';

  let req;
  let res;
  let next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      user: {
        _id: '507f1f77bcf86cd799439013',
        role: ROLES.SELLER,
        branch: ownBranchId,
      },
      body: {
        documentDetails: 'Supplier invoice',
        note: 'October',
      },
      query: {},
      params: { id: documentId, index: '0' },
      files: [
        {
          path: 'uploads/manual-documents/one.jpg',
          filename: 'one.jpg',
        },
        {
          path: 'uploads/manual-documents/two.png',
          filename: 'two.png',
        },
      ],
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      sendFile: vi.fn((filePath, callback) => callback()),
      end: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
  });

  it('removes all uploaded files when request validation fails', async () => {
    req.body.documentDetails = '';

    await createManualDocument(req, res, next);

    expect(fs.unlink).toHaveBeenCalledTimes(2);
    expect(fs.unlink).toHaveBeenCalledWith(
      'uploads/manual-documents/one.jpg',
    );
    expect(fs.unlink).toHaveBeenCalledWith(
      'uploads/manual-documents/two.png',
    );
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ issues: expect.any(Array) }),
    );
    expect(ManualDocument.create).not.toHaveBeenCalled();
  });

  it('stores all uploaded images and returns protected image URLs', async () => {
    Branch.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue({ _id: ownBranchId }),
    });

    ManualDocument.create.mockResolvedValue({
      toObject: () => ({
        _id: documentId,
        images: [
          '/uploads/manual-documents/one.jpg',
          '/uploads/manual-documents/two.png',
        ],
      }),
    });

    await createManualDocument(req, res, next);

    expect(ManualDocument.create).toHaveBeenCalledWith(
      expect.objectContaining({
        images: [
          '/uploads/manual-documents/one.jpg',
          '/uploads/manual-documents/two.png',
        ],
        branch: ownBranchId,
        createdBy: req.user._id,
      }),
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        data: {
          document: expect.objectContaining({
            imageUrls: [
              `/api/v1/manual-documents/${documentId}/images/0`,
              `/api/v1/manual-documents/${documentId}/images/1`,
            ],
          }),
        },
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it('does not return an image belonging to another branch', async () => {
    const select = vi.fn().mockResolvedValue(null);
    ManualDocument.findOne.mockReturnValue({ select });

    await getManualDocumentImage(req, res, next);

    expect(ManualDocument.findOne).toHaveBeenCalledWith({
      _id: documentId,
      branch: ownBranchId,
    });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
    expect(res.sendFile).not.toHaveBeenCalled();
  });

  it('does not delete a document belonging to another branch', async () => {
    ManualDocument.findOneAndDelete.mockResolvedValue(null);

    await deleteManualDocument(req, res, next);

    expect(ManualDocument.findOneAndDelete).toHaveBeenCalledWith({
      _id: documentId,
      branch: ownBranchId,
    });
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
    expect(fs.unlink).not.toHaveBeenCalled();
    expect(res.end).not.toHaveBeenCalled();
  });

  it('rejects an image index outside the document image list', async () => {
    const select = vi.fn().mockResolvedValue({
      images: ['/uploads/manual-documents/one.jpg'],
    });
    ManualDocument.findOne.mockReturnValue({ select });
    req.params.index = '4';

    await getManualDocumentImage(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ statusCode: 404 }),
    );
    expect(res.sendFile).not.toHaveBeenCalled();
  });
});
