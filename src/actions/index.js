import axios from 'axios';

const BASE_URL = "https://finnhub.io/api/v1/";
const API_KEY = "bqnc08frh5re7283le90";
const today = new Date();  
const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

function toTimestamp(year,month,day,hour,minute,second){
    var datum = new Date(Date.UTC(year,month-1,day,hour,minute,second));
    return datum.getTime()/1000;
   }


export function loadStock(symbol) {
    return async (dispatch) => {
        dispatch({ type: 'START_LOADING' });
        dispatch({ type: 'CLEAR_ERRORS' });
        const s_url = `${BASE_URL}quote?`;
        const p_url = `${BASE_URL}/stock/profile2?`;
        const n_url = `${BASE_URL}/company-news?`;
        const e_url = `${BASE_URL}/calendar/earnings?`;
        try{
            const company = await axios(s_url, {params: {
                symbol: symbol,
                token: API_KEY
            }});
            const profile = await axios(p_url, {params: {
                symbol: symbol,
                token: API_KEY
            }});
            const news = await axios(n_url, {params: {
                symbol: symbol,
                from: date,
                to: date,
                token: API_KEY
            }});
            const earning = await axios(e_url, {params: {
                from: '2010-01-01',
                to: '2020-03-15',
                symbol: symbol,
                token: API_KEY
            }});
            const result =[];
            const earnings = [];
            company.data.diff = (company.data.c - company.data.pc).toFixed();
            company.data.percent = ((company.data.c - company.data.pc)/company.data.pc*100).toFixed(2);
            earning.data.earningsCalendar.forEach(item => {
                earnings.push(item.revenueActual)
            });
            company.data.ticker = symbol;
            company.data.profile = profile.data;
            company.data.earningsCalendar = earnings.reverse();
            result.push(company.data)
            result.push(news.data)
            dispatch({
                type: 'LOAD_STOCK',
                payload: result
            });
        }catch(error){
            dispatch({
                type: 'ERROR',
                payload: error
            });
        }finally{
            dispatch({ type: 'END_LOADING' });
        }
    };
}

export function selectCompany(company){
    return {
        type: 'COMPANY_SELECT',
        payload: company
    };
}


export function loadForex(){
    return async (dispatch) => {
        const f_url = `${BASE_URL}/forex/rates?`;

        try{
            const forex = await axios(f_url, {params: {
                token: API_KEY
            }});
            dispatch({
                type: 'LOAD_FOREX',
                payload: forex.data.quote,
            });
        }catch(error){
            dispatch({
                type: 'ERROR',
                payload: error
            });
        }
    };
}


export function loadGeneralNews(){
    return async (dispatch) => {
        const f_url = `${BASE_URL}/news?`;

        try{
            const general = await axios(f_url, {params: {
                category: 'general',
                minId:2,
                token: API_KEY
            }});
            general.data = general.data.slice(0,4);
            dispatch({
                type: 'LOAD_GENERAL_NEWS',
                payload: general.data,
            });
        }catch(error){
            dispatch({
                type: 'ERROR',
                payload: error
            });
        }
    };
}

export function loadForexNews(){
    return async (dispatch) => {
        const f_url = `${BASE_URL}/news?`;

        try{
            const forex = await axios(f_url, {params: {
                category: 'forex',
                minId:2,
                token: API_KEY
            }});
            forex.data = forex.data.slice(0,4);
            dispatch({
                type: 'LOAD_FOREX_NEWS',
                payload: forex.data,
            });
        }catch(error){
            dispatch({
                type: 'ERROR',
                payload: error
            });
        }
    };
}

function formatting(candle){
    var result = [];
    for(var i=0; i<candle.data.t.length; i++ ){
        var a ={};
        a.x= new Date(candle.data.t[i]*1000);
        var list =[candle.data.o[i],candle.data.h[i],candle.data.l[i],candle.data.c[i]];
        a.y=list;
        result.push(a);
    }
    return result
}

export function loadCandle(){
    return async (dispatch) => {
        const url = `${BASE_URL}/forex/candle?`;
        const from = toTimestamp(today.getFullYear(),today.getMonth()+1,today.getDate()-1,9,0,0);
        const to = toTimestamp(today.getFullYear(),today.getMonth()+1,today.getDate(),9,0,0);
        try{
            const USDcandle = await axios(url, {params: {
                symbol: 'OANDA:EUR_USD',
                resolution: 60,
                from:from,
                to:to,
                token: API_KEY
            }});
            const JPYcandle = await axios(url, {params: {
                symbol: 'OANDA:EUR_JPY',
                resolution: 60,
                from:from,
                to:to,
                token: API_KEY
            }});
            var result = {};
            result.usd = formatting(USDcandle);
            result.jpy = formatting(JPYcandle);
            dispatch({
                type: 'LOAD_CANDLE',
                payload: result,
            });
        }catch(error){
            dispatch({
                type: 'ERROR',
                payload: error
            });
        }
    };
}

export function loadCovid(){
    return async (dispatch) => {
        const url = `${BASE_URL}/covid19/us?`;

        try{
            const covid = await axios(url, {params: {
                token: API_KEY
            }});
            var result = {};
            var cases = [];
            var death = [];
            var state = [];
            var updated = [];
            for(var i=0; i<10; i++ ){
                var d = covid.data[i];
                cases.push(d.case);
                death.push(d.death);
                state.push(d.state);
                updated.push(d.updated);
            }
            result.case = cases;
            result.death = death;
            result.state = state;
            result.updated = updated;
            dispatch({
                type: 'LOAD_COVID',
                payload: result,
            });
        }catch(error){
            dispatch({
                type: 'ERROR',
                payload: error
            });
        }
    };
}