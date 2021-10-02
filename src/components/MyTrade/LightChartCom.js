import React from 'react';
import Grid from '@material-ui/core/Grid';


export default function LightChartCom(props) {
	const [open, setOpen] = React.useState(false);
	// var fileref=document.createElement('script')
	// fileref.setAttribute("type","text/javascript")
	// fileref.setAttribute("src", 'https://unpkg.com/lightweight-charts@3.4.0/dist/lightweight-charts.standalone.production.js')
	// document.getElementsByTagName("head")[0].appendChild(fileref)

	setTimeout(() => {

		var chart = window.LightweightCharts.createChart(document.getElementById('chart'), {
			width: 600,
			height: 300,
			rightPriceScale: {
				scaleMargins: {
					top: 0.3,
					bottom: 0.25,
				},
				borderVisible: false,
			},
			layout: {
				backgroundColor: 'white',   // '#131722',
				textColor: '#d1d4dc',
			},
			grid: {
				vertLines: {
					color: 'rgba(42, 46, 57, 0)',
				},
				horzLines: {
					color: 'rgba(42, 46, 57, 0.6)',
				},
			},
		});

		// var areaSeries = chart.addAreaSeries({
		// 	topColor: 'rgba(38,198,218, 0.56)',
		// 	bottomColor: 'rgba(38,198,218, 0.04)',
		// 	lineColor: 'rgba(38,198,218, 1)',
		// 	lineWidth: 2,
		// });
		// areaSeries.setData(props.ChartData.areaSeries);


		var candleSeries = chart.addCandlestickSeries({
			upColor: 'green',
			downColor: 'red',
			borderDownColor: 'red',
			borderUpColor: 'green',
			wickDownColor: 'red',
			wickUpColor: 'green',
		});

		//candleSeries.setData(data);
		var data = props.chartData && props.chartData.candleSeries;
		candleSeries.setData(data);



		var volumeSeries = chart.addHistogramSeries({
			color: '#26a69a',
			priceFormat: {
				type: 'volume',
			},
			priceScaleId: '',
			scaleMargins: {
				top: 0.8,
				bottom: 0,
			},
		});

		//volumeSeries.setData(props.ChartData && props.ChartData.volumeData);
		volumeSeries.setData(props.chartData && props.chartData.volumeSeries);


		chart.subscribeCrosshairMove((param) => {

			var getit = param.seriesPrices[Symbol.iterator]();

			var string = "";
			var change = "";

			for (var elem of getit) {

				console.log(elem);

				if (typeof elem[1] == 'object') {
					string += " O: <b>" + elem[1].open + "</b>";
					string += " H: <b>" + elem[1].high + "</b>";
					string += " L: <b>" + elem[1].low + "</b>";
					string += " C: <b>" + elem[1].close + "</b>";
					change = (elem[1].close - elem[1].open) * 100 / elem[1].open;
					string += " Chng: <b>" + change.toFixed(2) + '%</b>';
				} else {
					string += "&nbsp;" + elem[1].toFixed(2) + " ";
				}
			}

			if (param.time)
				string += " Time: <b>" + new Date(param.time).toLocaleString() + "</b>";



			const domElement = document.getElementById('showChartTitle');


			var str = "<span style=color:green>" + string + "</span> ";
			if (change < 0)
				str = "<span style=color:red>" + string + "</span> ";

			domElement.innerHTML = str;
		});




		// var datesForMarkers = [data[data.length - 19], data[data.length - 39]];
		// var indexOfMinPrice = 0;
		// for (var i = 1; i < datesForMarkers.length; i++) {
		// 	if (datesForMarkers[i].high < datesForMarkers[indexOfMinPrice].high) {
		// 		indexOfMinPrice = i;
		// 	}
		// }
		// var markers = [];
		// for (var i = 0; i < datesForMarkers.length; i++) {
		// 	if (i !== indexOfMinPrice) {
		// 		markers.push({ time: datesForMarkers[i].time, position: 'aboveBar', color: '#e91e63', shape: 'arrowDown', text: 'Sell @ ' + Math.floor(datesForMarkers[i].high + 2) });
		// 	} else {
		// 		markers.push({ time: datesForMarkers[i].time, position: 'belowBar', color: '#2196F3', shape: 'arrowUp', text: 'Buy @ ' + Math.floor(datesForMarkers[i].low - 2) });
		// 	}
		// }
		// markers.push({ time: data[data.length - 48].time, position: 'aboveBar', color: '#f68410', shape: 'circle', text: 'D' });
		// candleSeries.setMarkers(markers);


		var smaData = calculateSMA(data, 20);
		var smaLine = chart.addLineSeries({
			color: 'rgba(4, 111, 232, 1)',
			lineWidth: 2,
		});
		smaLine.setData(smaData);


		function calculateSMA(data, count) {
			var avg = function (data) {
				var sum = 0;
				for (var i = 0; i < data.length; i++) {
					sum += data[i].close;
				}
				return sum / data.length;
			};
			var result = [];
			for (var i = count - 1, len = data.length; i < len; i++) {
				var val = avg(data.slice(i - count + 1, i));
				result.push({ time: data[i].time, value: val });
			}
			return result;
		}


		// var minimumPrice = data[0].value;
		// var maximumPrice = minimumPrice;
		// for(var i = 1; i < data.length; i++) {
		//   var price = data[i].value;
		//   if (price > maximumPrice) {
		//     maximumPrice = price;
		//   }
		//   if (price < minimumPrice) {
		//     minimumPrice = price;
		//   }
		// }
		// var avgPrice = (maximumPrice + minimumPrice) / 2;

		// var lineWidth = 2;
		// var minPriceLine = {
		//   price: minimumPrice,
		//   color: '#be1238',
		//   lineWidth: lineWidth,
		//   lineStyle: window.LightweightCharts.LineStyle.Solid,
		//   axisLabelVisible: true,
		//   title: 'min price',
		// };
		// var avgPriceLine = {
		//   price: avgPrice,
		//   color: '#be1238',
		//   lineWidth: lineWidth,
		//   lineStyle: window.LightweightCharts.LineStyle.Solid,
		//   axisLabelVisible: true,
		//   title: 'avg price',
		// };
		// var maxPriceLine = {
		//   price: maximumPrice,
		//   color: '#be1238',
		//   lineWidth: lineWidth,
		//   lineStyle: window.LightweightCharts.LineStyle.Solid,
		//   axisLabelVisible: true,
		//   title: 'max price',
		// }

		//candleSeries.createPriceLine(minPriceLine);
		//candleSeries.createPriceLine(avgPriceLine);
		//candleSeries.createPriceLine(maxPriceLine);
		//chart.timeScale().fitContent();



	}, 100);



	return (
		<>

			<Grid direction="row" container className="flexGrow" spacing={1} style={{ paddingLeft: "5px", paddingRight: "5px" }}>
				<Grid item xs={12} sm={12} >

				
				 <div id="showChartTitle" style={{ fontSize: "12px" }}> </div>
				</Grid>

				<Grid item xs={12} sm={12} >
				<div id="chart">

				</div>

				</Grid>
			</Grid>
			
		

		</>

	);
}