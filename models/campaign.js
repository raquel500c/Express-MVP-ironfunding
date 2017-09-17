const mongoose = require('mongoose');
const moment = require('moment');
const Schema = mongoose.Schema;
const TYPES = require('./campaign-types');

const CampaignSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: Object.values(TYPES), required: true },
  _creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  goal: { type: Number, required: true },
  backerCount: { type: Number, default: 0 },
  totalPledged: { type: Number, default: 0 },
  deadline: { type: Date, required: true },
  rewards: [{ type: Schema.Types.ObjectId, ref: 'Reward' }]
});

CampaignSchema.virtual('timeRemaining').get(() => {
  const remaining = moment(this.deadline).fromNow(true).split(' ');
  const [days, unit] = remaining;
  return { days, unit };
});

CampaignSchema.virtual('inputFormattedDate').get(function () {
  return moment(this.deadline).format('YYYY-MM-DD');
});

CampaignSchema.methods.belongsTo = function (user) {
  return this._creator.equals(user._id);
}

module.exports = mongoose.model('Campaign', CampaignSchema);
