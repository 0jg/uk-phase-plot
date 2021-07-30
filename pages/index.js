import Head from "next/head";
import {ma} from "moving-averages"
import DWChart from 'react-datawrapper-chart'
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
	Crosshair,
	VerticalBarSeries,
  VerticalBarSeriesCanvas
} from "react-vis";

function weeklyAverageAdmissions(dataset) {
	let dataset_weekly = []

	dataset.forEach((item, i) => {
		dataset_weekly.push( item.x )
	});

	return weeklyAverage(dataset_weekly)
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
	let data = [];
	let dataPredictedHospitalTimeSeries = [];
	let dataFirstWave = [];
	let dataSecondWave = [];
	let dataDeltaWave = [];

	props.valuesAdmissions.forEach((item, i) => {
		data.push({x: props.valuesAdmissions[i], y: props.valuesBedsOccupied[i]})
	});

	console.log(dataPredictedHospitalTimeSeries)

	let averageAdmissions = weeklyAverageAdmissions(data).reverse()
	let averageBedsOccupied = weeklyAverageBedsOccupied(data).reverse()

	data = []
	averageAdmissions.forEach((item, i) => {
		if(i < 158) {// days between 27 March and 1 September
			dataFirstWave.push({x: averageAdmissions[i], y: averageBedsOccupied[i]})
		} else if (i >= 158 && i < 432) { // days between 1 September and 2 June
			dataSecondWave.push({x: averageAdmissions[i], y: averageBedsOccupied[i]})
		} else { // to now
			dataDeltaWave.push({x: averageAdmissions[i], y: averageBedsOccupied[i]})
		}
	});


	let latestAdmissions = props.valuesAdmissions.find(el => el !== null)
	let latestBedOccupancy = props.valuesBedsOccupied[0]

	let latestData = [{ x: latestAdmissions, y: latestBedOccupancy }]

	return (
		<>

		<main className="flex flex-col items-center justify-center w-screen m-auto min-h-screen text-center">
			<div className="w-screen md:max-w-screen-lg">
				<h1 className="text-6xl md:text-7xl font-bold leading-tighter pt-24 px-2 pb-12">
					🏴󠁧󠁢󠁥󠁮󠁧󠁿<br />Hospital Phase Plot
				</h1>

				<a href="https://uk-vaccine.vercel.app" class="transition-colors bg-white hover:bg-blue-100 text-gray-800 font-semibold py-2 px-4 border border-blue-500 rounded shadow">
					View U.K. Vaccine Progress ›
				</a>

				<p className="text-3xl md:text-4xl py-4 px-2 mb-2 text-left md:max-w-screen-md m-auto leading-tight mt-12">
					Comparing the weekly averages of beds full vs. daily admissions during <span style={{color: "rgb(248, 3, 83)"}}>the first wave</span>, {" "}
					<span style={{color: "rgb(161, 93, 215)"}}>the second wave</span> and <span style={{color: "rgb(255, 149, 0)"}}> since Delta variant dominance</span>. The <span style={{color:"rgb(41, 188, 155)"}}>latest data</span> <span style={{color: "rgb(79, 227, 194)"}}>●</span> are shown.
				</p>

				<p className="px-2 mb-8 text-xl md:text-2xl text-gray-700 text-left md:max-w-screen-md m-auto">To learn how to interpret this graph, see <a href="https://twitter.com/BristOliver/status/1398951925631045633">@BristOliver</a>'s discussion.</p>

				<div className="m-auto chart">

				<h3 className="text-md md:text-xl text-gray-400 pt-2">(log–log)</h3>

					<FlexibleXYPlot
						yType="log"
						xType="log"
						yDomain={[400,  40000]}
						xDomain={[40, 5000]}
						margin={{left: 60, bottom: 100}}
						className="m-auto max-h-screen-md text-black fill-current text-md"
					>
						<HorizontalGridLines className=" text-gray-300 border w-4 stroke-1 stroke-current" />
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
							data={dataDeltaWave}
							color="rgb(255, 149, 0)"
				      opacityType="category"
							stroke="rgb(255, 149, 0)"
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
							style={{'backgroundColor': 'rgb(0,0,0)'}}
							data={[
								{
									x: 2500,
									y: 2200,
									label: "Mar 23 2020"
								},
								{
									x: 5000,
									y: 45000,
									label: "Jan 9 2021"
								},
								{
									x: 50,
									y: 450,
									label: "Sep 1 2020"
								},
							]}
							className="text-black fill-current"
						/>

					</FlexibleXYPlot>


				</div>

				<footer className="text-sm text-gray-500 pb-10">
					Made by <a href="https://twitter.com/__jackg">@__jackg</a>. Phase plot chart inspired by <a href="https://twitter.com/BristOliver">@BristOliver</a>. Code
					available at{" "}
					<a href="https://github.com/j-griffiths/uk-phase-plot">GitHub</a>. Data
					from{" "}
					<a href="https://coronavirus.data.gov.uk/details/download">GOV.UK</a>.

					<p className="px-2 mb-8 text-xs text-gray-700 pt-2 ">Delta was declared as the U.K.'s dominant strain on June 3 (BMJ 2021;373:n1445).</p>
				</footer>
			</div>
		</main>

		<style jsx>{`
      .chart{
				width: 100vw;
				height: 100vw;
				max-width: 600px;
				max-height: 600px;
			}

			@media(max-width: 900px){
				.chart{
					height: 100vh;
				}
			}
    `}</style>
		</>

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
