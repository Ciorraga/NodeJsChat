var express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io").listen(server),
    nicknames = {};

// Escucha del servidor para el proyecto en remoto
server.listen(process.env.PORT, process.env.IP);
//Hacemos la línea anterior así porque estamos haciendo nuestro proyecto desde cloud9
//Si lo quisieramos hacer desde nuestro ordenador, habría que poner "server.listen(elpuertoqueutilicemos)"

// Cuando se haga la patecion, devolveremos el index.html
app.get('/', function(request, response){
    response.sendfile(__dirname + '/index.html');
});

// Esta variable se utiliza para almacenar los usuarios conectados
var usuariosOnline = {};

// Un socket nuevo es creado cada vez que se realiza una conexión
io.sockets.on('connection', function(socket){
    //Cuando alguien emite un mensaje en el chat
    socket.on('sendMessage', function(data){
       //Se manda en correspondiente mensaje enviado, junto con el nick del usuario que lo ha mandado
       io.sockets.emit('newMessage', {msg: data, nick: socket.nickname}); 
    });
    
    //Cuando un nuevo usuario se conecta
    socket.on('newUser', function(data, callback) {
        //Si el array que contiene los nicks de usuarios conectados contiene ya el nick que acabamos de introducir el callback se pondra eb false
        if (data in nicknames) {
            callback(false);
        } else {
        //Si no, el callback se pone a true y se añade el usuario al array de usuario            
            callback(true);
            socket.nickname = data;
            nicknames[socket.nickname] = 1;
            updateNickNames();
            //Se emite un mensaje informado del nuevo usuario conectado
            io.sockets.emit('newConnect', {msg: data, nick: socket.nickname});
        }
    });
    //Cuando un usuario se desconecta
    socket.on('disconnect', function(data) {
        //Si el socket.nickname no contiene datos, es que el usuario ha refrescado la página y no esta logueado. Se recargará el formulario de entrada
        if(!socket.nickname) return;
        //Se emite un mensage de desconexión de el usuario que se haya desconectado
        io.sockets.emit('newDisconnect', {msg: data, nick: socket.nickname});
        //Borra el nickname del usuario que se ha desconectado de el array que contiene los usuarios
        delete nicknames[socket.nickname];
        //Actualiza la lista de los nombres de usuario que se muestran al cliente
        updateNickNames();
    });
    
    function updateNickNames() {
        io.sockets.emit('usernames', nicknames);
    }
});



