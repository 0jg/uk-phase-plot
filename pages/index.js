import Head from "next/head";
import {ma} from "moving-averages"
import moment from "moment";
import dateArray from "moment-array-dates";
import {
	MarkSeries,
	LabelSeries,
	ChartLabel,
	FlexibleXYPlot,
	AreaSeries,
	HorizontalGridLines,
	LineSeries,
	XAxis,
	YAxis,
	Crosshair
} from "react-vis";

function weeklyAverageAdmissions(dataset) {
	let dataset_weekly = []

	dataset.forEach((item, i) => {
		dataset_weekly.push( item.x )
	});

	let latestAdmissionsIndex = dataset_weekly.findIndex(el => el !== null)

	return [weeklyAverage(dataset_weekly), latestAdmissionsIndex]
}

function weeklyAverageBedsOccupied(dataset) {
	let dataset_weekly = []

	dataset.forEach((item, i) => {
		dataset_weekly.push( item.y )
	});

	return weeklyAverage(dataset_weekly)
}

function weeklyAverage(dataset) {
	let average = []
	let dataset_slice = []
	let index = 0

	console.log(ma(dataset, 7))

	// for (index = 0; index < dataset.length; index+=7) {
	// 	dataset_slice = dataset.slice(index, index + 7);
	// 	average.push( dataset_slice.reduce((a, b) => a + b) / dataset_slice.length )
	// }

	average = ma(dataset, 7)

	return average
}

export default function Home(props) {
	if (props.error) {
		return (
			<div className="w-screen h-screen flex flex-col justify-center items-center">
				<h1 className="text-5xl pb-4">Daily data updating...</h1>
				<h2 className="text-3xl">Try again in 15 minutes.</h2>
			</div>
		);
	}

	// Initialise arrays
	let dataFirstWave = [];
	let dataSecondWave = [];

	// Add data points to array
	props.valuesAdmissions.forEach((item, i) => {
		if(new Date(props.valuesDates[i]) < new Date("2020-09-01")) {
			dataFirstWave.push({x: props.valuesAdmissions[i], y: props.valuesBedsOccupied[i]});
		} else {
			dataSecondWave.push({x: props.valuesAdmissions[i], y: props.valuesBedsOccupied[i]});
		}
	});

	let firstWaveWeeklyAverageAdmissions = weeklyAverageAdmissions(dataFirstWave)[0];
	let firstWaveWeeklyAverageBedsOccupied = weeklyAverageBedsOccupied(dataFirstWave);
	let secondWaveWeeklyAverageAdmissions = weeklyAverageAdmissions(dataSecondWave)[0];
	let secondWaveWeeklyAverageBedsOccupied = weeklyAverageBedsOccupied(dataSecondWave);

	let indexOfLatestFullDataset = weeklyAverageAdmissions(dataSecondWave)[1]
	let latestAdmissions = dataSecondWave[indexOfLatestFullDataset].x
	let latestBedOccupancy = dataSecondWave[0].y

	let latestData = [{ x: latestAdmissions, y: latestBedOccupancy }]

	dataFirstWave = []
	dataSecondWave = []

	firstWaveWeeklyAverageAdmissions.forEach((item, i) => {
		dataFirstWave.push( { x: firstWaveWeeklyAverageAdmissions[i], y: firstWaveWeeklyAverageBedsOccupied[i] } )
	});

	secondWaveWeeklyAverageAdmissions.forEach((item, i) => {
		dataSecondWave.push( { x: secondWaveWeeklyAverageAdmissions[i], y: secondWaveWeeklyAverageBedsOccupied[i] } )
	});

	return (
		<main className="flex flex-col items-center justify-center w-screen m-auto min-h-screen dark:bg-black dark:text-white text-center">
			<div className="w-screen md:max-w-screen-lg">
				<h1 className="text-5xl md:text-7xl font-bold leading-tighter pt-24 px-2">
					🏴󠁧󠁢󠁥󠁮󠁧󠁿 Hospital Phase Plot
				</h1>
				<h3 className="text-md md:text-xl text-gray-400 pt-2">(log–log)</h3>
				<h2 className="text-3xl md:text-4xl leading-tight py-4 px-2 mb-4">
					Comparing weekly averages of <span style={{color: "rgb(248, 3, 83)"}}>the first wave</span><br /> and {" "}
					<span style={{color: "rgb(161, 93, 215)"}}>the second wave</span>. The <span style={{color:"rgb(41, 188, 155)"}}>latest data</span>  <span style={{color: "rgb(79, 227, 194)"}}>●</span> is shown.
				</h2>

				<a href="https://uk-vaccine.vercel.app" class="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow">
				  View U.K. Vaccine Progress ›
				</a>

				<div className="max-w-screen-md h-screen m-auto pt-20">
					<FlexibleXYPlot
						yType="log"
						xType="log"
						yDomain={[400,  40000]}
						xDomain={[40, 5000]}
						margin={{left: 60, bottom: 100}}
						className="m-auto dark:text-white text-black fill-current text-md"
					>
						<HorizontalGridLines className="dark:text-gray-600 text-gray-300 border w-4 stroke-1 stroke-current" />
						<XAxis
							title="Daily admissions"
							tickLabelAngle={-90}
							tickFormat={v => v}
							className="stroke-1 stroke-current font-extralight text-xs"
						/>
						<YAxis
							title="Beds full"
							tickFormat={v => v}
							className="stroke-1 stroke-current font-extralight text-xs"
						/>
						<MarkSeries
							data={dataFirstWave}
							color="rgb(248, 3, 83)"
				      opacityType="category"
							stroke="rgb(248, 3, 83)"
				      opacity="0.5"
							size="5"
						/>
						<MarkSeries
							data={dataSecondWave}
							color="rgb(161, 93, 215)"
				      opacityType="category"
							stroke="rgb(161, 93, 215)"
				      opacity="0.5"
							size="5"
						/>
						<MarkSeries
							data={latestData}
							color="rgb(79, 227, 194)"
				      opacityType="category"
							stroke="rgb(79, 227, 194)"
				      opacity=""
							size="5"
						/>

						<LabelSeries
							data={[
								{
									x: 1400,
									y: 2200,
									label: "Mar 23 2020"
								},
								{
									x: 5000,
									y: 40000,
									label: "Jan 9 2021"
								},
								{
									x: 50,
									y: 450,
									label: "Sep 1 2021"
								},
							]}
							className="text-green fill-current"
						/>

					</FlexibleXYPlot>
				</div>
				<footer className="text-sm text-gray-500 pb-10">
					Made by <a href="https://twitter.com/__jackg">@__jackg</a>. Inspired by <a href="https://twitter.com/BristOliver">@BristOliver</a>. Code
					available at{" "}
					<a href="https://github.com/j-griffiths/uk-phase-plot">GitHub</a>. Data
					from{" "}
					<a href="https://coronavirus.data.gov.uk/details/download">GOV.UK</a>.
				</footer>
			</div>
		</main>
	);
}

export async function getServerSideProps() {
	let valuesAdmissions = [];
	let valuesBedsOccupied = [];
	let valuesDates = [];
	let error;

	let res = await fetch(
		"https://api.coronavirus.data.gov.uk/v2/data?areaType=nation&areaCode=E92000001&metric=newAdmissions&metric=hospitalCases&format=json"
	)
		.then(response => response.json())
		.then(data => {
			data.body.forEach(e => {
				valuesAdmissions.push(e.newAdmissions);
				valuesBedsOccupied.push(e.hospitalCases);
				valuesDates.push(e.date);
			});
			error = false;
		})
		.catch(err => {
			console.error(err);
			error = true;
		});

	return {
		props: {
			error,
			valuesAdmissions,
			valuesBedsOccupied,
			valuesDates
		}
	};
}
