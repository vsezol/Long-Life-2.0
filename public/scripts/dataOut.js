let loading = document.getElementById('load-icon'),
	block = document.getElementById('grgrgrg'),
	answerGen = document.getElementById('answer-generation'),
	indexTextInfo = document.getElementsByClassName('progress-text');

let s1 = document.getElementById('s1'),
	s2 = document.getElementById('s2'),
	s3 = document.getElementById('s3'),
	s4 = document.getElementById('s4'),
	s5 = document.getElementById('s5');

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

function drawIndex(element, index, delay) {

	let percentIndex = 0,
		rColor = 0,
		gColor = 0,
		step = (index / delay) * 100,
		slow = step / 1100;
	setInterval(() => {
		if (percentIndex <= index * 100) {
			percentIndex += step;
			if (1.2 * step > slow) step -= slow;
			// console.log(percentIndex);
		}

		let colorIndex = (percentIndex / 100).toFixed(3);

		if (colorIndex >= 0.5) {
			gColor = Math.round(255 - (colorIndex - 0.5) * 255 / 0.5);
			rColor = 255;
		} else {
			rColor = Math.round(colorIndex * 255 / 0.5);
			gColor = 255;
		}

		element.style.background =
			`linear-gradient(90deg, RGB( ${rColor}, ${gColor}, 0) ${percentIndex}%, #fff 0)`;
	}, 5);
}

function startView(gr) {
	loading.style.display = 'none';
	block.style.display = 'block';

	drawIndex(s1, gr.index[0], 100);
	indexTextInfo[0].innerHTML = `Индекс концентрации H2: <b>${(gr.index[0]*100).toFixed(2)}</b> %`;

	drawIndex(s2, gr.index[1], 100);
	indexTextInfo[1].innerHTML = `Индекс концентрации CO: <b>${(gr.index[1]*100).toFixed(2)}</b> %`;

	drawIndex(s3, gr.index[2], 100);
	indexTextInfo[2].innerHTML = `Индекс влагосодержания масла: <b>${(gr.index[2]*100).toFixed(2)}</b> %`;

	drawIndex(s4, gr.index[3], 100);
	indexTextInfo[3].innerHTML = `Индекс температуры: <b>${(gr.index[3]*100).toFixed(2)}</b> %`;

	drawIndex(s5, gr.index[4], 100);
	indexTextInfo[4].innerHTML = `ИТС трансформатора: <b>${(gr.index[4]*100).toFixed(2)}</b> % 
	(${gr.recommendation}).`;

	drawChart(gr.Oil_temp, 'red', 'Температура масла', 'Температура масла, °C', 'Часы', 'graph1');

	drawChart(gr.Humidity, 'blue', 'Влагосодержание масла', 'Влагосодержание, г/т', 'Часы', 'graph2');

	drawChart(gr.H2_concentration, 'green', 'Концентрация H2', 'Концентрация H2, мкл/л', 'Часы', 'graph3');

	drawChart(gr.CO_concentration, 'orange', 'Концентрация CO', 'Концентрация CO, мкл/л', 'Часы', 'graph4');
}

let graphics = {
	state: "no"
};
console.log(JSON.parse(window.localStorage.getItem("isVSNew")));
if (JSON.parse(window.localStorage.getItem("isVSNew")) == false) {
	google.charts.setOnLoadCallback(() => {
		startView(JSON.parse(window.localStorage.getItem("userVS")));
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
			window.localStorage.setItem("userVS", JSON.stringify(graphics));
			window.localStorage.setItem("isVSNew", "false");
			clearInterval(loadIconId);
			startView(JSON.parse(window.localStorage.getItem("userVS")));
			clearTimeout(requestWaitingId);
		}
	});
}