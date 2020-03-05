module.exports = io.on('connection', (socket) => {

  console.log('Alguem conectou')

  socket.on('disconnect', () => {

    console.log('Alguem saiu')

  })

  socket.on('enviar', (dados) => {

    enviei(dados)

  })

  const enviei = dados => io.emit('receber', dados)

})