const fs = require('fs');

const axios = require('axios');

class Busquedas {

    //Propiedades
    historial = [];
    dbPath = './db/database.json';

    constructor() {
        //TODO leer db si existe
        this.leerDB();
    }

    get historialCapitalizado() {
        //Capitalizar cada palabra
        return this.historial.map(lugar => {

            return lugar.replace(/\w\S*/g, (w) => (w.replace(/^\w/, (c) => c.toUpperCase())));

        });
    }

    //Metodos
    get paramsMapbox() {
        return {
            'access_token': process.env.MAPBOX_KEY,
            'limit': 5,
            'language': 'es'
        }
    }

    get paramsOpenWeather() {
        return {
            appid: process.env.OPENWEATHER_KEY,
            units: 'metric',
            lang: 'es'
        }
    }


    async ciudad(lugar = '') {

        try {
            //petición http
            console.log('ciudad escogida: ', lugar);

            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();
            //const resp = await axios.get('https://api.mapbox.com/geocoding/v5/mapbox.places/Barcelo.json?limit=5&language=es&access_token=pk.eyJ1IjoiNzdjYW5jaW5vcyIsImEiOiJjbDRpeG9xcmswMHA1M2lubnA2cm9yeGxwIn0.q_GvhZupkKoNF21F3pa1bw');
            return resp.data.features.map(lugar => ({
                id: lugar.id,
                nombre: lugar.place_name,
                lng: lugar.center[0],
                lat: lugar.center[1]
            }));


        } catch (error) {
            return [];
        }


    }

    async climaLugar(lat, lon) {

        try {
            //Creamos la instancia axios.create()
            const instance = axios.create({
                baseURL: `https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsOpenWeather, lat, lon }
            });

            const resp = await instance.get();

            const { weather, main } = resp.data;
            //resp extraemos la información de la data
            return {
                desc: weather[0].description,
                min: main.temp_min,
                max: main.temp_max,
                temp: main.temp
            }


        } catch (error) {
            console.log(error);
        }

    }

    agregarHistorial(lugar = '') {

        if (this.historial.includes(lugar.toLowerCase())) {
            return;
        }

        //TODO Prevenir duplicados
        this.historial.unshift(lugar.toLowerCase());

        //Grabar en DB o JSON
        this.guardarDB();

    }

    guardarDB() {

        const payload = {
            his: this.historial
        }

        fs.writeFileSync(this.dbPath, JSON.stringify(payload))

    }

    leerDB() {

        if (!fs.existsSync(this.dbPath)) {
            return;
        }

        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
        const data = JSON.parse(info);

        //this.historial = data.historial;
        return data;

    }

}


module.exports = Busquedas;