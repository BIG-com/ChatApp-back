const express = require('express');
const dotenv = require('dotenv');

dotenv.config({ path: 'serverSet.env' });
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);



io.on('connection', client => {
    console.log(`connection recieved`);

    client.on('joinRoom', ({ username, room }) => {
        const user = userJoin(client.id, username, room);
        client.join(user.room);

        client.broadcast.to(user.room).emit('message', formatMessage(`${user.username}님이 입장하셨습니다.`));
        console.log("[joinRoom] clear until this code : "+ user);

        
        //  room의 정보와 room에 접속해 있는 유저 정보 emit
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room) // ★ 프론트에서 값 확인 ★ (배열)
        });
    });


    client.on('new_message', (chat) => {
        console.log(`new message recieved: ${chat}`);
        io.to(user.room).emit('broadcast', chat);
    })

    client.on('disconnect', () => {
        const user = userLeave(client.id);
        if(user) {
            io.to(user.room).emit('message', formatMessage(`${user.username}님이 퇴장하셨습니다.`));

            //  room의 정보와 room에 접속해 있는 유저 정보 emit
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room) // ★ 프론트에서 값 확인 ★ (배열)
            });
        }
    });
})

app.get('/', (req, res) => {
    res.send('Server is running')
});


const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`server running at ${port}...`)
})




//프론트 모델링에 room 추가하기
//백 인풋데이터를 프론트데이터 객체로 변수명 맞춰주기




