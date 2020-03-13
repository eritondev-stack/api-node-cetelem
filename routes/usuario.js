require('dotenv').config()
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const sql = require('../config/sqlserver')


router.post('/cadastro', (req, res, next) => {


    sql.connect(erro => {

        if (erro) { return res.status(501).send({ messagem: erro.message }) }

        sql.query(` SELECT * FROM TBL_CT_USERS WHERE EMAIL = '${req.body.email}' `)
            .then(dados => {

                const result = dados.recordset

                if (result.length > 0) {

                    res.status(501).send({
                        results: 'Usuario já cadastrado'
                    })


                } else {

                    bcrypt.hash(req.body.senha, 10, (errorBcrypt, hash) => {
                        if (errorBcrypt) {
                            return res.status(500).send({ error: errorBcrypt })
                        }

                        sql.query(`INSERT INTO TBL_CT_USERS VALUES ('${req.body.email}', '${hash}')`)
                            .then(results => {

                                res.status(200).send({
                                    msg: "Cadastro realizado com sucesso"
                                })

                            }).catch(erro => {
                                res.status(501).send({
                                    erro: erro.message
                                })
                            })
                    })

                }

            }).catch(e => {


                res.status(501).send({
                    erro: e.message
                })

            })
    })




})

router.post('/login', (req, res, next) => {


    sql.connect(erro => {

        if (erro) { return res.status(501).send({ erro: erro }) }

        sql.query(`SELECT * FROM TBL_CT_USERS WHERE EMAIL = '${req.body.email}'`)
            .then(result => {

                if (result.recordset.length > 0) {


                    const passwordbanco = result.recordset[0].PASSWORD
                    const emailbanco = result.recordset[0].email
                    const idbanco = result.recordset[0].ID


                    bcrypt.compare(req.body.senha, passwordbanco, (error, validator) => {
                        if (error) { return res.status(401).send({ message: 'Nao autorizado' }) }

                        if (validator) {

                            let token = jwt.sign({
                                id_usuario: idbanco,
                                email: emailbanco
                            }, process.env.SECRET_KEY)

                            return res.status(200).send({
                                Token: token
                            })
                        } else {
                            return res.status(401).send({
                                message: 'Não autorizado (Senha)'
                            })

                        }


                    })
 

                } else {

                    res.status(501).send({
                        msg: "Não autorizado"
                    })

                }



            })


    })



})

module.exports = router;