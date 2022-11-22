//Начало проекта

//импортим библиотеки
const axios = require('axios')
const papa = require('papaparse') 

//интерфейс для авторизации 
interface IAuth {
    user: string
    password: string
}

//импортим обьект с данными на авторизацию
const AuthData: IAuth = require('./config/config.json')

//тип данных под массив из всех заказов
type Order = Array<Array<string>>

//нужные значения полей заказа 
const correct_values: Array<string> = ['+7', 'self-pickup'] 

//функция для хэширования данных авторизации
function SetAuthHash(AuthData: IAuth): string {
    let authString = `${AuthData.user}:${AuthData.password}` 
    return `Basic ${btoa(authString)}`
}

//функция для выборки для всех подходящих сумм заказов
function PickNeedfulOrders(data: Order, correct_values: Array<string>) : number[]{
    var proper_prices: number[] = []
    for(let i = 1; i < data.length; i++) { 
        let CData: Array<string> = data[i]
        let PhoneData = CData[3]?.split(" ")
        if(PhoneData?.includes(correct_values[0]) && CData[4] == correct_values[1]){
            proper_prices.push(Number(CData[5]))
        }
    }
    console.log(proper_prices)
    return proper_prices
    
}
//запрос на получение получение всех заказов (а также весь остальной функционал)
function ReceiveData() : void {
    //гет запрос на получение всех основных данных
   axios.get('https://apply.leadball.app/orders', { headers: { "Authorization" : SetAuthHash(AuthData), "content-type" : "text/csv"}}).then( 
        (res) =>
            {
                //парсим на массив пришедший обьект ответа от сервера  выбираем строчку csv
                let CsvString = Object.values(res)[5]
                //парсим строчку csv на массив (с помощью специльной библиотеки papaparser) 
                let OrdersData = papa.parse(CsvString)
                //вызываем функцию нахождения всех походящих нам сумм заказов
                PickNeedfulOrders(OrdersData.data, correct_values)
            }
   ).catch( 
        (err) => 
            {  
                //обработка ошибки 
                console.log
                (
                    `{
                        "status": FALSE,
                        code_error: ${err} 
                    }`
                )
            }
   )
}

ReceiveData()