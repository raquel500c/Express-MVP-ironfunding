const express = require('express');
const { ensureLoggedIn } = require('connect-ensure-login');
const { authorizeCampaign, checkOwnership } = require('../middlewares/campaign-authorization');
const Campaign = require('../models/campaign');
const TYPES_OBJ = require('../models/campaign-types');
const resolve = require('../utils/resolve');
const PATHS = require('./paths');

const router = express.Router();
const TYPES = Object.values(TYPES_OBJ)

router.get(PATHS.NEW_CAMPAIGN_PATH, ensureLoggedIn('/login'), (req, res) => {
  res.render('campaigns/new', { types: TYPES });
});

router.post(PATHS.CAMPAIGNS_PATH, ensureLoggedIn('/login'), (req, res, next) => {
  const newCampaign = new Campaign({
    title: req.body.title,
    goal: req.body.goal,
    description: req.body.description,
    category: req.body.category,
    deadline: req.body.deadline,
    // We're assuming a user is logged in here
    // If they aren't, this will throw an error
    _creator: req.user._id
  });

  newCampaign.save((err) => {
    if (err) {
      res.render('campaigns/new', { campaign: newCampaign, types: TYPES });
    } else {
      res.redirect(resolve(PATHS.CAMPAIGN_PATH, { id: newCampaign._id.toString() }));
    }
  });
});

router.get(PATHS.CAMPAIGN_PATH, ensureLoggedIn('/login'), checkOwnership, (req, res, next) => {
  Campaign.findById(req.params.id, (err, campaign) => {
    if (err) { return next(err); }
    campaign.populate('_creator', (err, campaign) => {
      if (err) { return next(err); }
      return res.render('campaigns/show', { campaign });
    });
  });
});

router.get(PATHS.EDIT_CAMPAIGN_PATH, ensureLoggedIn('/login'), authorizeCampaign, (req, res, next) => {
  Campaign.findById(req.params.id, (err, campaign) => {
    if (err) { return next(err) }
    if (!campaign) { return next(new Error("404")) }
    return res.render('campaigns/edit', { campaign, types: TYPES })
  });
});

router.post(PATHS.CAMPAIGN_PATH, ensureLoggedIn('/login'), authorizeCampaign, (req, res, next) => {
  const updates = {
    title: req.body.title,
    goal: req.body.goal,
    description: req.body.description,
    category: req.body.category,
    deadline: req.body.deadline
  };

  Campaign.findByIdAndUpdate(req.params.id, updates, (err, campaign) => {
    if (err) {
      return res.render('campaigns/edit', {
        campaign,
        errors: campaign.errors
      });
    } else if (!campaign) {
      return next(new Error('404'));
    }

    return res.redirect(resolve(PATHS.CAMPAIGN_PATH, { id: campaign._id.toString() }));
  });
});

module.exports = router;
