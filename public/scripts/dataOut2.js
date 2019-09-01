let loading = document.getElementById('load-icon'),
	block = document.getElementById('grgrgrg'),
	answerGen = document.getElementById('answer-generation');

google.charts.load('current', {
	'packages': ['line']
});

function drawChart(massiv, gColor, mainTitle, titleY, titleX, elId) {

	var data = new google.visualization.DataTable();
	data.addColumn('number', 'Day');
	data.addColumn('number', '');

	data.addRows(massiv);

	var options = {
		titleTextStyle: {
			color: gColor,
			fontSize: 24,
		},
		chart: {
			title: mainTitle
		},
		hAxis: {
			title: titleX,
			titleTextStyle: {
				color: gColor,
				fontSize: 18
			}
		},
		vAxis: {
			title: titleY,
			titleTextStyle: {
				color: gColor,
				fontSize: 18
			}
		},
		colors: [gColor],
		width: 800,
		height: 400
	};

	var chart = new google.charts.Line(document.getElementById(elId));

	chart.draw(data, google.charts.Line.convertOptions(options));
}

function startView(gr) {
	loading.style.display = 'none';
	block.style.display = 'block';

	drawChart(gr.Oil_temp, 'red', 'Температура масла', 'Температура масла, °C', 'Часы', 'graph1');

	drawChart(gr.Humidity, 'blue', 'Влагосодержание масла', 'Влагосодержание, г/т', 'Часы', 'graph2');

	drawChart(gr.H2_concentration, 'green', 'Концентрация H2', 'Концентрация H2, мкл/л', 'Часы', 'graph3');

	drawChart(gr.CO_concentration, 'orange', 'Концентрация CO', 'Концентрация CO, мкл/л', 'Часы', 'graph4');
}

let graphics = {
	state: "no"
};
console.log(JSON.parse(window.localStorage.getItem("isPDNew")));
if (JSON.parse(window.localStorage.getItem("isPDNew")) == false) {
	google.charts.setOnLoadCallback(() => {
		startView(JSON.parse(window.localStorage.getItem("userPD")));
	});
} else {

	let iGen = 0;
	let iGenStr = '';
	let loadIconId = setInterval(() => {
		answerGen.innerHTML = 'Генерируем <br /> ответ ' + iGenStr;
		if (iGen == 1) iGenStr = '&nbsp&nbsp&nbsp';
		if (iGen == 2) iGenStr = '.&nbsp&nbsp';
		if (iGen == 3) iGenStr = '..&nbsp';
		if (iGen == 4) iGenStr = '...';
		if (iGen > 4) iGen = 0;
		iGen++;
	}, 250);

	let requestWaitingId = setTimeout(function requestWaiting() {

		let request = new XMLHttpRequest();
		request.open("POST", "/get-graphics", true);
		request.setRequestHeader("Content-Type", "application/json");
		request.addEventListener("load", () => {
			graphics = JSON.parse(request.response);
			console.log(graphics);
		});
		request.send();

		if (graphics.state === "no") {
			setTimeout(requestWaiting, 5000);
		} else {
			window.localStorage.setItem("userPD", JSON.stringify(graphics));
			window.localStorage.setItem("isPDNew", "false");
			clearInterval(loadIconId);
			startView(JSON.parse(window.localStorage.getItem("userPD")));
			clearTimeout(requestWaitingId);
		}
	});
}