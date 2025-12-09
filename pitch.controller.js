// controllers/pitch.controller.js
// ==============================================================

const pitchService = require("../services/pitch.service");
const { asyncWrapper } = require("../utils/asyncWrapper");

exports.list = asyncWrapper(async (req, res) => {
  const data = await pitchService.listPitches(req.query);

  return res.status(200).json({
    status: "success",
    total: data.length,
    data,
  });
});

exports.details = asyncWrapper(async (req, res) => {
  const pitchId = req.params.id;
  const data = await pitchService.getPitch(pitchId);

  return res.status(200).json({
    status: "success",
    data,
  });
});

exports.create = asyncWrapper(async (req, res) => {
  const ownerId = req.user.id;
  const data = await pitchService.createPitch(ownerId, req.body);

  return res.status(201).json({
    status: "success",
    data,
  });
});

exports.update = asyncWrapper(async (req, res) => {
  const ownerId = req.user.id;
  const pitchId = req.params.id;
  const data = await pitchService.updatePitch(pitchId, ownerId, req.body);

  return res.status(200).json({
    status: "success",
    data,
  });
});

exports.remove = asyncWrapper(async (req, res) => {
  const ownerId = req.user.id;
  const pitchId = req.params.id;
  const data = await pitchService.deletePitch(pitchId, ownerId);

  return res.status(200).json({
    status: "success",
    message: "Pitch deleted successfully",
    data,
  });
});
