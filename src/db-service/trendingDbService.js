const { TrendingTweetCount } = require('./database/mongooseSchema')
const { TrendingTwitterHandles } = require('./../config/twitter-handles')
const { trendingCategories } = require('../config/category')

module.exports = {
	getTrendingHandles: async () => {
		return TrendingTwitterHandles
	},
	
	saveTrendingTweetCount: async (counts) => {
		let trendingCounts = counts.sort((a, b) => (a.count < b.count ? 1 : b.count < a.count ? -1 : 0))
		let trendings = []
		trendingCategories.forEach(iCat=>{
			let categoryCounts = trendingCounts.filter(x=>x.category==iCat).slice(0,5)
			trendings.push({
				category: iCat,
				counts: categoryCounts
			})
		})
		let trendingCountObj = new TrendingTweetCount({trendings})
		const savedCount = await trendingCountObj.save()
		return savedCount
	},

	getTrendingTweetCount: async () => {
		const trendingTweetCount = await TrendingTweetCount.findOne({}, {}, { sort: { createdDate: -1 } }).lean()

		if (trendingTweetCount.trendings) {
			const trendingTweetCountWithOldModel = { ...trendingTweetCount, counts: [...trendingTweetCount.trendings[0].counts] }
			return trendingTweetCountWithOldModel
		} else {
			return trendingTweetCount
		}
	},
}
