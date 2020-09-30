const mongoose = require('mongoose')
const Schema = mongoose.Schema
const expiryTime = 604800

const Article = mongoose.model(
	'Article',
	new Schema({
		id: String,
		title: { type: String, required: true, unique: true },
		link: { type: String, unique: true, required: true },
		imageLink: { type: String, required: true },
		isHeadline: Boolean,
		shortDescription: String,
		category: String,
		content: String,
		sourceName: String,
		hostIp: String,
		publishedDate: { type: Date, default: Date.now },
		createdDate: { type: Date, default: Date.now },
		modifiedDate: { type: Date, default: Date.now },
		topic: { type: String },
		createdAt: { type: Date, expires: expiryTime, default: Date.now },
		nouns: [String],
		tags: [String]
	}),
)

const Tweet = mongoose.model(
	'Tweet',
	new Schema({
		tweetId: { type: String, required: true, unique: true },
		handle: { type: String },
		text: String,
		createdAt: { type: Date, expires: expiryTime, default: Date.now },
		publishedDate: { type: Date },
		name: String,
		profileImage: String,
		description: String,
	}),
)

const User = mongoose.model(
	'User',
	new Schema({
		nid: { type: String, unique: true },
		fcmToken: { type: String, unique: true },
		countryCode: String,
		timeZone: String,
		ipAddress: String,
		createdDate: { type: Date, default: Date.now },
		modifiedDate: { type: Date, default: Date.now },
	}),
)

const Notification = mongoose.model(
	'Notification',
	new Schema({
		article: { type: mongoose.Schema.Types.ObjectId, ref: 'Article', required: true },
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		createdAt: { type: Date, default: Date.now() },
		updatedAt: { type: Date, default: Date.now() },
	}).index({ article: 1, user: 1 }, { unique: true }),
)

const Topic = mongoose.model(
	'Topic',
	new Schema({
		id: String,
		topicText: String,
		topicPath: String,
	}),
)

const CoronaStats = mongoose.model(
	'CoronaStats',
	new Schema({
		createdDate: { type: Date, default: Date.now },
		createdAt: { type: Date, default: Date.now, expires: expiryTime },
		stats: [
			{
				country: String,
				total_cases: Number,
				total_deaths: Number,
				new_cases: Number,
				new_deaths: Number,
			},
		],
		worldSummary: {
			totalCases: Number,
			newCases: Number,
			totalDeaths: Number,
			newDeaths: Number,
		},
		source: String
	}),
)

const DistrictCoronaStats = mongoose.model(
	'DistrictCoronaStats',
	new Schema({
		createdDate: { type: Date, default: Date.now },
		createdAt: { type: Date, default: Date.now, expires: expiryTime },
		timeLine: {
			date: String,
			totalCases: Number,
			newCases: Number,
			totalRecoveries: Number,
			newRecoveries: Number,
			totalDeaths: Number,
			newDeaths: Number,
		},
		districts: [
			{
				name: String,
				nepaliName: String,
				totalCases: Number,
				activeCases: Number,
				recovered: Number,
				deaths: Number,
			},
		],
		source: String
	}),
)

const TrendingTweetCount = mongoose.model(
	'TrendingTweetCount',
	new Schema({
		createdDate: { type: Date, default: Date.now()},
		createdAt: { type: Date, default: Date.now(), expires: expiryTime },
		trendings: [
			{
				category: String,
				counts: [
					{
						name: String,
						handle: String,
						count: Number,
						image: String,
					},
				],
			},
		],
	}),
)

const FacebookPosts = mongoose.model(
	'FacebookPosts',
	new Schema({
		createdAt: { type: Date, default: Date.now(), expires: 86400 },
		articleLink: { type: String, required: true, unique: true },
	}),
)

const TrendingTopic = mongoose.model(
	'TrendingTopic',
	new Schema({
		topics: [{ type: String, unique: true }],
	}),
)

module.exports = {
	User,
	Tweet,
	Article,
	Notification,
	Topic,
	CoronaStats,
	DistrictCoronaStats,
	TrendingTweetCount,
	FacebookPosts,
	TrendingTopic,
}
