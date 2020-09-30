require('dotenv').config()
const axios = require('axios')
const { DistrictCoronaDbService } = require('../../db-service')
const https = require('https')
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
const httpsAgent = new https.Agent({
	rejectUnauthorized: false,
})

const getTodayDate = () => {
	const dateObj = new Date()
	let dd = dateObj.getDate() 
    let mm = dateObj.getMonth() + 1 

    const yyyy = dateObj.getFullYear() 
    if (dd < 10) { 
        dd = '0' + dd 
    } 
    if (mm < 10) { 
        mm = '0' + mm
    } 
    return(yyyy + '-' + mm + '-' + dd)
}

const getYesterdayDate = () => {
	const dateObj = new Date()
	let dd = dateObj.getDate() - 1 
    let mm = dateObj.getMonth() + 1 

    const yyyy = dateObj.getFullYear() 
    if (dd < 10) { 
        dd = '0' + dd 
    } 
    if (mm < 10) { 
        mm = '0' + mm
    } 
    return(yyyy + '-' + mm + '-' + dd)
}

module.exports = async function () {
	try{
		const today = getTodayDate()
		const yesterday = getYesterdayDate()

		let todayOutcomes = await axios.get(`http://portal.edcd.gov.np/rest/api/fetch?filter=outcomeOfDay&type=dayByDay&eDate=${today}&disease=COVID-19`)
		if(todayOutcomes.data.length==0){
			todayOutcomes = await axios.get(`http://portal.edcd.gov.np/rest/api/fetch?filter=outcomeOfDay&type=dayByDay&eDate=${yesterday}&disease=COVID-19`)
		}

		const totalNewDeaths = todayOutcomes.data[0]["Number of deaths"]
		const totalNewRecovered = todayOutcomes.data[0]["Number of cases recovered"]

		let todayCasesbyDistricts = await axios.get(`http://portal.edcd.gov.np/rest/api/fetch?filter=casesOfDay&type=dayByDay&eDate=${today}&disease=COVID-19`)

		if(todayCasesbyDistricts.data.length==0){
			todayCasesbyDistricts = await axios.get(`http://portal.edcd.gov.np/rest/api/fetch?filter=casesOfDay&type=dayByDay&eDate=${yesterday}&disease=COVID-19`)
		}

		let totalNewCases = 0
		todayCasesbyDistricts.data && todayCasesbyDistricts.data.forEach((district)=>{
			totalNewCases+=parseInt(district["Value"])
		})
		
		let allOutcomes = await axios.get(`http://portal.edcd.gov.np/rest/api/fetch?filter=outcomeBetween&type=dayByDay&eDate=${today}&disease=COVID-19`)
		if(allOutcomes.data.length==0){
			allOutcomes = await axios.get(`http://portal.edcd.gov.np/rest/api/fetch?filter=outcomeBetween&type=dayByDay&eDate=${yesterday}&disease=COVID-19`)
		}

		let totalDeaths = 0
		let totalRecovered = 0
		allOutcomes.data && allOutcomes.data.forEach(district=>{
			totalDeaths+=parseInt(district["Number of deaths"])
			totalRecovered+=parseInt(district["Number of cases recovered"])
		})

		let allCases = await axios.get(`https://portal.edcd.gov.np/rest/api/fetch?filter=casesBetween&type=dayByDay&eDate=${today}&disease=COVID-19`,{httpsAgent})
		if(allCases.data.length==0){
			allCases = await axios.get(`https://portal.edcd.gov.np/rest/api/fetch?filter=casesBetween&type=dayByDay&eDate=${yesterday}&disease=COVID-19`,{httpsAgent})
		}

		let totalCases = 0
		allCases.data.forEach(district=>{
			totalCases+=parseInt(district["Value"])
		})

		let coronaTimeLine = {
			totalCases,
			newCases: totalNewCases,
			totalRecoveries: totalRecovered,
			newRecoveries: totalNewRecovered,
			totalDeaths,
			newDeaths: totalNewDeaths
		}

		const districts = await axios.get('https://data.nepalcorona.info/api/v1/districts')

		const districtCoronaStats = await axios.get('https://data.nepalcorona.info/api/v1/covid/summary')

		const districtMetrics = []

		districts.data.forEach((district) => {
			const totalCases = districtCoronaStats.data.district.cases.filter((x) => x.district === district.id)[0]
			const activeCases = districtCoronaStats.data.district.active.filter((x) => x.district === district.id)[0]
			const recovered = districtCoronaStats.data.district.recovered.filter((x) => x.district === district.id)[0]
			const deaths = districtCoronaStats.data.district.deaths.filter((x) => x.district === district.id)[0]
			const districtMetric = {
				name: district.title,
				nepaliName: district.title_ne,
				totalCases: (totalCases && totalCases.count && totalCases.count) || 0,
				activeCases: (activeCases && activeCases.count && activeCases.count) || 0,
				recovered: (recovered && recovered.count && recovered.count) || 0,
				deaths: (deaths && deaths.count && deaths.count) || 0,
			}

			districtMetrics.push(districtMetric)
		})

		const stats = {
			createdDate: new Date(),
			timeLine: coronaTimeLine,
			districts: districtMetrics,
			source: 'nepalcorona.info',
		}

		await DistrictCoronaDbService.saveDistrictStats(stats)

		return stats

	}catch(error){
		console.log("error in national corona stats ",error)
	}

}
