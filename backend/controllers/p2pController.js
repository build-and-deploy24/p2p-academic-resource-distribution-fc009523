const File = require("../models/File");
const PeerRecord = require("../models/PeerRecord");
const User = require("../models/User");
const DownloadSession = require("../models/DownloadSession");

const MIN_PEERS = 3;                    // below this, recommend fallback (open decision #6)
const PEER_TIMEOUT_MS = 5 * 60 * 1000;  // peers silent for 5 minutes are ignored (open decision #7)

function sendError(res, status, code, message) {
  return res.status(status).json({ success: false, error: { code, message } });
}

function activeSince() {
  return new Date(Date.now() - PEER_TIMEOUT_MS);
}

// GET /api/files/:fileId/peers
async function getPeers(req, res, next) {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return sendError(res, 404, "RESOURCE_NOT_FOUND", "File not found.");

    const peerCount = await PeerRecord.countDocuments({
      file: file._id,
      lastActive: { $gt: activeSince() }
    });

    res.json({
      success: true,
      data: {
        fileId: file._id,
        peerCount,
        recommendedMode: peerCount >= MIN_PEERS ? "p2p" : "fallback"
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/files/:fileId/magnet
async function getMagnet(req, res, next) {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return sendError(res, 404, "RESOURCE_NOT_FOUND", "File not found.");
    if (!file.magnetLink) {
      return sendError(res, 404, "RESOURCE_NOT_FOUND", "This file has not been seeded yet.");
    }
    res.json({ success: true, data: { fileId: file._id, magnetLink: file.magnetLink } });
  } catch (error) {
    next(error);
  }
}

// POST /api/files/:fileId/peers   body: { userId }
async function registerPeer(req, res, next) {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return sendError(res, 404, "RESOURCE_NOT_FOUND", "File not found.");

    const { userId } = req.body;
    if (!userId) return sendError(res, 400, "INVALID_INPUT", "userId is required.");

    const user = await User.findById(userId);
    if (user && user.seedingEnabled === false) {
      return sendError(res, 403, "SEEDING_DISABLED", "This user has turned seeding off.");
    }

    await PeerRecord.findOneAndUpdate(
      { file: file._id, userId },
      { lastActive: new Date() },
      { upsert: true }
    );

    res.status(201).json({
      success: true,
      data: { fileId: file._id, userId, seedingSince: new Date().toISOString() }
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/files/:fileId/peers/:userId
async function removePeer(req, res, next) {
  try {
    await PeerRecord.deleteOne({ file: req.params.fileId, userId: req.params.userId });
    res.json({ success: true, data: { fileId: req.params.fileId, userId: req.params.userId } });
  } catch (error) {
    next(error);
  }
}

// PATCH /api/users/:userId/seeding   body: { seedingEnabled }
async function updateSeeding(req, res, next) {
  try {
    const { seedingEnabled } = req.body;
    if (typeof seedingEnabled !== "boolean") {
      return sendError(res, 400, "INVALID_INPUT", "seedingEnabled must be true or false.");
    }

    await User.findOneAndUpdate(
      { _id: req.params.userId },
      { seedingEnabled },
      { upsert: true }
    );

    // Opting out removes the student from every swarm straight away
    if (!seedingEnabled) {
      await PeerRecord.deleteMany({ userId: req.params.userId });
    }

    res.json({ success: true, data: { userId: req.params.userId, seedingEnabled } });
  } catch (error) {
    next(error);
  }
}

// POST /api/sessions   body: { userId, fileId, mode, peerCount, durationMs }
async function logSession(req, res, next) {
  try {
    const { userId, fileId, mode, peerCount, durationMs } = req.body;

    if (!fileId) return sendError(res, 400, "INVALID_INPUT", "fileId is required.");
    if (mode !== "p2p" && mode !== "fallback") {
      return sendError(res, 400, "INVALID_INPUT", 'mode must be "p2p" or "fallback".');
    }
    if (!(await File.exists({ _id: fileId }))) {
      return sendError(res, 404, "RESOURCE_NOT_FOUND", "File not found.");
    }

    const session = await DownloadSession.create({
      userId: userId || null,
      file: fileId,
      mode,
      peerCount: peerCount || 0,
      durationMs: durationMs || 0
    });

    res.status(201).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/stats
async function getStats(req, res, next) {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

    const activeDownloads = await DownloadSession.countDocuments({ createdAt: { $gt: oneMinuteAgo } });
    const total = await DownloadSession.countDocuments();
    const fallbacks = await DownloadSession.countDocuments({ mode: "fallback" });

    const perFile = await PeerRecord.aggregate([
      { $match: { lastActive: { $gt: activeSince() } } },
      { $group: { _id: "$file", count: { $sum: 1 } } }
    ]);
    const totalPeers = perFile.reduce((sum, f) => sum + f.count, 0);

    res.json({
      success: true,
      data: {
        activeDownloads,
        averagePeerCount: perFile.length ? Number((totalPeers / perFile.length).toFixed(1)) : 0,
        fallbackRate: total ? Number((fallbacks / total).toFixed(2)) : 0
      }
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/admin/files/health   (feeds the admin dashboard table)
async function getFileHealth(req, res, next) {
  try {
    const sessions = await DownloadSession.aggregate([
      {
        $group: {
          _id: "$file",
          p2pDownloads: { $sum: { $cond: [{ $eq: ["$mode", "p2p"] }, 1, 0] } },
          fallbackDownloads: { $sum: { $cond: [{ $eq: ["$mode", "fallback"] }, 1, 0] } }
        }
      }
    ]);
    const peers = await PeerRecord.aggregate([
      { $match: { lastActive: { $gt: activeSince() } } },
      { $group: { _id: "$file", peerCount: { $sum: 1 } } }
    ]);

    const byFile = {};
    sessions.forEach((s) => {
      byFile[s._id] = { p2pDownloads: s.p2pDownloads, fallbackDownloads: s.fallbackDownloads, peerCount: 0 };
    });
    peers.forEach((p) => {
      if (!byFile[p._id]) byFile[p._id] = { p2pDownloads: 0, fallbackDownloads: 0, peerCount: 0 };
      byFile[p._id].peerCount = p.peerCount;
    });

    const ids = Object.keys(byFile);
    const files = await File.find({ _id: { $in: ids } }).select("title");
    const titles = {};
    files.forEach((f) => { titles[f._id] = f.title; });

    const rows = ids
      .map((id) => ({ id, title: titles[id] || id, ...byFile[id] }))
      .sort((a, b) => a.peerCount - b.peerCount)
      .slice(0, 20);

    res.json({ success: true, data: rows });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPeers, getMagnet, registerPeer, removePeer,
  updateSeeding, logSession, getStats, getFileHealth
};