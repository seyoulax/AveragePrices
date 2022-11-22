//Начало проекта
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
    console.log(proper_prices);
    return proper_prices;
}
//запрос на получение получение всех заказов (а также весь остальной функционал)
function ReceiveData() {
    //гет запрос на получение всех основных данных
    axios.get('https://apply.leadball.app/orders', { headers: { "Authorization": SetAuthHash(AuthData), "content-type": "text/csv" } }).then(function (res) {
        //парсим на массив пришедший обьект ответа от сервера  выбираем строчку csv
        var CsvString = Object.values(res)[5];
        //парсим строчку csv на массив (с помощью специльной библиотеки papaparser) 
        var OrdersData = papa.parse(CsvString);
        //вызываем функцию нахождения всех походящих нам сумм заказов
        PickNeedfulOrders(OrdersData.data, correct_values);
    })["catch"](function (err) {
        //обработка ошибки 
        console.log("{\n                        \"status\": FALSE,\n                        code_error: ".concat(err, " \n                    }"));
    });
}
ReceiveData();
