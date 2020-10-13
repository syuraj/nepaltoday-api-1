require('dotenv').config()
const axios = require('axios')
const https = require('https')
const moment = require('moment')
const { DistrictCoronaDbService } = require('../../db-service')
const logger = require('../../config/logger')
const districts = require('./districts.json')

const axiosInstance = axios.create({
	httpsAgent: new https.Agent({
		rejectUnauthorized: false,
	}),
})

module.exports = async function () {
	try {
		const timeOffSetToUpdateStats = '-13:15'
		const today = moment.utc().utcOffset(timeOffSetToUpdateStats).format('YYYY-MM-DD')
		const yesterday = moment.utc().utcOffset(timeOffSetToUpdateStats).add(-1, 'day').format('YYYY-MM-DD')

		const summaryToday = await axiosInstance
			.get(`https://portal.edcd.gov.np/rest/api/fetchCasesByDistrict?filter=casesBetween&sDate=2020-01-01&eDate=${today}&disease=COVID-19`)
			.then(({ data }) => data)

		const totalCases = summaryToday.reduce((a, c) => a + parseInt(c.Value), 0)

		const summaryYesterday = await axiosInstance
			.get(`https://portal.edcd.gov.np/rest/api/fetchCasesByDistrict?filter=casesBetween&sDate=2020-01-01&eDate=${yesterday}&disease=COVID-19`)
			.then(({ data }) => data)

		const totalCasesYesterday = summaryYesterday.reduce((a, c) => a + parseInt(c.Value), 0)

		const deathsSummary = await axiosInstance
			.get(`https://portal.edcd.gov.np/covid19/dataservice/data-dev.php?type=outcome&sDate=2020-01-01&eDate=${today}&disease=COVID-19`)
			.then(({ data }) => data)

		const totalDeaths = deathsSummary.reduce((a, c) => a + parseInt(c['Number of deaths']) * parseInt(c.Value), 0)

		const newDeathSummary = await axiosInstance
			.get(`https://portal.edcd.gov.np/covid19/dataservice/data-dev.php?type=outcomeDay&sDate=2020-01-01&eDate=${today}&disease=COVID-19`)
			.then(({ data }) => data)

		const newDeaths = parseInt(newDeathSummary[0]['Number of deaths'])

		const coronaTimeLine = {
			totalCases,
			newCases: totalCases - totalCasesYesterday,
			totalDeaths,
			newDeaths,
		}

		const districtMetrics = []

		districts.forEach((district) => {
			const totalCasesSummary = summaryToday.find((s) => s.District.toLowerCase().includes(district.title.toLowerCase()))

			if (totalCasesSummary) {
				const districtTotalCases = parseInt(totalCasesSummary.Value)
				const districtTotalCasesYesterday = summaryYesterday.find((s) => s.District.toLowerCase().includes(district.title.toLowerCase()))

				const districtNewCases = districtTotalCases - parseInt(districtTotalCasesYesterday.Value)

				const districtMetric = {
					name: district.title,
					nepaliName: district.title_ne,
					totalCases: districtTotalCases || 0,
					newCases: districtNewCases || 0,
				}

				districtMetrics.push(districtMetric)
			}
		})

		const stats = {
			createdDate: new Date(),
			timeLine: coronaTimeLine,
			districts: districtMetrics,
			source: 'source: edcd.gov.np',
		}

		await DistrictCoronaDbService.saveDistrictStats(stats)

		logger.info(`Nepal Corona metrics job ran! Metrics: ${JSON.stringify(stats.timeLine)}`, { date: new Date().toISOString() })
	} catch (error) {
		logger.error('Error in national corona stats:', error)
	}
}
