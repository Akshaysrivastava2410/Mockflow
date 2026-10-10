const Api = require('../models/Api');
const { normalize } = require('./apiController');

// "users/:id" matches "users/42"
const matchPattern = (pattern, path) => {
  const p = pattern.split('/');
  const s = path.split('/');
  return p.length === s.length && p.every((seg, i) => seg.startsWith(':') || seg === s[i]);
};

exports.handleMock = async (req, res, next) => {
  try {
    const routeName = normalize(req.path);
    const method = req.method.toUpperCase();

    let doc = await Api.findOne({ routeName, method });
    if (!doc) {
      const candidates = await Api.find({ method, routeName: /:/ });
      doc = candidates.find((c) => matchPattern(c.routeName, routeName));
    }

    if (!doc) {
      return res.status(404).json({ error: 'Mock endpoint not found', route: routeName, method });
    }

    Api.updateOne({ _id: doc._id }, { $inc: { hits: 1 } }).catch(() => {});
    if (doc.delayMs) await new Promise((r) => setTimeout(r, doc.delayMs));
    res.status(doc.statusCode || 200).json(doc.responseJson);
  } catch (err) {
    next(err);
  }
};
