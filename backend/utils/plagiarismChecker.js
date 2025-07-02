const fs = require('fs');
const path = require('path');
const cosineSimilarity = require('compute-cosine-similarity');
const mammoth = require('mammoth');
const { pipeline } = require('@xenova/transformers');

let extractor = null;

const loadModel = async () => {
  if (!extractor) {
    console.log("Loading plagiarism detection model...");
    extractor = await pipeline("feature-extraction", "Xenova/all-mpnet-base-v2");
    console.log("✅ Model loaded!");
  }
};

const extractText = async (filePath) => {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
};

const compareSimilarity = async (newFilePath, existingFilesWithMeta) => {
  await loadModel();

  const newText = await extractText(newFilePath);
  const newEmbedding = await extractor(newText, { pooling: 'mean', normalize: true });
  const newVector = Array.from(newEmbedding.data);

  let results = [];

  for (const file of existingFilesWithMeta) {
    const oldText = await extractText(file.path);
    const oldEmbedding = await extractor(oldText, { pooling: 'mean', normalize: true });
    const oldVector = Array.from(oldEmbedding.data);

    const similarity = cosineSimilarity(newVector, oldVector);

  results.push({
        similarity,
        studentId: file.studentId,
        studentName: file.studentName,
        uploadTime: file.uploadTime || null,
        course: file.course || null
      });
  }

  // Sort by similarity descending
  results.sort((a, b) => b.similarity - a.similarity);

  return results;
};

module.exports = { compareSimilarity };
