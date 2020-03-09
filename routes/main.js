require('dotenv').config()
const express = require('express');
const router = express.Router();
const login = require('../middleware/login')
const sql = require("../config/sqlserver")

const multer = require('multer')

const storage = multer.diskStorage({

    destination: function (req, file, cb) {

        cb(null, './imagens/')

    },
    filename: function (req, file, cb) {

        cb(null, new Date().getTime().toString() + file.originalname)

    }
})

const upload = multer({
    storage: storage,
})


router.get('/itgov', (req, res, next) => {

    sql.connect(erro => {

        if (erro) { return res.status(501).send({ messagem: erro.message }) }

        sql.query(`
        SELECT [STATUS], SUM(QTDE) AS TOTAL FROM VW_CT_RESUMO_ITGOV WHERE [STATUS] <> '' GROUP BY [STATUS]
        
        `)
            .then(dados => {

                const result = dados.recordset

                res.status(200).send({
                    results: result
                })

            }).catch(e => {


                res.status(501).send({
                    erro: e.message
                })

            })
    })
})

router.get('/orcamento', (req, res, next) => {

    sql.connect(erro => {

        if (erro) { return res.status(501).send({ messagem: erro.message }) }

        sql.query(`
        select LEFT(DATENAME(MONTH, MES),3) AS MES,  
        CASE WHEN SUM(DEB) > SUM(CRED) THEN ROUND(SUM(CRED)/1000000,1)
        ELSE ROUND(SUM(DEB)/1000000,1) END AS GASTO_LIMITADO,
        CASE WHEN (ROUND((SUM(CRED)/1000000) - (SUM(DEB)/1000000),1)) > 0 THEN
        ROUND((SUM(CRED)/1000000) - (SUM(DEB)/1000000),1) ELSE 0 END AS SALDO_POSITIVO,
        CASE WHEN (ROUND((SUM(CRED)/1000000) - (SUM(DEB)/1000000),1)) < 0 THEN
        ROUND((SUM(CRED)/1000000) - (SUM(DEB)/1000000),1) * -1 ELSE 0 END AS SALDO_NEGATIVO
        from VW_CT_CRED_DEB
        group by MES
        
        `)
            .then(dados => {

                const result = dados.recordset

                res.status(200).send({
                    results: result
                })


            }).catch(e => {


                res.status(501).send({
                    erro: e.message
                })

            })
    })


})

router.get('/itcapacity', (req, res, next) => {

    sql.connect(erro => {

        if (erro) { return res.status(501).send({ messagem: erro.message }) }

        sql.query(`
        SELECT 
        LEFT(DATENAME(MONTH, ID_MES),3) AS MES,
        0 AS CTB,
        ROUND(SUM(RTB),1) AS HORAS
        FROM VW_CT_PLATAFORMA_DRILL_DOWN
        GROUP BY ID_MES
        `)
            .then(dados => {

                const result = dados.recordset

                res.status(200).send({
                    results: result
                })



            }).catch(e => {


                res.status(501).send({
                    erro: e.message
                })



            })
    })


})

router.post('/config', (req, res, next) => {

    console.log(req.body)

    sql.connect(erro => {
        if (erro) { return res.status(501).send({ error: erro.message }) }

        sql.query(`SELECT * FROM TBL_CT_CONFIG_PREMISSAS WHERE ID_MES = '${req.body.id_mes}'`)
            .then(response => {

                if (response.recordset.length == 0) {

                    sql.query(`INSERT INTO TBL_CT_CONFIG_PREMISSAS 
                    VALUES (
                        '${req.body.id_mes}',
                        ${req.body.horas_trabalhadas},
                        ${req.body.ineficiencia},
                        '${req.body.short_friday}',
                        '${req.body.niver}',
                        '${req.body.ferias}',
                        ${req.body.dias_uteis})                       
                        `)
                        .then(responseInsert => {

                            res.status(201).send({
                                msg: "Criado",
                                ano: req.body.id_mes
                            })

                        }).catch(erro => {

                            console.log(erro)
                            res.status(501).send({
                                erro: erro.message
                            })
                        })

                } else {

                    sql.query(`
                    UPDATE TBL_CT_CONFIG_PREMISSAS
                    SET 
                    HORAS_TRABALHADAS = ${req.body.horas_trabalhadas},
                    INEFICIENCIA =  ${req.body.ineficiencia},
                    SHORT_FRIDAY =  '${req.body.short_friday}',
                    DIA_ANIVERSARIO = '${req.body.niver}',
                    FERIAS =  '${req.body.ferias}',          
                    DIAS_UTEIS = ${req.body.dias_uteis}
                    WHERE ID_MES =  '${req.body.id_mes}'`
                    ).then(responseinsert => {

                        res.status(201).send({
                            msg: "Criado",
                            ano: req.body.id_mes
                        })

                    }).catch(erro => {

                        console.log(erro)
                        res.status(501).send({
                            erro: erro.message
                        })
                    })
                }


            }).catch(erro => {

                console.log(erro)
                res.status(501).send({
                    error: erro.message
                })
            })
    })

})

router.get('/config/:ano', (req, res, next) => {


    const ano = req.params.ano;


    sql.connect(erro => {

        if (erro) { return res.status(501).send({ messagem: erro.message }) }

        sql.query(`SELECT * FROM TBL_CT_CONFIG_PREMISSAS WHERE ID_MES LIKE '%${ano}%' `)
            .then(dados => {

                const result = dados.recordset

                res.status(200).send({
                    results: result
                })

            }).catch(e => {


                res.status(501).send({
                    erro: e.message
                })

            })
    })
})

router.get('/vermaisorcamento', (req, res, next) => {

    sql.connect(erro => {

        sql.query(
            `SELECT 
        MES, 
        LOWER(GERENTE) AS GERENTE,
        CASE WHEN [REAL] IS NULL THEN 0 ELSE  [REAL] END AS [REAL]
        FROM VW_CT_RESUMO_OPEX ORDER BY MES DESC`
        ).then(real => {


            sql.query(`SELECT 
        MES,
        LOWER(GERENTE) AS GERENTE,
        ID_BUDGET,
        BUDGET
        FROM VW_CT_RESUMO_BUDGET`)
                .then(budget => {


                    sql.query(`SELECT 
        ID_BUDGET
        from VW_CT_RESUMO_BUDGET
        GROUP BY ID_BUDGET`)
                        .then(select => {

                            res.status(200).send({

                                real: real.recordset,
                                budget: budget.recordset,
                                select: select.recordset

                            })


                        }).catch(erro => {

                            res.status(501).send({
                                error: erro.message
                            })

                        })


                }).catch(erro => {

                    res.status(501).send({
                        error: erro.message
                    })

                })


        }).catch(erro => {

            res.status(501).send({
                error: erro.message
            })

        })


    })



})

router.get('/fornecedores', (req, res, next) => {

    sql.connect(erro => {

        sql.query(
            `
          SELECT
         
        LOWER(GERENTE) GERENTE,
        FORNECEDOR,
        [REAL]
        FROM [dbo].[VW_CT_MAIORES_FORNECEDORES]
        ORDER BY GERENTE ASC, [REAL] DESC
          
          `
        ).then(real => {

            res.status(200).send({
                real: real.recordset
            })

        }).catch(erro => {

            res.status(501).send({
                error: erro.message
            })

        })


    })



})

router.get('/ilon', (req, res, next) => {

    sql.connect(erro => {

        sql.query(
            `
            SELECT  
            LOWER(GERENTE) GERENTE,
            CATEGORIA_ILON AS ILON,
            [REAL]
            FROM [dbo].[VW_CT_OPEX]
            WHERE [REAL] IS NOT NULL
            ORDER BY GERENTE ASC, [REAL] DESC 
          
          `
        ).then(real => {

            res.status(200).send({
                ilon: real.recordset
            })

        }).catch(erro => {

            res.status(501).send({
                error: erro.message
            })

        })


    })



})

router.get('/depre', (req, res, next) => {

    sql.connect(erro => {

        sql.query(
            `
            SELECT       
            LOWER(GERENTE) AS GERENTE,
            OPEX,
            DEPRECIACAO AS DEPRE
            FROM [dbo].[VW_CT_OPEX_X_DEPRECIACAO]
          
          `
        ).then(real => {

            res.status(200).send({
                depre_opex: real.recordset
            })

        }).catch(erro => {

            res.status(501).send({
                error: erro.message
            })

        })


    })



})

router.get('/previsaolanding', (req, res, next) => {



    sql.connect(erro => {

        if(erro){ return res.status(501).send({ erro: erro.message }) }

        sql.query(
            `
            SELECT       
            LOWER(GERENTE) AS GERENTE,
            MES,
            DEB
            FROM [dbo].[VW_CT_CRED_DEB_DRILL_DOWN]
            ORDER BY GERENTE ASC, MES ASC
          `
        ).then(dataReal => {

            real = dataReal.recordset

            sql.query(` 
            SELECT
            LOWER(GERENTE) AS GERENTE,
            AVG(DEB) AS MEDIA
            FROM [dbo].[VW_CT_CRED_DEB_DRILL_DOWN]
            GROUP BY GERENTE
            ORDER BY GERENTE ASC
            
            `).then(dataMedia => {

                media = dataMedia.recordset

                res.status(200).send({

                    resultado_real: dataReal.recordset,
                    resultado_media: dataMedia.recordset

                })

            }).catch(erro => {

                res.status(501).send({
                    error: erro.message
                })
            })

        }).catch(erro => {

            res.status(501).send({
                error: erro.message
            })

        })


    })



})

router.post('/upload', upload.single('document'), (req, res, next) => {

    io.emit('get', { photo: `${process.env.URL_PADRAO}imagens/${req.file.filename}` })
    res.status(200).send({

        //nome: req.body.nome,
        messagem: `${process.env.URL_PADRAO}imagens/${req.file.filename}`

    })
})


module.exports = router;


