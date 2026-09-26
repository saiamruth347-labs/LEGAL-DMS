const aiService = require('../services/ai.service');
const { createAuditLog } = require('../middleware/audit');

/**
 * Natural language intelligent search
 */
async function smartSearch(req, res) {
  try {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const results = await aiService.smartSearch(query);

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'AI_NLP_SEARCH',
      resourceType: 'SEARCH',
      status: 'SUCCESS',
      details: { query, resultsCount: results.totalResults },
    });

    return res.json({ success: true, ...results });
  } catch (err) {
    console.error('AI smart search error:', err);
    return res.status(500).json({ success: false, message: 'AI search failed' });
  }
}

/**
 * Summarize document content or arbitrary legal text
 */
async function summarize(req, res) {
  try {
    const { text, title, category, caseId } = req.body;
    if (!text && !title) {
      return res.status(400).json({ success: false, message: 'Text or title required for summarization' });
    }

    const analysis = await aiService.summarizeDocument(text, { title, category, caseId });

    await createAuditLog({
      req,
      userId: req.user.id,
      userName: req.user.fullName,
      userRole: req.user.role,
      action: 'AI_SUMMARIZE',
      resourceType: 'DOCUMENT',
      status: 'SUCCESS',
      details: { title: title || 'Arbitrary Text', confidence: analysis.confidenceScore },
    });

    return res.json({ success: true, analysis });
  } catch (err) {
    console.error('AI summarize error:', err);
    return res.status(500).json({ success: false, message: 'AI summarization failed' });
  }
}

/**
 * Predict document classification
 */
async function classify(req, res) {
  try {
    const { text, fileName } = req.body;
    if (!text && !fileName) {
      return res.status(400).json({ success: false, message: 'Text or fileName required for classification' });
    }

    const classification = aiService.classifyDocument(text, fileName);
    return res.json({ success: true, classification });
  } catch (err) {
    console.error('AI classify error:', err);
    return res.status(500).json({ success: false, message: 'AI classification failed' });
  }
}

module.exports = {
  smartSearch,
  summarize,
  classify,
};
