const express = require('express');
const app = express();
const multer = require('multer');
const fs = require('fs')
const dataController = require('./src/controller/DataController')
const db = require('./src/DB/DB')
const bodyParser = require("body-parser");
app.use(bodyParser.json());
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './src/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

app.get('/users/:idUser/clients', async function(req, res){ //ok
    const id = req.params.idUser
    let users = ''
    try {
        users = await db.getAllCustomersOfTheUser(id)
    } catch (error) {
        console.log(error)
        res.status(403).json({Error: "Invalid user id"})
        return;
    }
    console.log(users)
    res.status(200).json(users)
}) 

app.delete('/removeUser/:identifierUser', async function(req, res){//ok
    const idUser = req.params.identifierUser
    let userDeleted = ''
    try {
        userDeleted = await db.removeUsers(idUser)
    } catch (error) {
        
    }
    if(userDeleted[0] == undefined){
        res.status(403).json({
            Error: "Users doesn't exist or already removed"
        })
        return;
    }
    res.status(200).json({
        id_user: userDeleted[0].id_user,
        name: userDeleted[0].name,
        date_sent: userDeleted[0].date_sent,
        status: "deleted"
    })
})

app.delete('/remove/:identifierUser/:identifierCustomer', async function(req, res){//ok
    const idUser = req.params.identifierUser
    const idCustomer = req.params.identifierCustomer
    let userDeleted = '';
    try {
        userDeleted = await db.removeRecord(idUser, idCustomer)
    } catch (error) {
        console.log("Deu pau na hora de deletar", error)
    }

    if(userDeleted.rows[0] == undefined){
        res.status(403).json({
            Error: "Customer doesn't exist or already removed"
        })
        return;
    }
    res.status(200).json(userDeleted.rows[0])
})

app.put('/customers/:idUser', async function(req, res){//ok
    const idUser = req.params.idUser
    
    console.log(req.body)


    const { id_customer, name, CEP, CPF } = req.body;
    let customerUpdated = ''; 
    try {
        customerUpdated = await db.updateCustomer(idUser, id_customer, name, CPF, CEP)
    } catch (error) {
        res.status(403).json({
            Error: "Erro Updated"
        })
    }
    res.status(200).json(customerUpdated);
})

app.post('/customers/upload', upload.array('file'), async function(req, res){//ok
    let vetJSON = []
    for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        
        try{
            await db.createTableUsers_Customers() //Create Table User and Customer
            var filename = file.originalname
            var filePath = `./src/uploads/${filename}`
            const jsonUser = dataController.returnJson(filename)
            const vetPerson = await dataController.getDataFile(filePath);
            
            if(!dataController.verifyTypeData(filename)){
                 res.status(403).json({
                     Error: "Invalid file, check the file type and try again!"
                 })
                 console.log("verificaTipoData")
            }
            let createUserDb = ''
            try {
                createUserDb = await db.createUserInDb(jsonUser)
            } catch (error) {
                console.log("Deu pau na hora de criar ou já existia sl")
            }
            if(createUserDb == "error"){
                res.status(403).json({
                    Error: "Verification ID already exists, change and try again"
                })
                return;
            }
    
            for (let i = 0; i < vetPerson.length; i++) {
                const element = vetPerson[i];
                if(element.address == undefined){
                    console.log(element.address)
                    res.status(403).json({Error: "Invalid CEP, check the CEP of the customers and try again"})
                    return;
                }
    
                try {
                    await db.insertUsersInDB(element, jsonUser)
                }catch(error){
                    console.log("Error na hora de Inserir os customers na tabela")
                    res.status(403).json({Err: "Invalid data, verify and try again"})
                    return;
                }
            }
            
            
            
            fs.unlink(`./src/uploads/${filename}`, (err) => {
                if (err) throw err;
                console.log(`${filename} was deleted`);}
            )

            vetJSON.push(jsonUser)
 
        }catch (error){
           return {
                Error: "Error in files"
           }
        }

    }
    
    res.status(200).json(vetJSON)


});


app.listen(3333, () => console.log('App na porta 3000'))
app.use(express.static('./src/public'));