require('dotenv').config()
const { newsDbService } = require('../../db-service')
const getBrowser = require('news-crawler/src/get-browser')
const logger = require('../../config/logger')

module.exports = async function () {
	try {
		const latestArticle = await newsDbService.getLatestNewsArticle()
		const articleLink = latestArticle[0].link
		const exists = await newsDbService.checkFacebookPostExist(articleLink)

		if (!exists) {
			logger.info('Posting to fb...')

			const browser = await getBrowser({ headless: true })
			const browserPage = await browser.newPage()
			try {
				await browserPage.setDefaultNavigationTimeout(100000)
				await browserPage.goto(process.env.FACEBOOK_PAGE_LINK)
				await browserPage.waitForSelector('#email')
				await browserPage.type('#email', process.env.FACEBOOK_EMAIL_ID)
				await browserPage.type('#pass', process.env.FACEBOOK_PASSWORD)
				await browserPage.click(`[type="submit"]`)
				await browserPage.waitForNavigation()
				await browserPage.waitFor(15000)
				await browserPage.waitForSelector(`[aria-label="Write a post..."]`)
				await browserPage.click(`[aria-label="Write a post..."]`)
				// await browserPage.waitForSelector('div.g9en0fbe > div > img')
				for (let i = 0; i < articleLink.length; i++) {
					await browserPage.keyboard.press(articleLink[i])
					if (i === articleLink.length - 1) {
						await browserPage.waitFor(2000)
						await browserPage.keyboard.down('Control')
						await browserPage.keyboard.press('KeyA')
						await browserPage.waitFor(2000)
						await browserPage.keyboard.press('KeyX')
						await browserPage.waitFor(2000)
						await browserPage.keyboard.press('KeyV')
						await browserPage.waitFor(4000)
						await browserPage.keyboard.press('KeyA')
						await browserPage.waitFor(2000)
						await browserPage.keyboard.press('KeyX')
						await browserPage.waitFor(2000)
						await browserPage.keyboard.up('Control')

						const facebookTag = process.env.FACEBOOK_TAG
						for (let j = 0; j < facebookTag.length; j++) {
							await browserPage.keyboard.press(facebookTag[j])
							if (j === facebookTag.length - 1) {
								await browserPage.waitFor(2000)
								await browserPage.keyboard.down('Control')
								await browserPage.keyboard.press(String.fromCharCode(13))
								await browserPage.keyboard.up('Control')
								await browserPage.waitFor(15000)
								logger.info('Posted to FB')
							}
						}
					}
				}
				browserPage.close()
			} catch {
				browserPage.close()
			}
			await newsDbService.saveFacebookPost(articleLink)
		} else {
			logger.info('No latest news to post to facebook')
		}
	} catch (error) {
		logger.error('Error here fb post', error)
	}
}
