const getBrowser = require('news-crawler/src/get-browser')
const sourceConfig = require('./../../config/news-source-config.json')
const trendingTopicDbService = require('../../db-service/trendingTopicDbService')
module.exports = async function(){
    try{
        const browser = await getBrowser({ headless: true })
        const browserPage = await browser.newPage()
        try{
            await browserPage.setDefaultNavigationTimeout(10000)

            const source = sourceConfig[3]
            await browserPage.goto(source.mainUrl,{
                waitUntil: 'load',
                timeout: 0
            })

            const trendingTopics = await browserPage.$$eval(source.trendingSelector,(elements) => elements.map((element) => element.innerHTML))

            browserPage.close()
        
            await trendingTopicDbService.saveTrendingTopics(trendingTopics)
        }catch{
            browserPage.close()
        }
    }catch(error){
        console.log(error)
    }
}