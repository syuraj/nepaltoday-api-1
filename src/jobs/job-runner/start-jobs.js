require('dotenv').config()
const Agenda = require('agenda')
const logger = require('../../config/logger')

const crawler = require('../NewsCrawlerTrigger/index')
const notifier = require('../NotificationTrigger')
const twitterJob = require('../TwitterTrigger')
const coronaJob = require('../corona')
const districtCoronaJob = require('../districtCorona')
const trendingJob = require('../trending')
const facebookPost = require('../facebookPost')
const trendingTopic = require('../trendingTopics')

module.exports = async function () {
	logger.info('starting jobs')

	const agenda = new Agenda({ db: { address: process.env.DATABASE_URL } })

	agenda.define('crawl articles', async (job) => {
		logger.info('crawl articles job started')
		crawler()
	})

	agenda.define('notify users', async (job) => {
		logger.info('notify users job started')
		notifier(console)
	})

	agenda.define('pull tweets', async (job) => {
		logger.info('pull tweets job started')
		twitterJob()
	})

	agenda.define('fetch corona stats', async (job) => {
		logger.info('corona job started')
		coronaJob()
	})

	agenda.define('fetch district corona stats', async (job) => {
		logger.info('fetch district corona job started')
		districtCoronaJob()
	})

	agenda.define('fetch trending', async (job) => {
		logger.info('fetch trending job started')
		trendingJob()
	})

	agenda.define('post to facebook', async (job) => {
		logger.info('posting to facebook started')
		facebookPost(console)
	})

	agenda.define('fetch trending topics', async (job) => {
		logger.info('fetch trending topics started')
		trendingTopic()
	})

	await agenda.start()

	await agenda.every('30 minutes', 'crawl articles')
	await agenda.every('5 minutes', 'notify users')
	await agenda.every('10 minutes', 'pull tweets')
	await agenda.every('2 hours', 'fetch corona stats')
	await agenda.every('1 hours', 'fetch district corona stats')
	await agenda.every('2 hours', 'fetch trending')
	await agenda.every('136 minutes', 'post to facebook')
	await agenda.every('24 hours','fetch trending topics')
}
