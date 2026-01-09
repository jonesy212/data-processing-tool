documents.ts
server/routes/documents.ts
// Example structure:
router.get('/documents/:id', getDocumentById);
router.put('/documents/:id/name', updateDocumentName);
router.post('/documents', addDocument);
router.put('/documents/:id', updateDocument);
router.delete('/documents/:id', deleteDocument);
... and all the other endpoints referenced