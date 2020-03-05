const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {

    try {
        
        const token = req.headers.authorization.replace('Bearer ', '')
        const decode = jwt.verify(token, process.env.SECRET_KEY)
     
        next()

    } catch (e) {

        return res.status(401).send({ messagem: "Falha na autenticação" })

    }

}   