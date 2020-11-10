const { Pool } = require('pg');
const dataController = require('../controller/DataController')

const pool = new Pool({
    host: 'localhost',
    user: 'postgres',
    password: '2262333',
    database: 'pgmais',
    port:'5432'
})

class DatabaseCommands {
    async getAllCustomersOfTheUser(id) {// 
        let users = '';
        try {
            users = await pool.query(`SELECT * FROM customers WHERE id_user = '${id}'`)
        } catch (error) {
            console.log(error)
        }
        console.log(users);
        return users.rows;
    }
    
    async removeUsers(id_User){
        let userSelect = ''
        let userDeleted = ''
        try {
            userSelect = await pool.query(`SELECT * FROM users WHERE id_user = '${id_User}'`)
        } catch (error) {
            console.log("Error")
        }

        try {
            userDeleted = await pool.query(`DELETE FROM customers WHERE id_user = '${id_User}'`)
        } catch (error) {
            console.log(error)
            return {Error: "Error"}
        }

        try {
            await pool.query(`DELETE FROM users WHERE id_user = '${id_User}'`)
        } catch (error) {
            console.log(error)
            return {Error: "Error"}
        }
        
        return userSelect.rows;
    }
    
    async removeRecord(id_User, id_Customer){
        let userDeleted = ''
        let userSelect = ''
        try {
            userSelect = pool.query(`SELECT * FROM customers WHERE id_user = '${id_User}' AND  id_customer = ${id_Customer}`)
        } catch (error) {
            console.log('Erro ao fazer o select', error)
        }

        try {
            userDeleted = pool.query(`DELETE FROM customers WHERE id_user = '${id_User}' AND  id_customer = '${id_Customer}'`)
        } catch (error) {
            console.log("Naõ foi possivel deletar")
        }

        return userSelect;
    }

    async insertUsersInDB(element, jsonUser){
        const teste = await pool.query(`INSERT INTO customers (name, cep, cpf, date_sent, district, street, state, id_user) VALUES ('${element.name}', 
            '${element.CEP}', '${element.CPF}', '${element.date_sent}', '${element.address.district}', '${element.address.street}', 
            '${element.address.state}', '${jsonUser.id}')`,
            (err, result) =>{
                if(err){
                    console.error(x)
                    return err;
                }
                
        });
        return teste
    }
    
    async createTableUsers_Customers(){
        await pool.query(`CREATE TABLE users(id_user VARCHAR(40), 
                name VARCHAR(40), date_sent TIMESTAMP, PRIMARY KEY(id_user))`, 
                (err, result) => {
                    if(err){
                        console.log("Tabela já existe")
                    }
                }
            )
        await pool.query(`CREATE TABLE customers(id_customer SERIAL PRIMARY KEY, 
                name VARCHAR(40), cep VARCHAR(8),  cpf VARCHAR(11),  
                date_sent TIMESTAMP, district VARCHAR(100), street VARCHAR(100), 
                state VARCHAR(100), id_user VARCHAR(40), 
                FOREIGN KEY (id_user) REFERENCES users (id_user))`,
                (err, result) => {
                    if(err){
                        console.log("err")
                    }
                }
        )
    }

    async createUserInDb(jsonUser) {
        try {
            await pool.query(`INSERT INTO users (id_user, name, date_sent) VALUES 
            ('${jsonUser.id}', '${jsonUser.name}', '${jsonUser.date_sent}')`)
        } catch (error) {
            console.error("User already exists")
        }
        let x = ''
        try {
            x = await this.verifyAlreadyUserExists(jsonUser)
        } catch (error) {
            console.log(error)
        }

        
        if(x == "error"){
            return "error";
        }
        else{
            return "ok"
        }        
    }

    async verifyAlreadyUserExists(jsonUser){
        let x = ''
        try {
            x = await pool.query(`SELECT * FROM users WHERE id_user = '${jsonUser.id}'`)
        } catch (err) {
            console.error("Error")
        }

        let countExistingUser = 0;
        x.rows.forEach(user => {
            if(jsonUser.id == user.id_user && jsonUser.name == user.name){
            countExistingUser++
            }
        })
        if(countExistingUser != 1){
            console.log("ID already exists, change and try again")
            return "error"
        }
        console.log(x)
        return x;
    }

    async updateCustomer(userID, customerID, name, CPF, CEP) {
        let newLocation = ''
        if(!dataController.verifyCEP(CEP)){
            return {
                Error: "Invalid CEP"
            }
        }
        try {
            newLocation = await dataController.getLocation(CEP)
        } catch (error) {
            console.log
        }

        try {
            await pool.query(`UPDATE customers SET name = '${name}', CPF = '${CPF}', CEP = '${CEP}',  
            district = '${newLocation.district}', street = '${newLocation.street}', state = '${newLocation.state}'
            WHERE id_user = '${userID}' AND id_customer = ${customerID}`)
        } catch (error) {
            console.log(error)
            return {
                Error: "Invalid Data"
            }
        }
        
        return {
            _id: customerID,
            date_sent: dataController.js_yyyy_mm_dd_hh_mm_ss(),
            name: name,
            status: "User_Updated"
        }
    }
}





module.exports = new DatabaseCommands