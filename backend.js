//==============================
//подключение библиотек
//==============================
let express = require("express"),
    multer = require("multer"),
    bodyParser = require('body-parser'),
    path = require('path'),
    app = express();

const MongoClient = require('mongodb').MongoClient,
    // url = 'mongodb://localhost:27017/usersdb';
    url = 'mongodb+srv://vsezol:vsezol2535@cluster0-y7zth.mongodb.net/test?retryWrites=true&w=majority';

let db;

let urlencodedParser = bodyParser.urlencoded({
    extended: false
});

// создаем парсер для данных в формате json
const jsonParser = express.json();

//==============================
//подключение питона
//==============================
// let {
//     PythonShell
// } = require('python-shell'),
//     pyshell = new PythonShell('python_scripts/LongLife.py'),
//     pythonMessage = "";
//     pyshell2 = new PythonShell('python_scripts/Prediction.py'),
//     pythonMessage2 = "";

let userId = '';
//==============================
//подключение промежуточных обработчиков статических каталогов
//==============================
app.use(express.static(__dirname));
app.use(multer({
    dest: "uploads"
}).single("filedata"));
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', './views');
app.set('view engine', 'ejs');

//==============================
//подключение вкладок
//==============================
app.get('/', (req, res) => {
    res.render('index');
});

app.get('/registration', (req, res) => {
    res.render('registrationForm');
});

app.get('/program', (req, res) => {
    res.render('program');
});

app.get('/about-us', (req, res) => {
    res.render('aboutUs');
});

app.get('/prediction', (req, res) => {
    res.render('programPD');
});

app.get('/virtual-sensor', (req, res) => {
    res.render('programVS');
});

//==============================
//обработка формы загрузки данных
//==============================
app.post('/load-form', urlencodedParser, (req, res) => {
    let bodyData = req.body;
    let fileData = req.file;

    if (!req.body || !fileData) res.send("Допущена ошибка при загрузке данных");

    inputForm = {
        requestType: bodyData.requestType,
        lastDate: bodyData.date,
        userEmail: bodyData.userEmail,
        password: bodyData.password
    };
    console.log(inputForm);
    db.db('usersdb').collection('users').findOne({
        userEmail: inputForm.userEmail,
        password: inputForm.password
    }, (err, result) => {

        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        if (result === null) {
            console.log('Пользователь не найден');
            res.send("Пользователь не найден");
        } else {
            userId = result['_id'];
            //отправка пути файла питону
            if (inputForm.requestType == '1') {
                //Virtual sensor
                // pyshell.send(fileData.path);
                // pyshell.send(userId);
                userId = String(userId);
                console.log("run VS py");
            } else if (inputForm.requestType === '2') {
                //PR
                // pyshell2.send(fileData.path);
                // pyshell2.send(userId);
                userId = String(userId);
                console.log("run PR py");
            }
        }
        db.close();
    });
    if (inputForm.requestType == '1') {
        res.render('programVS');
    } else if (inputForm.requestType === '2') {
        res.render('programPD');
    }
});

//==============================
//событие получение сообщения от питона
//==============================
// pyshell.on('message', (message) => {
//     pythonMessage = message;
//     console.log(`Message from VS py ${pythonMessage}`);
// });

// pyshell2.on('message', (message) => {
//     pythonMessage2 = message;
//     console.log(`Message from VS py ${pythonMessage2}`);
// });

app.post('/get-graphics', jsonParser, (req, res) => {

    if (pythonMessage === "end py" || pythonMessage2 === "end py") {
        console.log("Отправка данных клиенту...");

        db.db('usersdb').collection('Prediction').find({
            id: userId
        }).toArray(function (err, result) {

            pythonMessage = "";
            pythonMessage2 = "";
            
            if (err) {
                console.log(err);
                res.sendStatus(500);
            }
            if (result === null) {
                console.log('Что-то пошло не так');
                res.send("Что-то пошло не так");
            } else {
                res.json(result[result.length - 1]);
                // console.log(result[result.length - 1]);
                console.log("Отправка завершена.");
                db.close();
            }
        });
    } else {
        res.json({
            state: "no"
        });
    }
});

//==============================
//обработка формы регистрации
//==============================
app.post('/user-reg', urlencodedParser, (req, res) => {
    let bodyData = req.body;
    if (!bodyData) res.send("Допущена ошибка при загрузке данных");

    let user = {
        companyName: bodyData.companyName,
        userName: bodyData.userName,
        userEmail: bodyData.userEmail,
        password: bodyData.password
    };

    db.db('usersdb').collection('users').insertOne(user, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        console.log(user);
        db.close();
    });

    res.render('index');
});

app.post('/email-confirm', jsonParser, (req, res) => {
    console.log(req.body);
    if (!req.body) return res.sendStatus(400);
    let cm = {
        isOriginal: false
    }

    db.db('usersdb').collection('users').findOne({
        userEmail: req.body.userEmail
    }, (err, result) => {
        if (err) {
            console.log(err);
            res.sendStatus(500);
        }
        if (result === null) {
            cm.isOriginal = true;
        } else {
            cm.isOriginal = false;
        }
        db.close();
        res.json(cm);
    });
});

//==============================
// подключаемся к базе данных
//==============================
MongoClient.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}, (err, database) => {
    if (err) {
        return console.log(err);
    }
    db = database;
    // запуск сервера (порт)
    app.listen(8080, () => {
        console.log(`API app started on port ${8080}`);
    });
});