const axios = require('axios');
const hostname = "https://viacep.com.br/ws/";

const csvToJson = require('convert-csv-to-json');


class DataManipulate{
    
    async getDataFile(filecsv){
        try {
            const json = csvToJson.getJsonFromCsv(filecsv);
            const vet = []
            const vetAdress = []
            json.forEach(person => {

                var personJson = {
                    name: person.Nome,
                    CEP: person.CEP,
                    CPF: person.CPF,
                    date_sent: this.js_yyyy_mm_dd_hh_mm_ss(),
                    address: {}
                }
                
                vetAdress.push(this.getLocation(personJson.CEP))
                vet.push(personJson)
            });

            const resultado = await Promise.all(vetAdress);
            for (let i = 0; i < vet.length; i++) {
                vet[i].address = resultado[i];
            }

            return vet;


        }  catch (error) {
            console.error('erro', error)
            return 'error';
        }
    };
    
    async getLocation(cep) {
        try {
            const response = await axios.get(`${hostname}${cep}/json`)
            const addresJSON = {
                district:response.data.bairro,
                street:response.data.logradouro,
                state:response.data.localidade
            }
            return addresJSON
        } catch (err) {
            console.error("ErrorGetLocation")
        }
    }

    returnJson(filename){
        const json = {
            "id": '', 
            "name": '', 
            "date_sent": '', 
            "file_name": filename, 
            "status": ''
        }
        var arrayID_NAME = filename.split("_", 2)
        var regex = /[A-Z][a-z]+/g;
        var arrayNames = arrayID_NAME[0].match(regex)


        arrayNames.forEach(element => {
            json.name += element + ' ';
        });
        json.name = json.name.trim()

        arrayID_NAME[1]+= ' '
        var arrayID = arrayID_NAME[1].split(".csv ")
        json.id = arrayID[0]

        json.date_sent = this.js_yyyy_mm_dd_hh_mm_ss()

        json.status = "upload_complete"
        return json;
    }

    verifyTypeData(filename){
        var breakName = filename.split(".")
        if(breakName[breakName.length - 1] == "csv"){
            return true
        }else{
            return false;
        }
    }

    verifyCEP(cep){
        if(cep.length != 8){
            return false
        }
        const numbers = [0,1,2,3,4,5,6,7,8,9]
        const vetCEP = cep.split("");
        let testType = 0;
        for (let j = 0; j < vetCEP.length; j++) {
            for (let i = 0; i < numbers.length; i++) {
                if(numbers[i] != vetCEP[j]){
                    testType += 1;
                }
            }
            if(testType == 10){
                return false
            }
            testType = 0;
        }
        
        return true
    }

    js_yyyy_mm_dd_hh_mm_ss () {
        let now = new Date();
        let year = "" + now.getFullYear();
        let month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
        let day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
        let  hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
        let minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
        let second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
        return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
    }
}

module.exports = new DataManipulate()