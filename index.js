require('dotenv').config();

const { leerInput, inquirerMenu, pausa, listarLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async() => {

    //Variables e instancias generales
    const busquedas = new Busquedas();
    let opt = 0;

    do {
        //Imprimimos el menu
        opt = await inquirerMenu();

        switch (opt) {
            case 1:
                //Mostrar mensaje
                const terminoBusqueda = await leerInput('Escribe la ciudad a buscar: ');
                //Buscar los lugares
                const lugares = await busquedas.ciudad(terminoBusqueda);
                //Seleccionar el lugar
                const idSelected = await listarLugares(lugares);

                if (idSelected == '0') continue;

                const lugarSeleccionado = lugares.find(l => l.id === idSelected);

                //Guardar en DB
                busquedas.agregarHistorial(lugarSeleccionado.nombre);

                // console.log({ lugarSeleccionado });

                //Obtener datos del clima
                const clima = await busquedas.climaLugar(lugarSeleccionado.lat, lugarSeleccionado.lng);
                //console.log(clima);

                //Mostrar resultados
                console.clear();
                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad', lugarSeleccionado.nombre);
                console.log('Lat', lugarSeleccionado.lat);
                console.log('Lng', lugarSeleccionado.lng);
                console.log('Temperatura', clima.temp);
                console.log('Minima', clima.min);
                console.log('Maxima', clima.max);

                console.log('El clima se ve:', clima.desc);

                break;

            case 2:
                busquedas.historialCapitalizado.forEach((lugar, id) => {
                    const idx = `${id+1}.`.green;
                    console.log(`${idx} ${lugar}`);
                });

                break;
        }

        //Pausamos para mostrar la info despues de elegir los cases
        await pausa();

    } while (opt != 0);



}


main();