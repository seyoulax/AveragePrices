/*НАЧАЛО ПРОЕКТА*/
//импортим библиотеки
var axios = require('axios');
var papa = require('papaparse');
//импортим обьект с данными на авторизацию
var AuthData = require('./config/config.json');
//нужные значения полей заказа 
var correct_values = ['+7', 'self-pickup'];
//функция для хэширования данных авторизации
function SetAuthHash(AuthData) {
    var authString = "".concat(AuthData.user, ":").concat(AuthData.password);
    return "Basic ".concat(btoa(authString));
}
//функция для выборки для всех подходящих сумм заказов
function PickNeedfulOrders(data, correct_values) {
    var _a;
    var proper_prices = [];
    for (var i = 1; i < data.length; i++) {
        var CData = data[i];
        var PhoneData = (_a = CData[3]) === null || _a === void 0 ? void 0 : _a.split(" ");
        if ((PhoneData === null || PhoneData === void 0 ? void 0 : PhoneData.includes(correct_values[0])) && CData[4] == correct_values[1]) {
            proper_prices.push(Number(CData[5]));
        }
    }
    return proper_prices;
}
//функция для подсчета среднего среди значений массива
function CountAverage(data) {
    var summ = 0;
    var d_length = data.length;
    if (data.length == 0) {
        return summ;
    }
    else {
        for (var i = 0; i < data.length; i++) {
            summ += data[i];
        }
        var average = summ / d_length;
        return parseFloat(average.toFixed(2));
    }
}
//функция для отправки результата
function SendAverage(PricesAverage) {
    var dataJson = JSON.stringify({ average: "".concat(PricesAverage) });
    var headers_ = {
        'Content-Type': 'application/json',
        'Authorization': SetAuthHash(AuthData)
    };
    axios.post('https://apply.leadball.app/reports', dataJson, { headers: headers_ }).then(function (res) {
        console.log("{\n                    \"status\": OK,\n                    result: ".concat(Object.values(res), " \n                }"));
    })["catch"](function (err) {
        console.log("{\n                \"status\": FALSE,\n                code_error: ".concat(Object.values(err), " \n            }"));
    });
}
//запрос на получение получение всех заказов (а также весь остальной функционал)
function ReceiveAndWorkWData() {
    //гет запрос на получение всех основных данных
    axios.get('https://apply.leadball.app/orders', { headers: { "Authorization": SetAuthHash(AuthData), "content-type": "text/csv" } }).then(function (res) {
        //парсим на массив пришедший обьект ответа от сервера  выбираем строчку csv
        var CsvString = Object.values(res)[5];
        //парсим строчку csv на массив (с помощью специльной библиотеки papaparser) 
        var OrdersData = papa.parse(CsvString);
        //вызываем функцию нахождения всех походящих нам сумм заказов
        var PricesArr = PickNeedfulOrders(OrdersData.data, correct_values);
        //считаем среднее по суммам заказов
        var PricesAverage = CountAverage(PricesArr);
        //вызываем функции для отправки результата
        SendAverage(PricesAverage);
    })["catch"](function (err) {
        //обработка ошибки 
        console.log("{\n                        \"status\": FALSE,\n                        code_error: ".concat(err, " \n                    }"));
    });
}
//вызываем основную функцию
ReceiveAndWorkWData();
