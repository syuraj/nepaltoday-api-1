require('dotenv').config()

const TWITTER_CONSUMER_KEY = process.env.CONSUMER_KEY
const TWITTER_CONSUMER_SECRET = process.env.CONSUMER_SECRET
const TWITTER_ACCESS_TOKEN = process.env.ACCESS_TOKEN
const TWITTER_ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET

module.exports = {
	TWITTER_CONSUMER_KEY,
	TWITTER_CONSUMER_SECRET,
	TWITTER_ACCESS_TOKEN,
	TWITTER_ACCESS_TOKEN_SECRET,
}
