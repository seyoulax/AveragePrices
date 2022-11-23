/*НАЧАЛО ПРОЕКТА*/

//импортим библиотеки
const axios = require('axios')
const papa = require('papaparse') 

//интерфейс для авторизации 
interface IAuth {
    user: string
    password: string
}
//интерфейс хэдеров запроса
interface IHeaders{
    [key: string] : string
}
//интрефейс даты среднего арифметического
interface IAverageData{
    average: string
}

//импортим обьект с данными на авторизацию
const AuthData: IAuth = require('./config/config.json')

//тип данных под массив из всех заказов
type Order = Array<Array<string>>

//нужные значения полей заказа 
const correct_values: Array<string> = ['+7', 'self-pickup'] 

//функция для хэширования данных авторизации
function SetAuthHash(AuthData: IAuth): string {
    let authString: string = `${AuthData.user}:${AuthData.password}` 
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
    return proper_prices
    
}
//функция для подсчета среднего среди значений массива
function CountAverage(data: number[]) : number {
    let summ: number = 0
    let d_length: number = data.length
    if(data.length == 0){
        return summ
    } else {
        for(let i = 0; i < data.length; i++){
            summ += data[i]
        }
        let average: number = summ / d_length
        return parseFloat(average.toFixed(2))
    }
}
//функция для отправки результата
function SendAverage(PricesAverage: number) : void{
    let dataJson: string = JSON.stringify({average : `${PricesAverage}`}) 
    const headers_: IHeaders = {
        'Content-Type': 'application/json',
        'Authorization': SetAuthHash(AuthData)
    }
    axios.post('https://apply.leadball.app/reports', dataJson, { headers: headers_ }).then(
        (res) => { console.log(
                `{
                    "status": OK,
                    result: ${Object.values(res)} 
                }`
            )
        }).catch( (err) => {
            console.log(`{
                "status": FALSE,
                code_error: ${Object.values(err)} 
            }`)
        })
                
}
//запрос на получение получение всех заказов (а также весь остальной функционал)
function ReceiveAndWorkWData() : void {
    //гет запрос на получение всех основных данных
   axios.get('https://apply.leadball.app/orders', { headers: { "Authorization" : SetAuthHash(AuthData), "content-type" : "text/csv"}}).then( 
        (res) =>
            {
                //парсим на массив пришедший обьект ответа от сервера  выбираем строчку csv
                let CsvString = Object.values(res)[5]
                //парсим строчку csv на массив (с помощью специльной библиотеки papaparser) 
                let OrdersData = papa.parse(CsvString)
                //вызываем функцию нахождения всех походящих нам сумм заказов
                let PricesArr: number[] = PickNeedfulOrders(OrdersData.data, correct_values)
                //считаем среднее по суммам заказов
                let PricesAverage: number = CountAverage(PricesArr)
                //вызываем функции для отправки результата
                SendAverage(PricesAverage)
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

//вызываем основную функцию
ReceiveAndWorkWData();