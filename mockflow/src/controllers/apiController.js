const Api = require('../models/Api');

const normalize = (r) => String(r || '').trim().replace(/^\/+|\/+$/g, '');

exports.normalize = normalize;

exports.createApi = async (req, res, next) => {
  try {
    const routeName = normalize(req.body.routeName);
    const method = String(req.body.method || '').toUpperCase();
    let { responseJson, statusCode, delayMs } = req.body;

    if (!routeName) return res.status(400).json({ error: 'routeName is required' });

    if (typeof responseJson === 'string') {
      try {
        responseJson = JSON.parse(responseJson);
      } catch {
        return res.status(400).json({ error: 'responseJson is not valid JSON' });
      }
    }
    if (responseJson === undefined) {
      return res.status(400).json({ error: 'responseJson is required' });
    }

    const doc = await Api.findOneAndUpdate(
      { routeName, method },
      {
        $set: {
          routeName,
          method,
          responseJson,
          statusCode: Number(statusCode) || 200,
          delayMs: Number(delayMs) || 0,
        },
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(doc);
  } catch (err) {
    err.status = 400;
    next(err);
  }
};

exports.listApis = async (_req, res, next) => {
  try {
    res.json(await Api.find().sort({ createdAt: -1 }));
  } catch (err) {
    next(err);
  }
};

exports.deleteApi = async (req, res, next) => {
  try {
    await Api.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    err.status = 400;
    next(err);
  }
};
