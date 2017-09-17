// routes/rewards.js
const express = require('express');
const moment = require('moment');
const { ensureLoggedIn } = require('connect-ensure-login');
const Campaign = require('../models/campaign');
const Reward = require('../models/reward');
const { authorizeCampaign } = require('../middlewares/campaign-authorization');
const PATHS = require('./paths');

const router = express.Router();
const ObjectId = require('mongoose').Types.ObjectId;

router.get(PATHS.NEW_REWARD_PATH, authorizeCampaign, (req, res, next) => {
  Campaign.findById(req.params.id, (err, campaign) => {
    res.render('rewards/new', { campaign, reward: {} })
  });
});

router.post(PATHS.REWARDS_PATH, authorizeCampaign, (req, res, next) => {
  Campaign.findById(req.params.id, (err, campaign) => {
    if (err || !campaign) { return next(new Error("404")); }

    const reward = new Reward({
      title: req.body.title,
      description: req.body.description,
      amount: req.body.amount,
      delivery: req.body.delivery,
      _campaign: campaign._id
    });

    reward.save((err) => {
      if (err) {
        return res.render('rewards/new', { campaign, reward, errors: reward.errors });
      }

      campaign.rewards.push(reward._id);
      campaign.save((err) => {
        if (err) {
          return next(err);
        } else {
          return res.redirect(`/campaigns/${campaign._id}`);
        }
      });
    });
  });
});

router.get(PATHS.REWARDS_PATH, (req, res, next) => {
  Campaign
    .findById(req.params.id)
    .populate('rewards')
    .exec((err, campaign) => {
      if (err || !campaign) { return next(new Error("404")); }
      res.render('rewards/index', { campaign });
    });
});

router.post(PATHS.DONATE_PATH, ensureLoggedIn('/login'), (req, res, next) => {
  Reward.findById(req.params.id, (err, reward) => {
    if (reward && !reward.biddedOnBy(req.user)) {
      reward.bidders.push(req.user._id);

      reward.save((err) => {
        if (err) {
          res.json(err);
        } else {
          reward.registerWithCampaign(reward.amount, (err) => {
            if (err) { return res.json(err); }
            return res.json(reward)
          });
        }
      })
    } else {
      res.json("Already bidded on reward");
    }
  });
});

module.exports = router;
