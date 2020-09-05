require('dotenv').config()
const { newsDbService } = require('../../db-service')
const getBrowser = require('news-crawler/src/get-browser')
const Bugsnag = require('@bugsnag/js')
const BugsnagPluginExpress = require('@bugsnag/plugin-express')

Bugsnag.start({
	apiKey: 'bf6ecbb87c478df6c456d6d297a82f4f',
	plugins: [BugsnagPluginExpress],
})

module.exports = async function(context){

    try {
        context.log("Posting to fb...")
        const latestArticle = await newsDbService.getLatestNewsArticle()
        let articleLink = latestArticle[0].link
        
        const browser = await getBrowser()
	    const browserPage = await browser.newPage()
        await browserPage.setDefaultNavigationTimeout(100000)
        await browserPage.goto(process.env.FACEBOOK_PAGE_LINK)
        await browserPage.waitForSelector('#email')
        await browserPage.type("#email", process.env.FACEBOOK_EMAIL_ID)
        await browserPage.type('#pass', process.env.FACEBOOK_PASSWORD)
        await browserPage.click(`[type="submit"]`)
        await browserPage.waitForNavigation()
        await browserPage.waitFor(10000)
        await browserPage.waitForSelector(`[aria-label="Write a post..."]`)
        await browserPage.click(`[aria-label="Write a post..."]`)
        // await browserPage.waitForSelector('div.g9en0fbe > div > img')
        for(let i = 0; i < articleLink.length; i++){
            await browserPage.keyboard.press(articleLink[i])
            if(i === articleLink.length-1){
                await browserPage.waitFor(2000)
                await browserPage.keyboard.down('Control')
                await browserPage.keyboard.press('KeyA')
                await browserPage.waitFor(2000)
                await browserPage.keyboard.press('KeyX')
                await browserPage.waitFor(2000)
                await browserPage.keyboard.press('KeyV')
                await browserPage.keyboard.up('Control')
                await browserPage.waitFor(4000)
                // await browserPage.keyboard.down('Control')
                // await browserPage.keyboard.press(String.fromCharCode(13))
                // await browserPage.keyboard.up('Control')
                await browserPage.waitForSelector('div._1j2v > div._2dck._4-u3._57d8 > div.clearfix > div._ohf.rfloat > div > button')
                await browserPage.click('div._1j2v > div._2dck._4-u3._57d8 > div.clearfix > div._ohf.rfloat > div > button')
                await browserPage.waitFor(15000)
                context.log("Posted to FB")
            }
        }
        browserPage.close()
    } catch (error) {
        Bugsnag.notify("Error here fb post ", error)
        context.log("error here fb post ",error)
    }
}
